import { routeRequest } from './routing.ts'

const DEPLOYMENT_HEADER = 'x-ztd-frontend-deployment'

interface WebsiteDeployment {
  environment: 'production' | 'development'
  namespace: 'website'
  hostname: 'ztd.me' | 'localhost'
  protocol: 'http:' | 'https:'
}

/** The Worker sets this only after the exact routing policy has accepted the URL. */
export function frontendRenderRequest(request: Request): Request {
  if (routeRequest(request) !== null) {
    throw new Error('Frontend rendering requires an accepted canonical or local request')
  }
  const url = new URL(request.url)
  const local = url.protocol === 'https:' ? 'development-https' : 'development-http'
  const headers = new Headers(request.headers)
  headers.set(DEPLOYMENT_HEADER, url.hostname === 'ztd.me' ? 'production' : local)
  return new Request(request, { headers })
}

/** Dev SSR ignores all markers; built Worker SSR consumes its overwritten marker. */
export function frontendDeployment(headers: Headers, builtWorker: boolean = false): WebsiteDeployment {
  const deployment = builtWorker ? headers.get(DEPLOYMENT_HEADER) : null
  if (deployment === 'production') {
    return { environment: 'production', namespace: 'website', hostname: 'ztd.me', protocol: 'https:' }
  }
  return {
    environment: 'development',
    namespace: 'website',
    hostname: 'localhost',
    protocol: deployment === 'development-https' ? 'https:' : 'http:',
  }
}

/** Application HTML/RSC may depend on UI cookies and Accept-Language; assets do not. */
export function privateApplicationResponse(response: Response): Response {
  const result = new Response(response.body, response)
  result.headers.set('Cache-Control', 'private, no-store')
  const vary = result.headers.get('Vary') ?? ''
  const values = vary.split(',').map(value => value.trim()).filter(Boolean)
  if (!values.includes('*')) {
    const missing = ['Cookie', 'Accept-Language'].filter(value => (
      !values.some(existing => existing.toLowerCase() === value.toLowerCase())
    ))
    result.headers.set('Vary', [
      ...values,
      ...missing,
    ].join(', '))
  }
  return result
}
