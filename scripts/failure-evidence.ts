import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { isAbsolute, join, relative, sep } from 'node:path'
import { isRecord } from '../lib/value-guards.ts'

type JsonObject = Record<string, unknown>

/** One retained run: its directory plus its real path, the confinement root. */
type Run = {
  directory: string
  root: string
}

const probeFile = 'a11y-failure.spec.ts'
const scanName = 'a11y-retention-probe'
const scanRulesets = [
  'violations',
  'passes',
  'incomplete',
  'inapplicable',
]

function parseJson(source: string, message: string): unknown {
  try {
    const value: unknown = JSON.parse(source)
    return value
  }
  catch {
    assert.fail(message)
  }
}

function requireRecord(value: unknown, message: string): JsonObject {
  assert.ok(isRecord(value), message)
  return value
}

function requireArray(value: unknown, message: string): unknown[] {
  assert.ok(Array.isArray(value), message)
  return value
}

function requireString(value: unknown, message: string): string {
  assert.ok(typeof value === 'string', message)
  return value
}

/**
 * Resolve one attachment path with a single rule: an absolute path is used as
 * written, a relative path resolves against the run directory. There is no
 * second candidate, so a deleted attachment of an earlier run cannot be
 * satisfied by a file that happens to sit under the run directory. Both sides
 * are real paths, so a symlink inside the run cannot serve outside bytes.
 */
function retainedFile(run: Run, path: string, label: string): string {
  const candidate = isAbsolute(path) ? path : join(run.directory, path)
  assert.ok(existsSync(candidate), `Missing evidence: ${label} (${path})`)
  const file = realpathSync(candidate)
  const within = relative(run.root, file)
  assert.ok(
    within !== '' && within !== '..' && !within.startsWith(`..${sep}`) && !isAbsolute(within),
    `Evidence for ${label} must stay inside the retained run directory: ${path}`,
  )
  const stats = statSync(file)
  assert.ok(stats.isFile(), `Evidence for ${label} must be a file: ${path}`)
  assert.ok(stats.size > 0, `Empty evidence: ${label} (${path})`)
  return file
}

/**
 * The published 0.1.3 helper embeds the scan as a base64 body in
 * `playwright.json`; later helpers retain the same bytes as an attached file.
 * Both shapes carry the same complete scan.
 */
function readAxeScan(run: Run, attachment: JsonObject): unknown {
  const body = attachment.body
  if (typeof body === 'string') {
    return parseJson(Buffer.from(body, 'base64').toString('utf8'), 'The retained Axe scan must be valid JSON')
  }
  const path = attachment.path
  if (typeof path !== 'string') {
    assert.fail('The full Axe scan must be embedded in the retained JSON report or attached as a file')
  }
  const file = retainedFile(run, path, 'the Axe scan')
  return parseJson(readFileSync(file, 'utf8'), 'The retained Axe scan must be valid JSON')
}

/** A partial scan cannot prove what the probe never reported: keep every bucket and the engine. */
function completeScan(value: unknown): JsonObject {
  const scan = requireRecord(value, 'The retained Axe scan must be an object')
  const engine = scan.testEngine
  assert.ok(
    isRecord(engine) && typeof engine.name === 'string' && typeof engine.version === 'string',
    'The retained Axe scan must name the engine that produced it',
  )
  for (const ruleset of scanRulesets) {
    assert.ok(Array.isArray(scan[ruleset]), `The retained Axe scan is missing its ${ruleset} results`)
  }
  return scan
}

function missingNameViolated(scan: JsonObject): boolean {
  const violations = requireArray(scan.violations, 'The retained Axe scan is missing its violations results')
  return violations.some((violation: unknown) => isRecord(violation) && violation.id === 'button-name')
}

function failedResult(result: JsonObject): boolean {
  return result.status === 'failed' || result.status === 'timedOut'
}

function collectResults(suite: JsonObject, found: JsonObject[]): void {
  const specs = requireArray(suite.specs ?? [], 'The retained JSON report has a malformed spec')
  for (const spec of specs) {
    const specRecord = requireRecord(spec, 'The retained JSON report has a malformed spec')
    const tests = requireArray(specRecord.tests ?? [], 'The retained JSON report has a malformed test')
    for (const testEntry of tests) {
      const testRecord = requireRecord(testEntry, 'The retained JSON report has a malformed test')
      const results = requireArray(testRecord.results ?? [], 'The retained JSON report has a malformed result')
      for (const result of results) {
        found.push({
          file: specRecord.file,
          result: requireRecord(result, 'The retained JSON report has a malformed result'),
        })
      }
    }
  }
  for (const child of requireArray(suite.suites ?? [], 'The retained JSON report has a malformed suite')) {
    collectResults(requireRecord(child, 'The retained JSON report has a malformed suite'), found)
  }
}

function retainedMedia(run: Run, attachments: JsonObject[], suffix: string, label: string): void {
  const path = attachments
    .map(attachment => attachment.path)
    .filter((candidate): candidate is string => typeof candidate === 'string')
    .find(candidate => candidate.endsWith(suffix))
  assert.ok(path !== undefined, `The failed result retained no ${label} attachment`)
  retainedFile(run, path, label)
}

/** Verify the intentional accessibility failure kept its scan, trace, image, video and reports. */
export function verifyFailureEvidence(directory: string): void {
  const run: Run = {
    directory,
    root: realpathSync(directory),
  }
  const report = requireRecord(
    parseJson(readFileSync(join(directory, 'playwright.json'), 'utf8'), 'The retained JSON report must be valid JSON'),
    'The retained JSON report must be an object',
  )
  const stats = requireRecord(report.stats, 'The retained JSON report is missing its stats')
  assert.equal(stats.unexpected, 1, 'The missing accessible name must fail the browser test')
  const results: JsonObject[] = []
  const suites = requireArray(report.suites ?? [], 'The retained JSON report has no suites')
  for (const suite of suites) {
    collectResults(requireRecord(suite, 'The retained JSON report has a malformed suite'), results)
  }
  const failures = results.filter((entry) => {
    return failedResult(requireRecord(entry.result, 'The retained JSON report has a malformed result'))
  })
  assert.equal(failures.length, 1, 'Exactly the intended accessibility probe must fail')
  const failure = requireRecord(failures[0], 'The retained JSON report has no failed result')
  const failedFile = requireString(failure.file, 'The retained JSON report has no failed spec')
  assert.ok(failedFile.endsWith(probeFile), `The failed result must come from ${probeFile}, not another case`)
  const result = requireRecord(failure.result, 'The retained JSON report has a malformed result')
  const attachments = requireArray(result.attachments, 'The failed result retained no attachments')
    .map(attachment => requireRecord(attachment, 'The retained JSON report has a malformed attachment'))
  const axe = attachments.find(attachment => attachment.name === scanName)
  assert.ok(axe !== undefined, 'The retained JSON report is missing the failed result Axe scan attachment')
  assert.ok(
    missingNameViolated(completeScan(readAxeScan(run, axe))),
    'The retained Axe scan must still report the missing accessible name',
  )
  retainedMedia(run, attachments, 'trace.zip', 'trace')
  retainedMedia(run, attachments, '.png', 'image')
  retainedMedia(run, attachments, '.webm', 'video')
  retainedFile(run, join('playwright-report', 'index.html'), 'the HTML report')
}
