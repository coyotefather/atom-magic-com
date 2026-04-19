import { getPayload } from 'payload'
import config from '@payload-config'

declare global {
  // eslint-disable-next-line no-var
  var _payloadInstance: ReturnType<typeof getPayload> | undefined
}

export async function getPayloadClient() {
  if (!global._payloadInstance) {
    // Assign the Promise immediately so concurrent callers share one in-flight init
    global._payloadInstance = getPayload({ config })
  }
  return global._payloadInstance
}
