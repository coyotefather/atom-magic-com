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
 * Payload's generic [slug] handler wraps the NextRequest body in a new undici
 * Request. undici's req.json() cannot read a NextRequest ReadableStream and
 * hangs indefinitely, causing a 504. By reading the body here as text first
 * and creating a fresh Request with a plain string body, we hand Payload a
 * native undici-compatible body that mcp-handler can parse without hanging.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const bodyText = await req.text()

  const freshReq = new Request(req.url, {
    method: 'POST',
    headers: req.headers,
    body: bodyText,
  }) as unknown as NextRequest

  return (postHandler as unknown as (req: NextRequest) => Promise<Response>)(freshReq)
}
