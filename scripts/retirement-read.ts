import assert from 'node:assert/strict'
import { cloudflareResult } from './cloudflare-json.ts'
import { ACCOUNT_ID } from './deployment-policy.ts'

export const RETIREMENT_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers`
export type RetirementRead = (path: string) => Promise<unknown>

export function createRetirementRead(token: string, fetcher: typeof fetch): RetirementRead {
  return async (path) => {
    let response: Response
    try {
      response = await fetcher(`${RETIREMENT_BASE}${path}`, {
        method: 'GET',
        redirect: 'error',
        signal: AbortSignal.timeout(15_000),
        headers: { Authorization: `Bearer ${token}` },
      })
    }
    catch {
      throw new Error(`Cloudflare GET ${path} failed; stop and do not retry mutations`)
    }
    assert.ok(
      response.ok,
      `Cloudflare GET ${path}: HTTP ${response.status}; stop without changing credentials`,
    )
    let body: unknown
    try {
      body = await response.json()
    }
    catch {
      throw new Error(`Invalid Cloudflare JSON for GET ${path}; stop`)
    }
    return cloudflareResult(
      body,
      `Cloudflare GET ${path} did not succeed`,
      'Paginated state needs manual review',
    )
  }
}
