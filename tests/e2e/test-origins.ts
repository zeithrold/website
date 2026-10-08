import process from 'node:process'

function localPort(name: string, fallback: number): number {
  const configured = process.env[name]
  if (configured === undefined) {
    return fallback
  }
  const port = Number(configured)
  if (!/^\d+$/u.test(configured) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer port from 1 to 65535`)
  }
  return port
}

export const websiteTestPort = localPort('WEBSITE_TEST_PORT', 4173)
export const websiteCanonicalTestPort = localPort('WEBSITE_CANONICAL_TEST_PORT', 4174)
if (websiteTestPort === websiteCanonicalTestPort) {
  throw new Error('Website ordinary and canonical fixtures require different ports')
}
export const websiteTestOrigin = `http://127.0.0.1:${websiteTestPort}`
export const websiteCanonicalTestOrigin = `http://127.0.0.1:${websiteCanonicalTestPort}`
