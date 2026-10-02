import type { RetirementRead } from './retirement-read.ts'
import assert from 'node:assert/strict'
import {
  optionalArray,
  optionalRecord,
  requireArray,
  requireRecord,
  requireString,
} from './cloudflare-json.ts'
import { LEGACY_WORKER_NAME } from './deployment-policy.ts'

function verifySettings(value: unknown): void {
  const settings = requireRecord(value, 'Unknown binding state')
  const allowed = [
    'assets',
    'plain_text',
    'secret_text',
    'version_metadata',
  ]
  const bindings = requireArray(settings.bindings, 'Unknown binding state')
  assert.ok(
    bindings.every((item) => {
      const binding = requireRecord(item, 'Unknown binding state')
      return allowed.includes(requireString(binding.type, 'Unknown binding state'))
    }),
    'Old Worker has other resources/integrations; review before deletion',
  )
  assert.ok(
    optionalArray(settings.tail_consumers, 'Unknown tail integrations').length === 0,
    'Old Worker has tail integrations',
  )
  assert.ok(
    settings.logpush === undefined || settings.logpush === false,
    'Old Worker has a Logpush integration',
  )
  const triggers = optionalRecord(settings.triggers, 'Unknown trigger state')
  assert.ok(
    optionalArray(triggers.events, 'Unknown event triggers').length === 0,
    'Old Worker has event triggers',
  )
}

function verifyReferences(value: unknown): void {
  const references = requireRecord(value, 'Unknown dependency state')
  const known = [
    'services',
    'domains',
    'durable_objects',
    'dispatch_outbounds',
  ]
  const unknownCategories = Object.keys(references).filter(key => !known.includes(key))
  assert.ok(
    unknownCategories.length === 0,
    `Unknown dependency categories require review: ${unknownCategories.join(', ')}`,
  )
  if ('domains' in references) {
    const domains = requireArray(
      references.domains,
      'references.domains must be a Custom Domain array; stop for review',
    )
    assert.ok(domains.length === 0, 'Old Worker still has Custom Domain references; stop for review')
    console.log('Verified old Worker references.domains: empty Custom Domain array.')
  }
  if (references.services !== undefined && references.services !== null) {
    const services = requireRecord(references.services, 'Unknown service references')
    assert.ok(
      requireArray(services.incoming, 'Unknown incoming references').length === 0,
      'Other Workers reference the old Worker',
    )
    assert.ok(
      services.pages_function === undefined || services.pages_function === false,
      'Pages references the old Worker',
    )
  }
  assert.ok(
    optionalArray(references.durable_objects, 'Unknown Durable Object references').length === 0,
    'Old Worker has Durable Object references/resources',
  )
  assert.ok(
    optionalArray(references.dispatch_outbounds, 'Unknown dispatch references').length === 0,
    'Old Worker is a dispatch outbound',
  )
}

async function verifyActiveVersion(read: RetirementRead): Promise<void> {
  const message = 'Unexpected legacy active deployment'
  const deployments = requireRecord(await read(`/scripts/${LEGACY_WORKER_NAME}/deployments`), message)
  const [deployment] = requireArray(deployments.deployments, message)
  const versions = requireArray(requireRecord(deployment, message).versions, message)
  assert.ok(versions.length === 1, message)
  const [version] = versions
  const versionId = requireString(requireRecord(version, message).version_id, 'Invalid version ID')
  assert.match(versionId, /^[a-f0-9-]{36}$/, 'Invalid version ID')
  const active = requireRecord(await read(`/scripts/${LEGACY_WORKER_NAME}/versions/${versionId}`), message)
  const resources = requireRecord(active.resources, message)
  const script = requireRecord(resources.script, message)
  assert.deepEqual(script.handlers, ['fetch'], 'Old Worker has other event handlers/integrations')
}

export async function verifyRetirementPreflight(read: RetirementRead): Promise<boolean> {
  const service = requireRecord(
    await read(`/services/${LEGACY_WORKER_NAME}`),
    'Wrong legacy service identity',
  )
  assert.equal(service.id, LEGACY_WORKER_NAME, 'Wrong legacy service identity')
  const defaultEnvironment = requireRecord(
    service.default_environment,
    'Unexpected legacy default environment',
  )
  assert.equal(defaultEnvironment.environment, 'production', 'Unexpected legacy default environment')
  const environments = requireArray(service.environments, 'Unknown legacy environments')
  assert.deepEqual(
    environments.map(environment => requireRecord(environment, 'Unknown environment').environment),
    ['production'],
    'Other legacy environments require review',
  )
  const servicePath = `/services/${LEGACY_WORKER_NAME}/environments/production`
  const routes = requireArray(
    await read(`${servicePath}/routes?show_zonename=true`),
    'Old Worker still has routes',
  )
  assert.ok(routes.length === 0, 'Old Worker still has routes')
  const subdomain = requireRecord(await read(`${servicePath}/subdomain`), 'Unknown workers.dev state')
  assert.ok(typeof subdomain.enabled === 'boolean', 'Unknown workers.dev state')
  verifySettings(await read(`/scripts/${LEGACY_WORKER_NAME}/settings`))
  const schedules = requireRecord(
    await read(`/scripts/${LEGACY_WORKER_NAME}/schedules`),
    'Old Worker still has Cron triggers',
  )
  assert.ok(
    requireArray(schedules.schedules, 'Unknown Cron state').length === 0,
    'Old Worker still has Cron triggers',
  )
  verifyReferences(await read(`/scripts/${LEGACY_WORKER_NAME}/references`))
  const tails = requireArray(
    await read(`/tails/by-consumer/${LEGACY_WORKER_NAME}`),
    'Unknown Tail consumer state',
  )
  assert.ok(tails.length === 0, 'Old Worker is a Tail consumer')
  await verifyActiveVersion(read)
  return subdomain.enabled
}
