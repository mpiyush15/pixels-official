import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { CaseStudies } from './collections/CaseStudies'
import { HomePage } from './globals/HomePage'
import { AboutPage } from './globals/AboutPage'
import { TestHomePage } from './globals/TestHomePage'
import { Services } from './collections/Services'
import { ServicesPage } from './globals/ServicesPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  routes: {
    admin: '/cms',
  },
  cors: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'],
  collections: [
    Users,
    Media,
    CaseStudies,
    Services,
  ],
  globals: [
    HomePage,
    AboutPage,
    TestHomePage,
    ServicesPage,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-key', // Ensure you have PAYLOAD_SECRET in .env
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
})
