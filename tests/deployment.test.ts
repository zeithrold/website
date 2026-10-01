import assert from "node:assert/strict";
import { test } from "node:test";
import { ACCOUNT_ID, EXPECTED_ROUTES, assertDeploymentConfig, assertReleaseRequest } from "../scripts/deployment-policy.ts";
import { checkCloudflareTarget } from "../scripts/cloudflare-domain-check.ts";
import { REDIRECT_HOSTS } from "../lib/routing.ts";

const configuration = () => ({
  name: "ztd-homepage", workers_dev: false, preview_urls: false,
  routes: structuredClone(EXPECTED_ROUTES),
  assets: { binding: "ASSETS", run_worker_first: true }, compatibility_flags: ["nodejs_compat"],
});
const release = () => ({
  repository: "zeithrold/website", eventName: "push", ref: "refs/heads/main",
  actualCommit: "b".repeat(40), accountId: ACCOUNT_ID,
});

test("deployment accepts exactly ztd.me and the four approved redirect aliases", () => {
  assert.doesNotThrow(() => assertDeploymentConfig(configuration()));
  assert.doesNotThrow(() => assertReleaseRequest(release()));
  assert.deepEqual(EXPECTED_ROUTES.slice(1).map(route => route.pattern), [...REDIRECT_HOSTS]);
});

test("missing approved routes, extra hosts, wildcards and protected domains cannot pass the alias build", () => {
  assert.throws(() => assertDeploymentConfig({ ...configuration(), routes: [] }));
  assert.throws(() => assertDeploymentConfig({ ...configuration(), routes: EXPECTED_ROUTES.slice(0, 1) }));
  for (const host of ["www.doa.ink", "www.ztd.one", "*.ztd.me", "blog.ztd.me", "showcase.ztd.me", "zeithrold.cloud", "zeithrold.com"]) {
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

test("only a main push with a workflow commit to the existing repository and account can deploy", () => {
  for (const change of [
    { repository: "other/website" }, { repository: "" },
    { eventName: "pull_request" }, { eventName: "workflow_dispatch" }, { eventName: "workflow_run" }, { eventName: "" },
    { ref: "refs/heads/feature" }, { ref: "refs/tags/main" }, { ref: "" },
    { actualCommit: "b0b2e2c" }, { actualCommit: "" }, { actualCommit: "g".repeat(40) },
    { accountId: "" }, { accountId: "a".repeat(32) },
  ]) assert.throws(() => assertReleaseRequest({ ...release(), ...change }));
});

const domain = (hostname = "ztd.me", service = "ztd-homepage") => ({
  hostname, service, environment: "production", zone_name: hostname === "www.zeithrold.dev" ? "zeithrold.dev" : hostname, zone_id: "a".repeat(32),
});
const allDomains = () => EXPECTED_ROUTES.map(route => domain(route.pattern));
const fakeToken = "test-token-never-uploaded";
function respond(records = allDomains(), targets = allDomains()) {
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://api.cloudflare.com");
    assert.equal(url.pathname, `/client/v4/accounts/${ACCOUNT_ID}/workers/domains`);
    assert.equal(init?.method, "GET");
    assert.equal(init?.redirect, "error");
    assert.equal(new Headers(init?.headers).get("authorization"), `Bearer ${fakeToken}`);
    const hostname = url.searchParams.get("hostname");
    if (hostname) assert.ok(EXPECTED_ROUTES.some(route => route.pattern === hostname));
    else assert.equal(url.search, "?service=ztd-homepage");
    return Response.json({ success: true, result: hostname ? records.filter(record => record.hostname === hostname) : targets });
  };
  return fetcher;
}

test("domain checks require all five existing production hosts on ztd-homepage", async () => {
  const owners = await checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, respond());
  assert.equal(owners, EXPECTED_ROUTES.map(route => `${route.pattern}: ztd-homepage`).join("; "));
});

test("unexpected ownership, missing Custom Domain, zone mismatch or extra targets stop deployment", async () => {
  for (const [records, targets] of [
    [[], []], [[domain("ztd.me", "doaink-home")], [domain()]],
    [[{ ...domain(), zone_name: "doa.ink" }], [domain()]],
    [[{ ...domain(), environment: "staging" }], [domain()]], [[domain(), domain()], [domain()]],
    [allDomains(), [...allDomains(), domain("blog.ztd.me")]],
    [[domain(), domain("doa.ink", "other-worker")], [domain()]],
  ]) await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, respond(records, targets)));
});

test("missing aliases or legacy owners stop routine deployment before any binding transfer", async () => {
  await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, respond([domain()], [domain()])));
  await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, respond(allDomains(), [domain()])));
  await assert.rejects(checkCloudflareTarget({ accountId: ACCOUNT_ID, token: fakeToken }, respond(allDomains().map(record => record.hostname === "doa.ink" ? { ...record, service: "doaink-home" } : record))));
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
