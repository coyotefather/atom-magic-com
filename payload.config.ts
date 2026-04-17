import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './src/payload/collections/Users'
import { Media } from './src/payload/collections/Media'
import { Categories } from './src/payload/collections/Categories'
import { Entries } from './src/payload/collections/Entries'
import { Cultures } from './src/payload/collections/Cultures'
import { Paths } from './src/payload/collections/Paths'
import { Disciplines } from './src/payload/collections/Disciplines'
import { Techniques } from './src/payload/collections/Techniques'
import { Patronages } from './src/payload/collections/Patronages'
import { Scores } from './src/payload/collections/Scores'
import { Subscores } from './src/payload/collections/Subscores'
import { AdditionalScores } from './src/payload/collections/AdditionalScores'
import { Creatures } from './src/payload/collections/Creatures'
import { Enhancements } from './src/payload/collections/Enhancements'
import { Timeline } from './src/payload/collections/Timeline'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Entries,
    Cultures,
    Paths,
    Disciplines,
    Techniques,
    Patronages,
    Scores,
    Subscores,
    AdditionalScores,
    Creatures,
    Enhancements,
    Timeline,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  plugins: [
    vercelBlobStorage({
      enabled: true,
      access: 'public',
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
    mcpPlugin({
      collections: {
        entries: { enabled: true },
        creatures: { enabled: true },
        disciplines: { enabled: true },
        techniques: { enabled: true },
        paths: { enabled: true },
        cultures: { enabled: true },
        patronages: { enabled: true },
        scores: { enabled: true },
        subscores: { enabled: true },
        'additional-scores': { enabled: true },
        enhancements: { enabled: true },
        categories: { enabled: true },
        timeline: { enabled: true },
        media: { enabled: true },
      },
    }),
  ],
})
