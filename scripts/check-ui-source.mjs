import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { verifyCandidate } from './verify-ui-candidate.mjs'

const lock = JSON.parse(readFileSync('ui-source.lock.json', 'utf8'))
const components = JSON.parse(readFileSync('components.json', 'utf8'))
const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
const url = `https://raw.githubusercontent.com/zeithrold/tools/${lock.source}/registry/{name}.json`
assert.equal(components.registries['@ztd-me'], url)
assert.equal(manifest.dependencies['@ztd-me/frontend'], undefined)
assert.equal(Object.keys(lock.files).length, 42)
if (lock.candidate !== undefined) {
  assert.equal(lock.installedDelivery, 'reviewed-local-candidate')
  verifyCandidate(lock.candidate, manifest.dependencies)
}
else {
  for (const [path, upstream] of Object.entries(lock.files)) {
    const actual = createHash('sha256').update(readFileSync(path)).digest('hex')
    const expected = lock.adaptations[path]?.sha256 ?? upstream
    assert.equal(actual, expected, `Unreviewed UI source change: ${path}`)
  }
}
const patch = readFileSync('components/ui/ztd-me/patches/@radix-ui__react-select@2.3.7.patch', 'utf8')
const targets = [
  ...patch.matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gm),
]
assert.equal(targets.length, 2)
assert.ok(targets.every(match => /^dist\/index\.d\.(?:ts|mts)$/.test(match[1])))
if (lock.candidate !== undefined) {
  console.log(`Verified ${lock.candidate.files.length} reviewed local candidate files;`
    + ` public pin remains ${lock.source}`)
}
else {
  console.log(`Verified ${Object.keys(lock.files).length} reviewed public UI files from ${lock.source}`)
}
