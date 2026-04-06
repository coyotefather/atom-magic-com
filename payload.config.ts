import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
      access: 'private',
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
