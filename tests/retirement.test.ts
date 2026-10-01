import assert from "node:assert/strict";
import { test } from "node:test";
import { ACCOUNT_ID, EXPECTED_ROUTES } from "../scripts/deployment-policy.ts";
import { RETIRE_CONFIRMATION, retireDoainkHome } from "../scripts/retire-doaink-home.ts";

const request = (confirmation = "CHECK_ONLY") => ({ accountId: ACCOUNT_ID, token: "fake-retirement-token", confirmation });
const versionId = "11111111-1111-1111-1111-111111111111";
const domains = [
  ...EXPECTED_ROUTES.map((route, i) => ({ id: String(i), hostname: route.pattern, service: "ztd-homepage", environment: "production", zone_id: "a".repeat(32) })),
  { id: "blog", hostname: "blog.ztd.me", service: "blog", environment: "production", zone_id: "a".repeat(32) },
  { id: "showcase", hostname: "showcase.ztd.me", service: "showcase", environment: "production", zone_id: "a".repeat(32) },
];

function api(options: { absent?: boolean; dependency?: boolean; forbidden?: boolean; uncertain?: boolean; stillListed?: boolean; resource?: boolean; unknownCategory?: boolean; domainReference?: boolean; malformedDomains?: boolean } = {}) {
  const calls: { path: string; method: string }[] = [];
  let deleted = !!options.absent;
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://api.cloudflare.com");
    const prefix = `/client/v4/accounts/${ACCOUNT_ID}/workers`;
    assert.ok(url.pathname.startsWith(prefix));
    const path = url.pathname.slice(prefix.length) + url.search;
    const method = init?.method ?? "GET";
    calls.push({ path, method });
    assert.equal(init?.redirect, "error");
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer fake-retirement-token");
    if (options.forbidden) return new Response("do not log API response or token", { status: 403 });
    if (method === "DELETE") {
      assert.equal(path, "/scripts/doaink-home?force=false");
      if (options.uncertain) throw new Error("transport failed");
      deleted = !options.stillListed;
      return new Response(null, { status: 204 });
    }
    assert.equal(method, "GET");
    const results: Record<string, unknown> = {
      "/domains": domains,
      "/scripts": ["ztd-homepage", "blog", "showcase", ...(!deleted ? ["doaink-home"] : [])].map(id => ({ id })),
      "/services/doaink-home": { id: "doaink-home", default_environment: { environment: "production" }, environments: [{ environment: "production" }] },
      "/services/doaink-home/environments/production/routes?show_zonename=true": [],
      "/services/doaink-home/environments/production/subdomain": { enabled: true },
      "/scripts/doaink-home/settings": { bindings: [{ type: options.resource ? "kv_namespace" : "assets" }], tail_consumers: [], logpush: false },
      "/scripts/doaink-home/schedules": { schedules: [] },
      "/scripts/doaink-home/references": { services: { incoming: options.dependency ? [{ service: "another-worker" }] : [], pages_function: false }, domains: options.malformedDomains ? {} : options.domainReference ? [{ hostname: "still-attached.example" }] : [], durable_objects: [], dispatch_outbounds: [], ...(options.unknownCategory ? { unreviewed_dependency: [] } : {}) },
      "/tails/by-consumer/doaink-home": [],
      "/scripts/doaink-home/deployments": { deployments: [{ versions: [{ version_id: versionId }] }] },
      [`/scripts/doaink-home/versions/${versionId}`]: { resources: { script: { handlers: ["fetch"] } } },
    };
    assert.ok(path in results, `Unexpected read ${path}`);
    return Response.json({ success: true, result: results[path] });
  };
  return { fetcher, calls };
}

test("retirement check is read-only and inspects the fixed old Worker", async () => {
  const fake = api();
  assert.deepEqual(await retireDoainkHome(request(), fake.fetcher), { deleted: false, alreadyAbsent: false, workersDev: true });
  assert.ok(fake.calls.every(call => call.method === "GET"));
});

test("permanent retirement sends exactly one fixed DELETE with force=false and verifies absence", async () => {
  const fake = api();
  assert.equal((await retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher)).deleted, true);
  assert.deepEqual(fake.calls.filter(call => call.method !== "GET"), [{ path: "/scripts/doaink-home?force=false", method: "DELETE" }]);
  assert.deepEqual(fake.calls.slice(-2).map(call => call.path), ["/scripts", "/domains"]);
});

test("an already absent old Worker never produces DELETE", async () => {
  const fake = api({ absent: true });
  assert.equal((await retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher)).alreadyAbsent, true);
  assert.ok(fake.calls.every(call => call.method === "GET"));
});

test("permission failures, incoming references and other resource bindings stop before DELETE", async () => {
  for (const options of [{ forbidden: true }, { dependency: true }, { resource: true }, { unknownCategory: true }, { domainReference: true }, { malformedDomains: true }]) {
    const fake = api(options);
    const attempt = retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher);
    if (options.unknownCategory) await assert.rejects(attempt, /Unknown dependency categories require review: unreviewed_dependency/);
    else await assert.rejects(attempt);
    assert.ok(fake.calls.every(call => call.method === "GET"));
  }
});

test("uncertain deletion and failed absence verification do not repeat DELETE", async () => {
  for (const options of [{ uncertain: true }, { stillListed: true }]) {
    const fake = api(options);
    await assert.rejects(retireDoainkHome(request(RETIRE_CONFIRMATION), fake.fetcher), /do not retry|do not repeat DELETE/);
    assert.equal(fake.calls.filter(call => call.method === "DELETE").length, 1);
  }
});

test("another account or unapproved confirmation cannot issue any request", async () => {
  const fake = api();
  await assert.rejects(retireDoainkHome({ ...request(), accountId: "b".repeat(32) }, fake.fetcher));
  await assert.rejects(retireDoainkHome(request("DELETE_ZTD_HOMEPAGE"), fake.fetcher));
  assert.equal(fake.calls.length, 0);
});
