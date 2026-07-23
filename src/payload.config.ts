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
import { Navbar } from './globals/Navbar'
import { s3Storage } from '@payloadcms/storage-s3'

// Helper to check if we should use S3
const useS3 = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const plugins = [];
if (useS3) {
  plugins.push(
    s3Storage({
      collections: {
        media: {
          generateFileURL: ({ filename, prefix }) => {
            const bucket = process.env.AWS_S3_BUCKET_NAME || 'pixelsdigital';
            const region = process.env.AWS_REGION || 'ap-south-1';
            const filePath = prefix ? `${prefix}/${filename}` : filename;
            // encodeURI encodes spaces to %20, but we also must encode + to %2B for S3
            const encodedPath = encodeURI(filePath).replace(/\+/g, '%2B');
            return `https://${bucket}.s3.${region}.amazonaws.com/${encodedPath}`;
          }
        },
      },
      bucket: process.env.AWS_S3_BUCKET_NAME || 'pixelsdigital',
      config: {
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      },
    })
  );
}

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
  serverURL: process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_BASE_URL || 'https://pixelsdigitalsolutions.com') 
    : 'http://localhost:3000',
  cors: [
    'http://localhost:3000', 
    'https://pixelsdigitalsolutions.com', 
    'https://www.pixelsdigitalsolutions.com',
    process.env.NEXT_PUBLIC_BASE_URL || ''
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000', 
    'https://pixelsdigitalsolutions.com', 
    'https://www.pixelsdigitalsolutions.com',
    process.env.NEXT_PUBLIC_BASE_URL || ''
  ].filter(Boolean),
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
    Navbar,
  ],
  plugins,
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'fallback-secret-key', // Ensure you have PAYLOAD_SECRET in .env
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
})
