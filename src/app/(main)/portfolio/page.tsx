import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import PortfolioClient from './PortfolioClient'

export default async function PortfolioPage() {
  const payload = await getPayload({ config: configPromise })
  
  // Fetch case studies from the CMS
  const { docs: caseStudies } = await payload.find({
    collection: 'case-studies',
    depth: 1, // Fetch relationships if needed
  })

  return <PortfolioClient caseStudies={caseStudies} />
}
