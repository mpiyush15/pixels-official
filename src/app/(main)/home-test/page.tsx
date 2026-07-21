import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { notFound } from 'next/navigation'
import TestHomeClient from './TestHomeClient'

export default async function TestHomePage() {
  const payload = await getPayload({ config: configPromise })
  const homeData = await payload.findGlobal({
    slug: 'test-home-page',
    depth: 1,
  })

  if (!homeData) {
    notFound();
  }

  return (
    <TestHomeClient homeData={homeData} />
  )
}
