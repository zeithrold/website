import process from 'node:process'
import { checkCloudflareTarget } from './cloudflare-domain-check.ts'

try {
  const owner = await checkCloudflareTarget({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
  })
  console.log(`Verified approved Custom Domain owners: ${owner}; no extra ztd-homepage domains.`)
}
catch (error) {
  // A failed post-check does not roll back automatically: inspect the live
  // release and existing domain ownership before any further action.
  console.error(error instanceof Error ? error.message : 'Cloudflare target verification failed')
  process.exitCode = 1
}
