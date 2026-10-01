import { retireDoainkHome } from "./retire-doaink-home.ts";

try {
  const result = await retireDoainkHome({
    token: process.env.CLOUDFLARE_API_TOKEN,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    confirmation: process.env.RETIRE_CONFIRMATION,
  });
  console.log(result.alreadyAbsent ? "doaink-home is already absent; no deletion was attempted." : result.deleted ? "Verified: doaink-home deleted, all other Workers and Custom Domains unchanged." : "CHECK_ONLY completed; no mutation was attempted.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "Retirement failed; stop without retrying.");
  process.exitCode = 1;
}
