import assert from 'node:assert/strict'
import { ACCOUNT_ID, EXPECTED_ROUTES } from '../../scripts/deployment-policy.ts'
import { fetchUrl } from './fetch-input.ts'

interface Options {
  absent?: boolean
  dependency?: boolean
  forbidden?: boolean
  uncertain?: boolean
  stillListed?: boolean
  resource?: boolean
  unknownCategory?: boolean
  domainReference?: boolean
  malformedDomains?: boolean
  overrides?: Record<string, unknown>
}
const versionId = '11111111-1111-1111-1111-111111111111'
const domains = [
  ...EXPECTED_ROUTES.map((route, index) => ({
    id: String(index),
    hostname: route.pattern,
    service: 'ztd-homepage',
    environment: 'production',
    zone_id: 'a'.repeat(32),
  })),
  {
    id: 'blog',
    hostname: 'blog.ztd.me',
    service: 'blog',
    environment: 'production',
    zone_id: 'a'.repeat(32),
  },
  {
    id: 'showcase',
    hostname: 'showcase.ztd.me',
    service: 'showcase',
    environment: 'production',
    zone_id: 'a'.repeat(32),
  },
]
const service = {
  id: 'doaink-home',
  default_environment: { environment: 'production' },
  environments: [
    { environment: 'production' },
  ],
}

function references(options: Options): Record<string, unknown> {
  let customDomains: unknown = []
  if (options.malformedDomains === true) {
    customDomains = {}
  }
  else if (options.domainReference === true) {
    customDomains = [
      { hostname: 'still-attached.example' },
    ]
  }
  return {
    services: {
      incoming: options.dependency === true
        ? [
            { service: 'another-worker' },
          ]
        : [],
      pages_function: false,
    },
    domains: customDomains,
    durable_objects: [],
    dispatch_outbounds: [],
    ...(options.unknownCategory === true ? { unreviewed_dependency: [] } : {}),
  }
}

function results(options: Options, deleted: boolean): Record<string, unknown> {
  return {
    '/domains': domains,
    '/scripts': [
      'ztd-homepage',
      'blog',
      'showcase',
      ...(!deleted ? ['doaink-home'] : []),
    ].map(id => ({
      id,
    })),
    '/services/doaink-home': service,
    '/services/doaink-home/environments/production/routes?show_zonename=true': [],
    '/services/doaink-home/environments/production/subdomain': { enabled: true },
    '/scripts/doaink-home/settings': {
      bindings: [
        { type: options.resource === true ? 'kv_namespace' : 'assets' },
      ],
      tail_consumers: [],
      logpush: false,
    },
    '/scripts/doaink-home/schedules': { schedules: [] },
    '/scripts/doaink-home/references': references(options),
    '/tails/by-consumer/doaink-home': [],
    '/scripts/doaink-home/deployments': { deployments: [
      { versions: [
        { version_id: versionId },
      ] },
    ] },
    [`/scripts/doaink-home/versions/${versionId}`]: { resources: { script: { handlers: ['fetch'] } } },
    ...options.overrides,
  }
}

export function api(options: Options = {}): {
  fetcher: typeof fetch
  calls: { path: string, method: string }[]
} {
  const calls: { path: string, method: string }[] = []
  let deleted = options.absent === true
  const fetcher: typeof fetch = async (input, init) => {
    const url = fetchUrl(input)
    assert.ok(url.origin === 'https://api.cloudflare.com')
    const prefix = `/client/v4/accounts/${ACCOUNT_ID}/workers`
    assert.ok(url.pathname.startsWith(prefix))
    const path = url.pathname.slice(prefix.length) + url.search
    const method = init?.method ?? 'GET'
    calls.push({ path, method })
    assert.ok(init?.redirect === 'error')
    assert.ok(new Headers(init.headers).get('authorization') === 'Bearer fake-retirement-token')
    if (options.forbidden === true) {
      return await Promise.resolve(new Response('do not log API response or token', { status: 403 }))
    }
    if (method === 'DELETE') {
      assert.ok(path === '/scripts/doaink-home?force=false')
      if (options.uncertain === true) {
        return await Promise.reject(new Error('transport failed'))
      }
      deleted = options.stillListed !== true
      return await Promise.resolve(new Response(null, { status: 204 }))
    }
    assert.ok(method === 'GET')
    const responses = results(options, deleted)
    assert.ok(path in responses, `Unexpected read ${path}`)
    return await Promise.resolve(Response.json({ success: true, result: responses[path] }))
  }
  return { fetcher, calls }
}
