import assert from "node:assert/strict";
import { ACCOUNT_ID, EXPECTED_ROUTES, WORKER_NAME } from "./deployment-policy.ts";

type WorkerDomain = { hostname: string; service: string; environment: string; zone_name: string; zone_id: string };
type DomainResult = { success?: boolean; result?: WorkerDomain[]; result_info?: { total_pages?: number } };

// GET only. Fail on unavailable permissions, ambiguous results or changed ownership.
// Do not log the token, request headers, raw responses, or a whole-account inventory.
export async function checkCloudflareTarget(
  { accountId, token }: { accountId?: string; token?: string },
  fetcher: typeof fetch = fetch,
): Promise<string> {
  assert.equal(accountId, ACCOUNT_ID, "Unexpected Cloudflare account");
  assert.ok(token, "The existing CLOUDFLARE_API_TOKEN secret is required");
  async function read(query: Record<string, string>): Promise<WorkerDomain[]> {
    const url = new URL(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/domains`);
    url.search = new URLSearchParams(query).toString();
    let response: Response;
    try {
      response = await fetcher(url, {
        method: "GET", headers: { Authorization: `Bearer ${token}` },
        redirect: "error", signal: AbortSignal.timeout(15000),
      });
    } catch {
      throw new Error("Cloudflare domain read failed; stop and inspect connectivity/access without printing credentials");
    }
    if (!response.ok) throw new Error(`Cloudflare domain read returned HTTP ${response.status}; stop without changing permissions`);
    let body: DomainResult;
    try { body = await response.json() as DomainResult; }
    catch { throw new Error("Cloudflare domain response was not JSON; stop before deployment"); }
    assert.ok(body && body.success === true && Array.isArray(body.result), "Cloudflare domain response could not be verified");
    assert.ok((body.result_info?.total_pages ?? 1) <= 1, "Paginated domain state requires manual review");
    return body.result;
  }
  const hosts = EXPECTED_ROUTES.map(route => route.pattern);
  const owners: string[] = [];
  for (const host of hosts) {
    const records = await read({ hostname: host });
    assert.equal(records.length, 1, `Required ${host} Custom Domain is missing or ambiguous`);
    const [domain] = records;
    assert.ok(domain !== undefined, `Required ${host} Custom Domain is missing`);
    assert.equal(domain.hostname, host);
    assert.equal(domain.zone_name, host === "www.zeithrold.dev" ? "zeithrold.dev" : host);
    assert.match(domain.zone_id, /^[a-f0-9]{32}$/);
    assert.equal(domain.environment, "production");
    assert.equal(domain.service, WORKER_NAME, `Unexpected ${host} owner; stop for review`);
    owners.push(`${host}: ${domain.service}`);
  }

  const targets = await read({ service: WORKER_NAME });
  assert.ok(targets.every(target => hosts.includes(target.hostname) && target.service === WORKER_NAME && target.environment === "production"), "Worker has unapproved domains; do not remove or replace them");
  assert.equal(new Set(targets.map(target => target.hostname)).size, targets.length, "Worker domain state is ambiguous");
  assert.deepEqual(targets.map(target => target.hostname).sort(), [...hosts].sort(), "Worker must keep exactly the five existing hosts");
  return owners.join("; ");
}
