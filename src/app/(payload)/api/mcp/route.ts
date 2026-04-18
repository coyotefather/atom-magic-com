import config from '@payload-config'
import { REST_POST } from '@payloadcms/next/routes'
import { getPayload } from 'payload'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const postHandler = REST_POST(config)

export async function POST(req: NextRequest): Promise<Response> {
  // Pre-initialise Payload so the MCP handler doesn't cold-start inside postHandler
  await getPayload({ config })

  const bodyText = await req.text()
  const bodyBytes = new TextEncoder().encode(bodyText)

  // Proxy intercepts `body` access so each consumer (createPayloadRequest,
  // createRequestFromPayloadRequest) gets a fresh ReadableStream from the
  // already-buffered bytes, avoiding the duplex/stream-consumed hang.
  const freshReq = new Proxy(
    new Request(req.url, { method: 'POST', headers: req.headers, body: bodyText }) as unknown as NextRequest,
    {
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
    },
  ) as unknown as NextRequest

  type HandlerArgs = { params: Promise<{ slug: string[] }> }
  const args: HandlerArgs = { params: Promise.resolve({ slug: ['mcp'] }) }

  return (postHandler as unknown as (req: NextRequest, args: HandlerArgs) => Promise<Response>)(
    freshReq,
    args,
  )
}
