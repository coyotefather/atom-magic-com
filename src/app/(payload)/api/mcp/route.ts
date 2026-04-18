import config from '@payload-config'
import { REST_POST } from '@payloadcms/next/routes'
import type { NextRequest } from 'next/server'

// Force dynamic so the route is never statically optimised
export const dynamic = 'force-dynamic'

// Allow up to 300 s for MCP streaming responses
export const maxDuration = 300

const postHandler = REST_POST(config)

/**
 * Dedicated handler for POST /api/mcp.
 *
 * The hang chain:
 *   NextRequest body (ReadableStream)
 *   → createPayloadRequest mutates the request object (body untouched)
 *   → createRequestFromPayloadRequest builds new Request({ body: req.body })
 *   → mcp-handler calls req.json() on that new Request
 *   → undici cannot read a ReadableStream that came from a different undici
 *     Request instance, so req.json() blocks forever → 504
 *
 * Fix: read the body here (works fine in a real Next.js route context), then
 * override the .body getter on freshReq to return a Uint8Array.
 * createRequestFromPayloadRequest passes req.body directly to new Request(),
 * and undici handles ArrayBufferView bodies natively without any stream issue.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const bodyText = await req.text()
  const bodyBytes = new TextEncoder().encode(bodyText)

  const freshReq = new Request(req.url, {
    method: 'POST',
    headers: req.headers,
    body: bodyText,
  }) as unknown as NextRequest

  // Shadow the prototype .body getter with a plain Uint8Array value so that
  // @payloadcms/plugin-mcp's createRequestFromPayloadRequest calls:
  //   new Request(url, { body: Uint8Array, duplex: 'half' })
  // instead of passing a ReadableStream that undici cannot consume.
  Object.defineProperty(freshReq, 'body', {
    get: () => bodyBytes,
    configurable: true,
  })

  // REST_POST handlers expect (request, { params: { slug } }) — the slug maps
  // to the path segment after /api, so "mcp" routes to the /api/mcp endpoint.
  type HandlerArgs = { params: Promise<{ slug: string[] }> }
  const args: HandlerArgs = { params: Promise.resolve({ slug: ['mcp'] }) }

  return (postHandler as unknown as (req: NextRequest, args: HandlerArgs) => Promise<Response>)(
    freshReq,
    args,
  )
}
