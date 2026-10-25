import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { test } from 'node:test'
import { verifyFailureEvidence } from '../scripts/failure-evidence.ts'
import { handleRegistrationFailure } from './helpers/registration.ts'

type EvidenceAttachment = {
  name: string
  contentType?: string
  body?: string
  path?: string
}

type ResultShape = {
  status: string
  attachments: EvidenceAttachment[]
  file: string
}

const probeFile = 'a11y-failure.spec.ts'
const attachedScan = join('test-results', 'probe', 'a11y-retention-probe.json')

/** The shape `@ztd-me/frontend-checks` retains: engine plus every ruleset bucket. */
function completeScan(): string {
  return JSON.stringify({
    testEngine: {
      name: 'axe-core',
      version: '4.13.0',
    },
    violations: [
      { id: 'button-name' },
    ],
    passes: [
      { id: 'document-title' },
    ],
    incomplete: [],
    inapplicable: [
      { id: 'aria-allowed-attr' },
    ],
  })
}

function runDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'failure-evidence-test-'))
  mkdirSync(join(directory, 'playwright-report'), { recursive: true })
  writeFileSync(join(directory, 'playwright-report', 'index.html'), '<html></html>')
  return directory
}

function retainFile(directory: string, path: string, body: string): string {
  const file = join(directory, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, body)
  return file
}

/** Screenshot, video and trace belong to the failed result, as Playwright retains them. */
function media(directory: string): EvidenceAttachment[] {
  const entries = [
    { name: 'screenshot', contentType: 'image/png', file: 'test-failed-1.png' },
    { name: 'video', contentType: 'video/webm', file: 'video-1.webm' },
    { name: 'trace', contentType: 'application/zip', file: 'trace.zip' },
  ]
  return entries.map(({ name, contentType, file }) => ({
    name,
    contentType,
    path: retainFile(directory, join('test-results', 'probe', file), 'evidence'),
  }))
}

function scanBody(body = completeScan()): EvidenceAttachment {
  return {
    name: 'a11y-retention-probe',
    contentType: 'application/json',
    body: Buffer.from(body).toString('base64'),
  }
}

/** A scan that kept only violations: it cannot prove the rulesets it never reported. */
function truncatedScan(): string {
  return JSON.stringify({
    violations: [
      { id: 'button-name' },
    ],
  })
}

/** A scan with the engine and violations but no passes, incomplete or inapplicable results. */
function partialScan(): string {
  return JSON.stringify({
    testEngine: {
      name: 'axe-core',
      version: '4.13.0',
    },
    violations: [
      { id: 'button-name' },
    ],
  })
}

function scanPath(path: string): EvidenceAttachment {
  return {
    name: 'a11y-retention-probe',
    contentType: 'application/json',
    path,
  }
}

function failed(attachments: EvidenceAttachment[], file = probeFile): ResultShape {
  return { status: 'failed', attachments, file }
}

function passed(attachments: EvidenceAttachment[], file = probeFile): ResultShape {
  return { status: 'passed', attachments, file }
}

function writeReport(directory: string, unexpected: number, results: ResultShape[]): void {
  const files: string[] = []
  for (const result of results) {
    if (!files.includes(result.file)) {
      files.push(result.file)
    }
  }
  const specs = files.map(file => ({
    file,
    tests: results
      .filter(result => result.file === file)
      .map(result => ({
        results: [
          {
            status: result.status,
            retry: 0,
            attachments: result.attachments,
          },
        ],
      })),
  }))
  const report = {
    stats: { unexpected },
    suites: [
      { specs },
    ],
  }
  writeFileSync(join(directory, 'playwright.json'), JSON.stringify(report))
}

test('the published inline body attachment keeps its full Axe scan', (t) => {
  const directory = runDirectory()
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  writeReport(directory, 1, [
    failed([
      scanBody(),
      ...media(directory),
    ]),
  ])
  verifyFailureEvidence(directory)
}).catch(handleRegistrationFailure)

test('an attached scan file resolves from its absolute or run-relative path', (t) => {
  const directory = runDirectory()
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const absolute = retainFile(directory, attachedScan, completeScan())
  writeReport(directory, 1, [
    failed([
      scanPath(absolute),
      ...media(directory),
    ]),
  ])
  verifyFailureEvidence(directory)
  writeReport(directory, 1, [
    failed([
      scanPath(attachedScan),
      ...media(directory),
    ]),
  ])
  verifyFailureEvidence(directory)
}).catch(handleRegistrationFailure)

