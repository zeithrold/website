import process from 'node:process'
import { retireDoainkHome } from './retire-doaink-home.ts'

try {
  const result = await retireDoainkHome({
    token: process.env.CLOUDFLARE_API_TOKEN,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    confirmation: process.env.RETIRE_CONFIRMATION,
  })
  let message = 'CHECK_ONLY completed; no mutation was attempted.'
  if (result.alreadyAbsent) {
    message = 'doaink-home is already absent; no deletion was attempted.'
  }
  else if (result.deleted) {
    message = 'Verified: doaink-home deleted, all other Workers and Custom Domains unchanged.'
  }
  console.log(message)
}
catch (error) {
  console.error(error instanceof Error ? error.message : 'Retirement failed; stop without retrying.')
  process.exitCode = 1
}
