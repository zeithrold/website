import { assertReleaseRequest } from "./deployment-policy.ts";

assertReleaseRequest({
  ref: process.env.GITHUB_REF,
  actualCommit: process.env.GITHUB_SHA,
  expectedCommit: process.env.EXPECTED_COMMIT,
  enabled: process.env.DEPLOY_ENABLED,
  confirmation: process.env.DEPLOY_CONFIRMATION,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
});
console.log("Release authorized: reviewed main SHA, approved account, ztd.me-only phase.");
