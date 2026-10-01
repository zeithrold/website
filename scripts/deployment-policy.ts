import assert from "node:assert/strict";

export const ACCOUNT_ID = "a0df2e968b524bdd77c0eab565058522";
export const WORKER_NAME = "ztd-homepage";
export const LEGACY_WORKER_NAME = "doaink-home";
export const CANONICAL_HOST = "ztd.me";
export const CONFIRMATION = "DEPLOY_ZTD_ME_AND_ALIASES";
export const EXPECTED_ROUTES = [
  { pattern: CANONICAL_HOST, custom_domain: true, enabled: true, previews_enabled: false },
  { pattern: "doa.ink", custom_domain: true, enabled: true, previews_enabled: false },
  { pattern: "zeithrold.dev", custom_domain: true, enabled: true, previews_enabled: false },
  { pattern: "www.zeithrold.dev", custom_domain: true, enabled: true, previews_enabled: false },
  { pattern: "ztd.one", custom_domain: true, enabled: true, previews_enabled: false },
];

export type DeploymentConfig = {
  name?: unknown;
  account_id?: unknown;
  workers_dev?: unknown;
  preview_urls?: unknown;
  routes?: unknown;
  assets?: { binding?: unknown; run_worker_first?: unknown };
  compatibility_flags?: unknown;
  [key: string]: unknown;
};

function hasConfiguration(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.values(value).some(hasConfiguration);
  return Boolean(value);
}

export function assertDeploymentConfig(config: DeploymentConfig): void {
  assert.equal(config.name, WORKER_NAME, "Only the approved Worker may be deployed");
  if (config.account_id !== undefined) assert.equal(config.account_id, ACCOUNT_ID);
  assert.equal(config.workers_dev, false, "workers.dev must stay disabled");
  assert.equal(config.preview_urls, false, "Preview URLs must stay disabled");
  assert.deepEqual(config.routes, EXPECTED_ROUTES, "Alias phase requires exactly the five approved hosts; extra hosts and wildcards are forbidden");
  assert.equal(config.route, undefined, "Do not override the approved routes with the singular route field");
  assert.equal(config.assets?.binding, "ASSETS");
  assert.equal(config.assets?.run_worker_first, true);
  assert.ok(Array.isArray(config.compatibility_flags) && config.compatibility_flags.includes("nodejs_compat"));
  for (const key of ["kv_namespaces", "r2_buckets", "d1_databases", "durable_objects", "services", "queues", "vectorize", "ai", "images", "hyperdrive", "send_email", "workflows", "ai_search", "analytics_engine_datasets", "dispatch_namespaces", "pipelines", "secrets_store_secrets", "triggers", "env"]) {
    assert.ok(!hasConfiguration(config[key]), `Unexpected addon, trigger or environment: ${key}`);
  }
}

export type ReleaseRequest = {
  ref?: string;
  actualCommit?: string;
  expectedCommit?: string;
  enabled?: string;
  confirmation?: string;
  accountId?: string;
};

export function assertReleaseRequest(request: ReleaseRequest): void {
  assert.equal(request.ref, "refs/heads/main", "Dispatch from main only");
  assert.equal(request.enabled, "true", "Repository variable WEBSITE_DEPLOY_ENABLED must be exactly true");
  assert.equal(request.confirmation, CONFIRMATION, `Confirmation must be ${CONFIRMATION}`);
  assert.match(request.expectedCommit ?? "", /^[a-f0-9]{40}$/, "expected_commit must be the full reviewed main SHA");
  assert.equal(request.actualCommit, request.expectedCommit, "main moved: review the new commit before dispatching");
  assert.equal(request.accountId, ACCOUNT_ID, "CLOUDFLARE_ACCOUNT_ID must match the approved account");
}
