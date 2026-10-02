import assert from 'node:assert/strict'
import { requireRecord } from './cloudflare-json.ts'
import { RETIREMENT_BASE } from './retirement-read.ts'

// Only this fixed endpoint can mutate. Never force or retry a deletion.
export async function deleteLegacyWorker(token: string, fetcher: typeof fetch): Promise<void> {
  let response: Response
  try {
    response = await fetcher(`${RETIREMENT_BASE}/scripts/doaink-home?force=false`, {
      method: 'DELETE',
      redirect: 'error',
      signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${token}` },
    })
  }
  catch {
    throw new Error('Deletion outcome is uncertain; do not retry. Inspect the script list read-only.')
  }
  assert.ok(response.ok, `DELETE doaink-home: HTTP ${response.status}; do not retry or force`)
  let text: string
  try {
    text = await response.text()
  }
  catch {
    throw new Error('Deletion response could not be read; do not retry. Inspect the script list read-only.')
  }
  if (text !== '') {
    let body: unknown
    try {
      body = JSON.parse(text)
    }
    catch {
      throw new Error('Deletion response is unreadable; do not retry. Inspect the script list read-only.')
    }
    assert.equal(
      requireRecord(body, 'Deletion was not confirmed; do not retry').success,
      true,
      'Deletion was not confirmed; do not retry',
    )
  }
}
