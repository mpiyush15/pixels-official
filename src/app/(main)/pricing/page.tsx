import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import PricingTable from '@/components/pricing/PricingTable'
import { Metadata } from 'next'

export const revalidate = 60 // Revalidate page every 60 seconds (ISR)

export const metadata: Metadata = {
  title: 'Pricing - Pixels Growth Planner',
  description: 'Choose your standard plan or build a custom growth plan with Pixels.',
}

export default async function PricingPage() {
  const payload = await getPayload({ config: configPromise })
  
  const pricingConfig = await payload.findGlobal({
    slug: 'pricing-page',
  })

  const [plansRes, featuresRes, categoriesRes] = await Promise.all([
    payload.find({
      collection: 'plans',
      depth: 2,
      sort: 'order',
      limit: 100,
    }),
    payload.find({
      collection: 'features',
      depth: 1,
      sort: 'order',
      limit: 500,
    }),
    payload.find({
      collection: 'feature-categories',
      sort: 'order',
      limit: 100,
    })
  ])

  const pricingData = {
    plans: plansRes.docs,
    features: featuresRes.docs,
    categories: categoriesRes.docs,
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Simple, transparent <span className="text-purple-600">pricing</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose a standard plan or use our Growth Planner to build a custom solution for your business.
          </p>
        </div>

        <PricingTable config={pricingConfig} data={pricingData} />
      </div>
    </main>
  )
}
