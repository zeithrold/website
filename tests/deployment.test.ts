import assert from "node:assert/strict";
import { test } from "node:test";
import { ACCOUNT_ID, CONFIRMATION, EXPECTED_ROUTES, assertDeploymentConfig, assertReleaseRequest } from "../scripts/deployment-policy.ts";
import { checkCloudflareTarget } from "../scripts/cloudflare-domain-check.ts";

const configuration = () => ({
  name: "ztd-homepage", workers_dev: false, preview_urls: false,
  routes: structuredClone(EXPECTED_ROUTES),
  assets: { binding: "ASSETS", run_worker_first: true }, compatibility_flags: ["nodejs_compat"],
});
const release = () => ({
  ref: "refs/heads/main", actualCommit: "b".repeat(40), expectedCommit: "b".repeat(40),
  enabled: "true", confirmation: CONFIRMATION, accountId: ACCOUNT_ID,
});

test("canonical deployment accepts exactly the reviewed ztd.me target", () => {
  assert.doesNotThrow(() => assertDeploymentConfig(configuration()));
  assert.doesNotThrow(() => assertReleaseRequest(release()));
});

test("empty routes, extra aliases, wildcards and protected domains cannot pass the canonical build", () => {
  assert.throws(() => assertDeploymentConfig({ ...configuration(), routes: [] }));
  for (const host of ["doa.ink", "zeithrold.dev", "www.zeithrold.dev", "ztd.one", "*.ztd.me", "blog.ztd.me", "showcase.ztd.me", "zeithrold.cloud", "zeithrold.com"]) {
    const route = { pattern: host, custom_domain: true, enabled: true, previews_enabled: false };
    assert.throws(() => assertDeploymentConfig({ ...configuration(), routes: [route] }), host);
    assert.throws(() => assertDeploymentConfig({ ...configuration(), routes: [...EXPECTED_ROUTES, route] }), host);
  }
});

test("previews, another Worker/account, addons and nested environment overrides fail closed", () => {
  for (const change of [
    { workers_dev: true }, { preview_urls: true }, { name: "doaink-home" }, { account_id: "c".repeat(32) },
    { routes: [{ ...EXPECTED_ROUTES[0], previews_enabled: true }] },
    { routes: [{ ...EXPECTED_ROUTES[0], enabled: false }] },
    { route: "doa.ink/*" }, { services: [{ binding: "OTHER", service: "old" }] },
    { durable_objects: { bindings: [{ name: "DB", class_name: "Storage" }] } },
    { triggers: { crons: ["0 * * * *"] } }, { env: { staging: { routes: EXPECTED_ROUTES } } },
  ]) assert.throws(() => assertDeploymentConfig({ ...configuration(), ...change }));
});

test("the old confirmation, stale approval, incorrect switch and branch cannot authorize this phase", () => {
  for (const change of [
    { confirmation: "DEPLOY_WORKER_ONLY" }, { confirmation: "DEPLOY_ZTD_ME_ONLY " },
    { ref: "refs/heads/feat/ztd-me-custom-domain" }, { enabled: "TRUE" }, { enabled: "" },
    { expectedCommit: "b0b2e2c" }, { expectedCommit: "" }, { expectedCommit: "a".repeat(40) },
    { actualCommit: "c".repeat(40) }, { accountId: "" }, { accountId: "a".repeat(32) },
  ]) assert.throws(() => assertReleaseRequest({ ...release(), ...change }));
});

const domain = (service = "doaink-home") => ({
  hostname: "ztd.me", service, environment: "production", zone_name: "ztd.me", zone_id: "a".repeat(32),
});
const fakeToken = "test-token-never-uploaded";
function respond(results: unknown[]) {
  let count = 0;
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://api.cloudflare.com");
    assert.equal(url.pathname, `/client/v4/accounts/${ACCOUNT_ID}/workers/domains`);
    assert.equal(init?.method, "GET");
    assert.equal(init?.redirect, "error");
    assert.equal(new Headers(init?.headers).get("authorization"), `Bearer ${fakeToken}`);
    assert.equal(url.search, count === 0 ? "?hostname=ztd.me" : "?service=ztd-homepage");
    return Response.json({ success: true, result: results[count++] });
  };
  return fetcher;
}

test("domain preflight reads only the exact host/new Worker and supports a coordinated reassignment", async () => {
  assert.equal(await checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, respond([[domain()], []])), "doaink-home");
  assert.equal(await checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, respond([[domain("ztd-homepage")], [domain("ztd-homepage")]])), "ztd-homepage");
  assert.equal(await checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken, after: true }, respond([[domain("ztd-homepage")], [domain("ztd-homepage")]])), "ztd-homepage");
});

test("unexpected ownership, missing Custom Domain, zone mismatch or extra targets stop deployment", async () => {
  for (const results of [
    [[], []], [[domain("other-worker")], []], [[{ ...domain(), zone_name: "doa.ink" }], []],
    [[{ ...domain(), environment: "staging" }], []], [[domain(), domain()], []],
    [[domain()], [{ ...domain("ztd-homepage"), hostname: "doa.ink" }]],
  ]) await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, respond(results)));
});

test("post-check requires the new binding; an uploaded Worker alone is insufficient", async () => {
  await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken, after: true }, respond([[domain()], []])));
  await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken, after: true }, respond([[domain("ztd-homepage")], []])));
});

test("HTTP 403 stops after one read without retrying or exposing token/response content", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return new Response(fakeToken, { status: 403 }); };
  await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, fetcher), error => {
    assert.match(String(error), /HTTP 403/);
    assert.equal(String(error).includes(fakeToken), false);
    return true;
  });
  assert.equal(calls, 1);
});

test("invalid credentials, network errors, malformed and paginated responses fail closed", async () => {
  const unused: typeof fetch = async () => { throw new Error("This must not be called"); };
  await assert.rejects(checkCloudflareTarget({ accountId: "wrong", token: fakeToken }, unused));
  await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID }, unused));
  for (const fetcher of [
    async () => { throw new Error(fakeToken); },
    async () => new Response("not JSON"),
    async () => Response.json({ success: false, result: [] }),
    async () => Response.json({ success: true, result: [domain()], result_info: { total_pages: 2 } }),
  ]) await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, fetcher), error => !String(error).includes(fakeToken));
});
