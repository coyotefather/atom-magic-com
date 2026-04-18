import config from '@payload-config'
import { REST_POST } from '@payloadcms/next/routes'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const postHandler = REST_POST(config)

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = Date.now()
  const log = (msg: string) => console.log(`[MCP +${Date.now() - t0}ms] ${msg}`)

  log('POST entered')
  const bodyText = await req.text()
  log(`body read (${bodyText.length} bytes): ${bodyText.slice(0, 120)}`)

  const bodyBytes = new TextEncoder().encode(bodyText)

  const freshReq = new Request(req.url, {
    method: 'POST',
    headers: req.headers,
    body: bodyText,
  }) as unknown as NextRequest

  Object.defineProperty(freshReq, 'body', {
    get: () => new ReadableStream({
      start(controller) {
        controller.enqueue(bodyBytes)
        controller.close()
      },
    }),
    configurable: true,
  })

  type HandlerArgs = { params: Promise<{ slug: string[] }> }
  const args: HandlerArgs = { params: Promise.resolve({ slug: ['mcp'] }) }

  log('calling postHandler')

  // Wrap in a 25 s timeout so we get a diagnostic 500 instead of a silent 504
  const TIMEOUT_MS = 25_000
  const result = await Promise.race([
    (postHandler as unknown as (req: NextRequest, args: HandlerArgs) => Promise<Response>)(
      freshReq,
      args,
    ).then((r) => { log(`postHandler resolved, status=${r.status}`); return r }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`MCP handler timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS),
    ),
  ]).catch((err: unknown) => {
    log(`ERROR: ${String(err)}`)
    return Response.json({ error: String(err) }, { status: 500 })
  })

  log('returning response')
  return result
}
