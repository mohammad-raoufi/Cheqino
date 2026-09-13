const TARGET_HOST = 'firestore.googleapis.com'

function withCors(response: Response, request: Request): Response {
  const headers = new Headers(response.headers)
  const origin = request.headers.get('Origin')
  headers.set('Access-Control-Allow-Origin', origin ?? '*')
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Vary', 'Origin')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      const headers = new Headers()
      const origin = request.headers.get('Origin')
      headers.set('Access-Control-Allow-Origin', origin ?? '*')
      headers.set('Access-Control-Allow-Credentials', 'true')
      headers.set(
        'Access-Control-Allow-Methods',
        request.headers.get('Access-Control-Request-Method') ?? 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      )
      headers.set(
        'Access-Control-Allow-Headers',
        request.headers.get('Access-Control-Request-Headers') ?? '*',
      )
      headers.set('Access-Control-Max-Age', '86400')
      return new Response(null, { status: 204, headers })
    }

    const url = new URL(request.url)
    url.protocol = 'https:'
    url.hostname = TARGET_HOST
    url.port = ''

    const forwardedHeaders = new Headers(request.headers)
    forwardedHeaders.set('Host', TARGET_HOST)
    forwardedHeaders.delete('cf-connecting-ip')
    forwardedHeaders.delete('cf-ipcountry')
    forwardedHeaders.delete('cf-ray')
    forwardedHeaders.delete('cf-visitor')

    const upstreamRequest = new Request(url.toString(), {
      method: request.method,
      headers: forwardedHeaders,
      body: request.body,
      redirect: 'manual',
    })

    const upstreamResponse = await fetch(upstreamRequest)
    return withCors(upstreamResponse, request)
  },
}
