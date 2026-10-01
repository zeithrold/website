import { checkCloudflareTarget } from "./cloudflare-domain-check.ts";

try {
  const owner = await checkCloudflareTarget({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
    after: process.argv.includes("--after"),
  });
  console.log(`Verified ztd.me Custom Domain owner: ${owner}; no extra ztd-homepage domains.`);
} catch (error) {
  // A failed post-check does not roll back automatically: the coordinator must
  // inspect the live binding and execute the documented ztd.me-only rollback.
  console.error(error instanceof Error ? error.message : "Cloudflare target verification failed");
  process.exitCode = 1;
}