test('a deleted absolute attachment is not satisfied by a file under the run directory', (t) => {
  const directory = runDirectory()
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  // The earlier run's scan lived at /deleted/...; only its run-directory shadow exists now.
  retainFile(directory, join('deleted', 'a11y-retention-probe.json'), completeScan())
  writeReport(directory, 1, [
    failed([
      scanPath('/deleted/a11y-retention-probe.json'),
      ...media(directory),
    ]),
  ])
  assert.throws(() => verifyFailureEvidence(directory), /Missing evidence: the Axe scan/u)
}).catch(handleRegistrationFailure)

test('an attached scan must stay inside the retained run directory', (t) => {
  const directory = runDirectory()
  const outside = join(dirname(directory), `${basename(directory)}-outside.json`)
  const linked = join(directory, 'linked-scan.json')
  writeFileSync(outside, completeScan())
  symlinkSync(outside, linked)
  t.after(() => {
    rmSync(directory, { recursive: true, force: true })
    rmSync(outside, { force: true })
  })
  writeReport(directory, 1, [
    failed([
      scanPath(`../${basename(outside)}`),
      ...media(directory),
    ]),
  ])
  assert.throws(() => verifyFailureEvidence(directory), /stay inside the retained run directory/u)
  writeReport(directory, 1, [
    failed([
      scanPath(linked),
      ...media(directory),
    ]),
  ])
  assert.throws(() => verifyFailureEvidence(directory), /stay inside the retained run directory/u)
}).catch(handleRegistrationFailure)

test('evidence from another result or another case cannot stand in for the probe', (t) => {
  const borrowed = runDirectory()
  const secondCase = runDirectory()
  const withoutTrace = runDirectory()
  t.after(() => {
    for (const directory of [
      borrowed,
      secondCase,
      withoutTrace,
    ]) {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  writeReport(borrowed, 1, [
    failed(media(borrowed)),
    passed([
      scanBody(),
      ...media(borrowed),
    ]),
  ])
  assert.throws(() => verifyFailureEvidence(borrowed), /missing the failed result Axe scan attachment/u)

  writeReport(secondCase, 1, [
    failed([
      scanBody(),
      ...media(secondCase),
    ]),
    failed([
      scanBody(),
      ...media(secondCase),
    ], 'other.spec.ts'),
  ])
  assert.throws(() => verifyFailureEvidence(secondCase), /Exactly the intended accessibility probe must fail/u)

  writeReport(withoutTrace, 1, [
    failed([
      scanBody(),
      ...media(withoutTrace).filter(attachment => attachment.name !== 'trace'),
    ]),
    passed(media(withoutTrace).filter(attachment => attachment.name === 'trace')),
  ])
  assert.throws(() => verifyFailureEvidence(withoutTrace), /retained no trace attachment/u)
}).catch(handleRegistrationFailure)

test('an incomplete or unusable scan still fails verification', (t) => {
  const truncated = runDirectory()
  const partial = runDirectory()
  const empty = runDirectory()
  const unparsable = runDirectory()
  const clean = runDirectory()
  t.after(() => {
    for (const directory of [
      truncated,
      partial,
      empty,
      unparsable,
      clean,
    ]) {
      rmSync(directory, { recursive: true, force: true })
    }
  })
  const attachBody = (directory: string, body: string): void => {
    writeReport(directory, 1, [
      failed([
        scanBody(body),
        ...media(directory),
      ]),
    ])
  }
  attachBody(truncated, truncatedScan())
  attachBody(partial, partialScan())
  assert.throws(() => verifyFailureEvidence(truncated), /must name the engine that produced it/u)
  assert.throws(() => verifyFailureEvidence(partial), /missing its passes results/u)

  for (const directory of [
    empty,
    unparsable,
    clean,
  ]) {
    retainFile(directory, attachedScan, '')
    writeReport(directory, 1, [
      failed([
        scanPath(attachedScan),
        ...media(directory),
      ]),
    ])
  }
  writeFileSync(join(unparsable, attachedScan), '{not json')
  writeFileSync(join(clean, attachedScan), completeScan().replace('button-name', 'aria-valid-attr'))
  assert.throws(() => verifyFailureEvidence(empty), /Empty evidence: the Axe scan/u)
  assert.throws(() => verifyFailureEvidence(unparsable), /must be valid JSON/u)
  assert.throws(() => verifyFailureEvidence(clean), /must still report the missing accessible name/u)
}).catch(handleRegistrationFailure)
