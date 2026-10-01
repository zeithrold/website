import { checkCloudflareTarget } from "./cloudflare-domain-check.ts";

try {
  const owner = await checkCloudflareTarget({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
    after: process.argv.includes("--after"),
  });
  console.log(`Verified approved Custom Domain owners: ${owner}; no extra ztd-homepage domains.`);
} catch (error) {
  // A failed post-check does not roll back automatically: the coordinator must
  // inspect the live bindings and execute the documented alias-only rollback.
  console.error(error instanceof Error ? error.message : "Cloudflare target verification failed");
  process.exitCode = 1;
}
