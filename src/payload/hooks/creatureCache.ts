import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

export const invalidateCreatureCache: CollectionAfterChangeHook & CollectionAfterDeleteHook = async () => {
  revalidateTag('creatures', 'default')
}
