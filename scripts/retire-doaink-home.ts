import assert from "node:assert/strict";
import { ACCOUNT_ID, EXPECTED_ROUTES, LEGACY_WORKER_NAME, WORKER_NAME } from "./deployment-policy.ts";

export const RETIRE_CONFIRMATION = "DELETE_DOAINK_HOME_PERMANENTLY";
const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers`;
type Domain = { id: string; hostname: string; service: string; environment: string; zone_id: string };
type Binding = { type: string };
type References = { services?: { incoming: unknown[]; pages_function?: boolean }; durable_objects?: unknown[]; dispatch_outbounds?: unknown[] };
type Service = { id: string; default_environment: { environment: string }; environments: { environment: string }[] };

// The target, account and DELETE URL are fixed. No resource name is accepted as input.
export async function retireDoainkHome(
  request: { token?: string; accountId?: string; confirmation?: string },
  fetcher: typeof fetch = fetch,
): Promise<{ deleted: boolean; alreadyAbsent: boolean; workersDev?: boolean }> {
  assert.equal(ACCOUNT_ID, "a0df2e968b524bdd77c0eab565058522");
  assert.equal(LEGACY_WORKER_NAME, "doaink-home");
  assert.equal(WORKER_NAME, "ztd-homepage");
  assert.equal(request.accountId, ACCOUNT_ID, "Use only the approved Cloudflare account");
  assert.ok(request.token, "The existing CLOUDFLARE_API_TOKEN secret is required");
  const deleting = request.confirmation === RETIRE_CONFIRMATION;
  assert.ok(deleting || request.confirmation === "CHECK_ONLY", "Invalid retirement confirmation");

  async function read<T>(path: string): Promise<T> {
    let response: Response;
    try {
      response = await fetcher(`${BASE}${path}`, {
        method: "GET", redirect: "error", signal: AbortSignal.timeout(15_000),
        headers: { Authorization: `Bearer ${request.token}` },
      });
    } catch { throw new Error(`Cloudflare GET ${path} failed; stop and do not retry mutations`); }
    assert.ok(response.ok, `Cloudflare GET ${path}: HTTP ${response.status}; stop without changing credentials`);
    let body: { success?: boolean; result?: T; result_info?: { total_pages?: number } };
    try { body = await response.json(); }
    catch { throw new Error(`Invalid Cloudflare JSON for GET ${path}; stop`); }
    assert.equal(body.success, true, `Cloudflare GET ${path} did not succeed`);
    assert.ok((body.result_info?.total_pages ?? 1) <= 1, "Paginated state needs manual review");
    assert.notEqual(body.result, undefined, `Cloudflare GET ${path} returned no result`);
    return body.result as T;
  }

  function verifyDomains(domains: Domain[]) {
    assert.ok(Array.isArray(domains), "Invalid domain list");
    assert.equal(domains.filter(domain => domain.service === LEGACY_WORKER_NAME).length, 0, "Old Worker still has Custom Domains");
    const approved = domains.filter(domain => domain.service === WORKER_NAME);
    assert.deepEqual(approved.map(domain => domain.hostname).sort(), EXPECTED_ROUTES.map(route => route.pattern).sort(), "New Worker must retain exactly five approved domains");
    assert.ok(approved.every(domain => domain.environment === "production"), "Unexpected new Worker environment");
    for (const host of ["blog.ztd.me", "showcase.ztd.me"]) {
      assert.equal(domains.filter(domain => domain.hostname === host).length, 1, `${host} binding must be present`);
    }
  }
  const domainSnapshot = (domains: Domain[]) => domains.map(({ id, hostname, service, environment, zone_id }) => ({ id, hostname, service, environment, zone_id })).sort((a, b) => a.id.localeCompare(b.id));
  const beforeDomains = await read<Domain[]>("/domains");
  verifyDomains(beforeDomains);
  const beforeScripts = await read<{ id: string }[]>("/scripts");
  assert.ok(Array.isArray(beforeScripts) && beforeScripts.some(script => script.id === WORKER_NAME), "New Worker must exist");
  if (!beforeScripts.some(script => script.id === LEGACY_WORKER_NAME)) {
    return { deleted: false, alreadyAbsent: true };
  }

  const service = await read<Service>(`/services/${LEGACY_WORKER_NAME}`);
  assert.equal(service.id, LEGACY_WORKER_NAME, "Wrong legacy service identity");
  assert.equal(service.default_environment.environment, "production", "Unexpected legacy default environment");
  assert.deepEqual(service.environments.map(environment => environment.environment), ["production"], "Other legacy environments require review");
  const routes = await read<unknown[]>(`/services/${LEGACY_WORKER_NAME}/environments/production/routes?show_zonename=true`);
  assert.ok(Array.isArray(routes) && routes.length === 0, "Old Worker still has routes");
  const subdomain = await read<{ enabled: boolean }>(`/services/${LEGACY_WORKER_NAME}/environments/production/subdomain`);
  assert.equal(typeof subdomain.enabled, "boolean", "Unknown workers.dev state");
  const settings = await read<{ bindings: Binding[]; tail_consumers?: unknown[]; logpush?: boolean; triggers?: { events?: unknown[] } }>(`/scripts/${LEGACY_WORKER_NAME}/settings`);
  assert.ok(Array.isArray(settings.bindings), "Unknown binding state");
  assert.ok(settings.bindings.every(binding => ["assets", "plain_text", "secret_text", "version_metadata"].includes(binding.type)), "Old Worker has other resources/integrations; review before deletion");
  assert.equal(settings.tail_consumers?.length ?? 0, 0, "Old Worker has tail integrations");
  assert.ok(!settings.logpush, "Old Worker has a Logpush integration");
  assert.equal(settings.triggers?.events?.length ?? 0, 0, "Old Worker has event triggers");
  const schedules = await read<{ schedules: unknown[] }>(`/scripts/${LEGACY_WORKER_NAME}/schedules`);
  assert.ok(Array.isArray(schedules.schedules) && schedules.schedules.length === 0, "Old Worker still has Cron triggers");
  const references = await read<References>(`/scripts/${LEGACY_WORKER_NAME}/references`);
  const unknownCategories = Object.keys(references).filter(key => !["services", "durable_objects", "dispatch_outbounds"].includes(key));
  assert.equal(unknownCategories.length, 0, `Unknown dependency categories require review: ${unknownCategories.join(", ")}`);
  assert.equal(references.services?.incoming.length ?? 0, 0, "Other Workers reference the old Worker");
  assert.ok(!references.services?.pages_function, "Pages references the old Worker");
  assert.equal(references.durable_objects?.length ?? 0, 0, "Old Worker has Durable Object references/resources");
  assert.equal(references.dispatch_outbounds?.length ?? 0, 0, "Old Worker is a dispatch outbound");
  const tails = await read<unknown[]>(`/tails/by-consumer/${LEGACY_WORKER_NAME}`);
  assert.ok(Array.isArray(tails) && tails.length === 0, "Old Worker is a Tail consumer");

  // A fetch-only version cannot process queue, email, scheduled or other event handlers.
  const deployments = await read<{ deployments: { versions: { version_id: string }[] }[] }>(`/scripts/${LEGACY_WORKER_NAME}/deployments`);
  const versions = deployments.deployments[0]?.versions;
  assert.ok(Array.isArray(versions) && versions.length === 1, "Unexpected legacy active deployment");
  const versionId = versions[0].version_id;
  assert.match(versionId, /^[a-f0-9-]{36}$/, "Invalid version ID");
  const version = await read<{ resources: { script: { handlers: string[] } } }>(`/scripts/${LEGACY_WORKER_NAME}/versions/${versionId}`);
  assert.deepEqual(version.resources.script.handlers, ["fetch"], "Old Worker has other event handlers/integrations");

  console.log(`Preflight passed: only ${LEGACY_WORKER_NAME}; no domains/routes/Cron/references/resource integrations; workers.dev=${subdomain.enabled}.`);
  if (!deleting) return { deleted: false, alreadyAbsent: false, workersDev: subdomain.enabled };

  // Refresh ownership immediately before deletion. Never detach domains or touch DNS.
  assert.deepEqual(domainSnapshot(await read<Domain[]>("/domains")), domainSnapshot(beforeDomains), "Bindings changed during preflight; stop");
  let response: Response;
  try {
    response = await fetcher(`${BASE}/scripts/doaink-home?force=false`, {
      method: "DELETE", redirect: "error", signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${request.token}` },
    });
  } catch { throw new Error("Deletion outcome is uncertain; do not retry. Inspect the script list read-only."); }
  assert.ok(response.ok, `DELETE doaink-home: HTTP ${response.status}; do not retry or force`);
  let text: string;
  try { text = await response.text(); }
  catch { throw new Error("Deletion response could not be read; do not retry. Inspect the script list read-only."); }
  if (text) {
    let body: { success?: boolean };
    try { body = JSON.parse(text); }
    catch { throw new Error("Deletion response is unreadable; do not retry. Inspect the script list read-only."); }
    assert.equal(body.success, true, "Deletion was not confirmed; do not retry");
  }

  const afterScripts = await read<{ id: string }[]>("/scripts");
  assert.ok(!afterScripts.some(script => script.id === LEGACY_WORKER_NAME), "Old Worker is still listed; do not repeat DELETE");
  assert.deepEqual(afterScripts.map(script => script.id).sort(), beforeScripts.filter(script => script.id !== LEGACY_WORKER_NAME).map(script => script.id).sort(), "Unexpected change to other Workers");
  const afterDomains = await read<Domain[]>("/domains");
  verifyDomains(afterDomains);
  assert.deepEqual(domainSnapshot(afterDomains), domainSnapshot(beforeDomains), "Domain bindings changed after deletion; stop for review");
  return { deleted: true, alreadyAbsent: false, workersDev: subdomain.enabled };
}
