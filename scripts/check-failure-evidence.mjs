import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? filesUnder(path) : [path]
  })
}

function verifyFailureEvidence(directory) {
  const report = JSON.parse(readFileSync(join(directory, 'playwright.json'), 'utf8'))
  assert.equal(report.stats.unexpected, 1, 'The missing accessible name must fail the browser test')
  const files = filesUnder(directory)
  const attachments = report.suites[0].specs[0].tests[0].results[0].attachments
  const axe = attachments.find(attachment => attachment.name === 'a11y-retention-probe')
  assert.ok(typeof axe?.body === 'string', 'The full Axe scan must be embedded in the retained JSON report')
  const scan = JSON.parse(Buffer.from(axe.body, 'base64').toString('utf8'))
  assert.ok(scan.violations.some(violation => violation.id === 'button-name'))
  for (const suffix of [
    'trace.zip',
    '.png',
    '.webm',
    'playwright-report/index.html',
  ]) {
    assert.ok(files.some(path => path.endsWith(suffix) && statSync(path).size > 0), `Missing evidence: ${suffix}`)
  }
}

const parent = resolve(process.env.ZT_ARTIFACTS_DIR ?? '.zt')
mkdirSync(parent, { recursive: true })
const runDirectory = mkdtempSync(join(parent, 'failure-evidence-'))
const result = spawnSync('pnpm', [
  '--config.verify-deps-before-run=error',
  'exec',
  'playwright',
  'test',
  '--config',
  'tests/evidence/playwright.config.ts',
], {
  encoding: 'utf8',
  env: { ...process.env, ZT_ARTIFACTS_DIR: runDirectory },
})
writeFileSync(join(runDirectory, 'native.log'), `${result.stdout ?? ''}\n${result.stderr ?? ''}`)
assert.equal(result.status, 1, 'The intentional accessibility failure must return exit 1')
verifyFailureEvidence(runDirectory)
console.log(`Expected accessibility failure retained its scan, trace, image, video and reports: ${runDirectory}`)
