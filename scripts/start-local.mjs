import { spawn } from 'node:child_process'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { assertDeploymentConfig } from './deployment-policy.ts'

const config = JSON.parse(readFileSync('dist/server/wrangler.json', 'utf8'))
assertDeploymentConfig(config)
const { values } = parseArgs({ options: {
  port: { type: 'string', default: '4173' },
  canonical: { type: 'boolean', default: false },
} })
const port = values.port
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
  throw new Error('Use a local port from 1 to 65535')
}
// Wrangler otherwise infers a production upstream host from Custom Domains and
// rewrites redirect locations, hiding the Worker's actual Host/HTTPS behavior.
// The deploy artifact/config remains untouched; only local emulation uses []
// with the same entry, bindings, assets and code. Remove the copy on shutdown.
const localPath = `dist/server/wrangler.local-${process.pid}.json`
writeFileSync(localPath, JSON.stringify({ ...config, routes: [] }))
const child = spawn(
  'wrangler',
  [
    'dev',
    '--config',
    localPath,
    '--local',
    '--ip',
    '127.0.0.1',
    '--port',
    port,
    ...(values.canonical
      ? [
          '--local-upstream',
          'ztd.me',
          '--upstream-protocol',
          'https',
        ]
      : []),
  ],
  { stdio: 'inherit' },
)
const cleanup = () => rmSync(localPath, { force: true })
let stopping = false
child.on('error', () => {
  cleanup()
  console.error('Unable to start the local Wrangler process')
  process.exitCode = 1
})
child.on('exit', (code) => {
  cleanup()
  process.exitCode = stopping ? 0 : (code ?? 1)
})
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    stopping = true
    cleanup()
    child.kill(signal)
  })
}
