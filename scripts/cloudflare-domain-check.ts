import assert from "node:assert/strict";
import { ACCOUNT_ID, CANONICAL_HOST, LEGACY_WORKER_NAME, WORKER_NAME } from "./deployment-policy.ts";

type WorkerDomain = { hostname: string; service: string; environment: string; zone_name: string; zone_id: string };
type DomainResult = { success?: boolean; result?: WorkerDomain[]; result_info?: { total_pages?: number } };

// GET only. Fail on unavailable permissions, ambiguous results or changed ownership.
// Do not log the token, request headers, raw responses, or a whole-account inventory.
export async function checkCloudflareTarget(
  { accountId, token, after = false }: { accountId?: string; token?: string; after?: boolean },
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
  const canonical = await read({ hostname: CANONICAL_HOST });
  assert.equal(canonical.length, 1, "ztd.me must already be exactly one verified Custom Domain; do not replace unrelated DNS");
  const domain = canonical[0];
  assert.equal(domain.hostname, CANONICAL_HOST);
  assert.equal(domain.zone_name, CANONICAL_HOST);
  assert.match(domain.zone_id, /^[a-f0-9]{32}$/);
  assert.equal(domain.environment, "production");
  assert.ok(after ? domain.service === WORKER_NAME : [LEGACY_WORKER_NAME, WORKER_NAME].includes(domain.service), "Unexpected ztd.me owner; stop for review");

  const targets = await read({ service: WORKER_NAME });
  assert.ok(targets.every(target => target.hostname === CANONICAL_HOST && target.service === WORKER_NAME && target.environment === "production"), "New Worker has unapproved domains; do not remove or replace them");
  assert.ok(targets.length <= 1, "New Worker domain state is ambiguous");
  if (after) assert.equal(targets.length, 1, "Deployment did not attach ztd.me");
  return domain.service;
}
