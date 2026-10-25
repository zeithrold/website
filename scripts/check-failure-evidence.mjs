import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { verifyFailureEvidence } from './failure-evidence.ts'

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
