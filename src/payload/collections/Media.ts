/**
 * Media.ts
 *
 * Payload CMS collection config for Media — uploaded image and file assets
 * that are used throughout the CMS content.
 *
 * How media storage works:
 *   Uploaded files are stored in Vercel Blob (an external file storage service),
 *   NOT on the server's local filesystem. This is configured in `payload.config.ts`
 *   via the `@payloadcms/storage-vercel-blob` plugin. Payload stores the file
 *   metadata (filename, mime type, file size, dimensions) in the database, but
 *   the actual file bytes live in Vercel Blob and are served from there.
 *
 *   When you upload an image through the Payload admin panel, Payload automatically:
 *   1. Uploads the binary to Vercel Blob
 *   2. Saves the Blob URL and metadata as a Media document in the database
 *   3. Returns the Media document ID for use in other collection fields
 *
 * How to access media in code:
 *   Media is referenced from other collections via `type: 'upload', relationTo: 'media'`.
 *   When you fetch a document with `depth >= 1`, the related Media document is resolved
 *   and you can access the URL via `(doc.mainImage as Media).url`.
 *
 *   The `Media` type from `payload-types.ts` has the file metadata. The actual
 *   `url` field contains the Vercel Blob URL.
 *
 * Fields:
 *   - `alt` — Accessibility alt text for the image (required for WCAG compliance,
 *             but left optional here so editors can upload without friction and
 *             fill it in afterward)
 *   - Plus Payload's built-in upload fields: `filename`, `mimeType`, `filesize`,
 *     `width`, `height`, `url` — these are automatically added by Payload when
 *     `upload: true` is set.
 *
 * Admin configuration:
 *   Uses `filename` as the display title in the admin list view (rather than
 *   `title` or `name`, since Media documents don't have those fields).
 *
 * Access control:
 *   - Read: public (anyone can view/download uploaded media via the Blob URL)
 *   - Create / Update / Delete: authenticated CMS users only
 */

import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: true,
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
    },
  ],
}
