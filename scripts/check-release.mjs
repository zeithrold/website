import process from 'node:process'
import { assertReleaseRequest } from './deployment-policy.ts'

assertReleaseRequest({
  repository: process.env.GITHUB_REPOSITORY,
  eventName: process.env.GITHUB_EVENT_NAME,
  ref: process.env.GITHUB_REF,
  actualCommit: process.env.GITHUB_SHA,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
})
console.log('Release verified: main push, workflow commit, existing account and five approved hosts.')
