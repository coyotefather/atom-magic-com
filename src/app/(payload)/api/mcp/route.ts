import config from '@payload-config'
import { REST_POST } from '@payloadcms/next/routes'
import { getPayload } from 'payload'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const postHandler = REST_POST(config)

export async function POST(req: NextRequest): Promise<Response> {
  const t0 = Date.now()
  const log = (msg: string) => console.log(`[MCP +${Date.now() - t0}ms] ${msg}`)

  log('1 entered')

  let bodyText: string
  try {
    bodyText = await req.text()
    log(`2 body read (${bodyText.length} bytes)`)
  } catch (err) {
    log(`2 body read FAILED: ${String(err)}`)
    return Response.json({ error: `body read failed: ${String(err)}` }, { status: 500 })
  }

  try {
    await getPayload({ config })
    log('3 payload ready')
  } catch (err) {
    log(`3 payload FAILED: ${String(err)}`)
    return Response.json({ error: `payload init failed: ${String(err)}` }, { status: 500 })
  }

  const bodyBytes = new TextEncoder().encode(bodyText)

  const freshReq = new Request(req.url, {
    method: 'POST',
    headers: req.headers,
    body: bodyText,
  }) as unknown as NextRequest

  // Proxy intercepts body access so each consumer gets a fresh ReadableStream,
  // even if createPayloadRequest consumed the original body stream first.
  const proxiedReq = new Proxy(freshReq, {
    get(target, prop) {
      if (prop === 'body') {
        return new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(bodyBytes)
            controller.close()
          },
        })
      }
      const value = Reflect.get(target, prop, target)
      return typeof value === 'function' ? (value as CallableFunction).bind(target) : value
    },
  }) as unknown as NextRequest

  type HandlerArgs = { params: Promise<{ slug: string[] }> }
  const args: HandlerArgs = { params: Promise.resolve({ slug: ['mcp'] }) }

  log('4 calling postHandler')

  const TIMEOUT_MS = 25_000
  const result = await Promise.race([
    (postHandler as unknown as (req: NextRequest, args: HandlerArgs) => Promise<Response>)(
      proxiedReq,
      args,
    ).then((r) => { log(`5 postHandler resolved status=${r.status}`); return r }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`MCP timeout after ${TIMEOUT_MS}ms`)), TIMEOUT_MS),
    ),
  ]).catch((err: unknown) => {
    log(`5 ERROR: ${String(err)}`)
    return Response.json({ error: String(err) }, { status: 500 })
  })

  log('6 returning')
  return result
}
