import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { assertDeploymentConfig } from "./deployment-policy.ts";

const config = JSON.parse(readFileSync("dist/server/wrangler.json", "utf8"));
assertDeploymentConfig(config);
assert.ok(!readdirSync("dist/server").some(name => name.startsWith("wrangler.local-")), "Stop local emulation and remove its temporary config before packaging the deploy artifact");
assert.ok(existsSync(resolve("dist/server", config.main)), "Worker entry is missing");
assert.ok(existsSync("dist/client/favicon.svg"), "Static assets are missing");
assert.deepEqual(JSON.parse(readFileSync("vercel.json", "utf8")).git.deploymentEnabled, false);
console.log("Build verified: one Worker + ASSETS, exactly five approved Custom Domains, no extra hosts/addons/previews or automatic Vercel deployments.");
