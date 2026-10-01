import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const config = JSON.parse(readFileSync("dist/server/wrangler.json", "utf8"));
assert.equal(config.name, "ztd-homepage");
assert.equal(config.workers_dev, false);
assert.equal(config.preview_urls, false);
assert.deepEqual(config.routes, []);
assert.equal(config.assets.binding, "ASSETS");
assert.equal(config.assets.run_worker_first, true);
assert.ok(config.compatibility_flags.includes("nodejs_compat"));
function hasConfiguration(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.values(value).some(hasConfiguration);
  return Boolean(value);
}
for (const key of ["kv_namespaces", "r2_buckets", "d1_databases", "durable_objects", "services", "queues", "vectorize", "ai", "images", "hyperdrive", "send_email", "workflows", "ai_search", "analytics_engine_datasets", "dispatch_namespaces", "pipelines", "secrets_store_secrets"]) {
  assert.ok(!hasConfiguration(config[key]), `Unexpected addon: ${key}`);
}
assert.ok(existsSync(resolve("dist/server", config.main)), "Worker entry is missing");
assert.ok(existsSync("dist/client/favicon.svg"), "Static assets are missing");
assert.deepEqual(JSON.parse(readFileSync("vercel.json", "utf8")).git.deploymentEnabled, false);
console.log("Build verified: one Worker + ASSETS, no addons, no domain routes, no automatic Vercel deployments.");
