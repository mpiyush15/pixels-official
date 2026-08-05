import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Metadata } from 'next'
import CheckoutForm from './CheckoutForm'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Secure Checkout - Pixels Digital',
  description: 'Complete your purchase securely.',
}

export default async function CheckoutPage(props: { searchParams: Promise<{ planId?: string, billing?: string }> }) {
  const searchParams = await props.searchParams
  const planId = searchParams.planId
  const billingPeriod = (searchParams.billing || 'monthly') as 'monthly' | 'quarterly' | 'annual'

  if (!planId) {
    return notFound()
  }

  const payload = await getPayload({ config: configPromise })
  
  let plan
  try {
    plan = await payload.findByID({
      collection: 'plans',
      id: planId,
      depth: 1,
    })
  } catch (error) {
    return notFound()
  }

  if (!plan) return notFound()

  const getPrice = () => {
    if (billingPeriod === 'monthly') return plan.monthlyPrice
    if (billingPeriod === 'quarterly') return plan.quarterlyPrice
    if (billingPeriod === 'annual') return plan.annualPrice
    return plan.monthlyPrice
  }

  const price = getPrice() || 0

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Checkout</h1>
          <p className="text-gray-600">You're one step away from growing with Pixels Digital.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column - Form */}
          <div className="md:col-span-2">
            <CheckoutForm planId={plan.id} planName={plan.name} billingPeriod={billingPeriod} amount={price} />
          </div>

          {/* Right Column - Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{plan.name} Plan</h3>
                    <p className="text-sm text-gray-500 capitalize">{billingPeriod} Billing</p>
                  </div>
                  <span className="font-bold text-lg text-gray-900">₹{price.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-b border-gray-100 pb-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Includes:</h4>
                <ul className="space-y-2">
                  {(plan.planFeatures || []).slice(0, 5).map((pf: any, idx: number) => {
                    if (!pf.value || ['no', 'false'].includes(pf.value.toLowerCase())) return null
                    const featName = typeof pf.feature === 'string' ? 'Premium Feature' : pf.feature.title
                    return (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {featName}
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-2xl text-purple-600">₹{price.toLocaleString()}</span>
              </div>
              
              <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure 256-bit SSL encrypted payment
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
