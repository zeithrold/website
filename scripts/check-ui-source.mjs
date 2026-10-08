import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { verifyInstallation } from './verify-ui-installation.mjs'

const lock = JSON.parse(readFileSync('ui-source.lock.json', 'utf8'))
const components = JSON.parse(readFileSync('components.json', 'utf8'))
const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
const url = `https://raw.githubusercontent.com/zeithrold/tools/${lock.source}/registry/{name}.json`
assert.equal(components.registries['@ztd-me'], url)
assert.equal(manifest.dependencies['@ztd-me/frontend'], undefined)
assert.equal(Object.keys(lock.files).length, 77)
assert.equal(lock.installedDelivery, 'verified-public-source')
assert.equal(lock.installation.sourceSha, lock.source)
assert.equal(lock.installation.registryItemSha256, lock.itemSha256)
assert.deepEqual(lock.files, Object.fromEntries(lock.installation.files.map(file => [file.path, file.upstreamSha256])))
verifyInstallation(lock.installation, manifest.dependencies)
const patch = readFileSync('components/ui/ztd-me/patches/@radix-ui__react-select@2.3.7.patch', 'utf8')
const targets = [
  ...patch.matchAll(/^diff --git a\/(\S+) b\/(\S+)$/gm),
]
assert.equal(targets.length, 2)
assert.ok(targets.every(match => /^dist\/index\.d\.(?:ts|mts)$/.test(match[1])))
console.log(`Verified ${lock.installation.files.length} public UI files from ${lock.source}`)
