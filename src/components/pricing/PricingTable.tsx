'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import PricingWizard from './PricingWizard'
import Link from 'next/link'

type BillingPeriod = 'monthly' | 'quarterly' | 'annual'

export default function PricingTable({ config, data }: { config: any, data?: any }) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [showWizard, setShowWizard] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Use the new relational data if available, fallback to old config (for safety during migration)
  const plans = data?.plans || config?.standardPlans || []
  const features = data?.features || []
  const categories = data?.categories || []

  // If using the old structure, fallback for rows
  const oldFeatureRows = Array.from(new Set(
    (config?.standardPlans || []).flatMap((plan: any) => 
      (plan.features || []).map((f: any) => f.featureText)
    )
  )).filter(Boolean) as string[]

  const isModular = categories.length > 0 && features.length > 0

  const getPrice = (plan: any) => {
    if (billingPeriod === 'monthly') return plan.monthlyPrice
    if (billingPeriod === 'quarterly') return plan.quarterlyPrice
    if (billingPeriod === 'annual') return plan.annualPrice
    return plan.monthlyPrice
  }

  // The payment handling is now completely offloaded to the new /checkout page.
  // We keep this component purely for display and routing.

  if (showWizard) {
    return (
      <div className="mt-8">
        <button 
          onClick={() => setShowWizard(false)}
          className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2"
        >
          &larr; Back to standard plans
        </button>
        <PricingWizard plannerSettings={config?.plannerSettings} />
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 p-1 rounded-full flex items-center">
          {(['monthly', 'quarterly', 'annual'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setBillingPeriod(period)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === period
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
              {period === 'annual' && <span className="ml-2 text-xs text-green-700 bg-green-200 px-2 py-0.5 rounded-full">Save 20%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-16 px-4">
        {plans.map((plan: any) => (
          <div key={plan.id} className={`relative bg-white rounded-3xl border ${plan.isRecommended ? 'border-purple-500 shadow-xl shadow-purple-500/10' : 'border-gray-200 shadow-sm'} p-8 flex flex-col`}>
            {plan.isRecommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                Recommended
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.icon} {plan.name || plan.title}</h3>
              {plan.description && <p className="text-gray-500">{plan.description}</p>}
            </div>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">₹{getPrice(plan)?.toLocaleString() || 0}</span>
              <span className="text-gray-500">/{billingPeriod === 'monthly' ? 'mo' : billingPeriod === 'quarterly' ? 'qtr' : 'yr'}</span>
            </div>
            
            <Link
              href={`/checkout?planId=${plan.id}&billing=${billingPeriod}`}
              className={`w-full py-3 rounded-xl font-bold transition-all mb-8 flex justify-center items-center ${plan.isRecommended ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
            >
              Get Started
            </Link>

            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-4">Top Features:</p>
              <ul className="space-y-3">
                {isModular ? (
                  plan.planFeatures?.filter((f: any) => f.value && !['no', 'false'].includes(f.value.toLowerCase())).slice(0, 4).map((f: any, idx: number) => {
                    const featureObj = typeof f.feature === 'string' ? features.find((feat: any) => feat.id === f.feature) : f.feature
                    return (
                      <li key={idx} className="flex items-start gap-3 text-gray-600">
                        <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                        <span>{featureObj?.title || 'Included'}</span>
                      </li>
                    )
                  })
                ) : (
                  plan.features?.filter((f: any) => f.value && ['yes', 'true'].includes(f.value.toLowerCase())).slice(0, 4).map((f: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600">
                      <Check className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                      <span>{f.featureText}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900">Compare All Features</h3>
        <p className="text-gray-600 mt-2">See exactly what's included in every plan</p>
      </div>

      {/* Matrix Table */}
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-6 border-b border-gray-200 bg-gray-50/50 min-w-[200px]">
                  <h3 className="text-xl font-bold text-gray-900">Features</h3>
                </th>
                {plans.map((plan: any) => (
                  <th key={plan.id} className="p-6 border-b border-gray-200 bg-white text-center min-w-[150px]">
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {plan.icon} {plan.name || plan.title}
                    </div>
                  </th>
                ))}
              </tr>
              {/* Pricing Row */}
              <tr>
                <td className="p-6 border-b border-gray-200 font-medium text-gray-700">
                  {billingPeriod.charAt(0).toUpperCase() + billingPeriod.slice(1)} Price
                </td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="p-6 border-b border-gray-200 text-center">
                    <span className="text-2xl font-bold text-gray-900">₹{getPrice(plan)?.toLocaleString() || 0}</span>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {isModular ? (
                // Modular rendering based on categories
                categories.map((cat: any) => {
                  const catFeatures = features.filter((f: any) => typeof f.category === 'string' ? f.category === cat.id : f.category?.id === cat.id)
                  if (!catFeatures.length) return null

                  return (
                    <React.Fragment key={cat.id}>
                      {/* Category Header Row */}
                      <tr>
                        <td colSpan={plans.length + 1} className="p-4 px-6 bg-gray-100 text-sm font-bold text-gray-900 uppercase tracking-wider">
                          {cat.title}
                        </td>
                      </tr>
                      {/* Features in this category */}
                      {catFeatures.map((feat: any) => (
                        <tr key={feat.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 px-6 border-b border-gray-100 text-sm font-medium text-gray-800">
                            {feat.title} {feat.icon && <span className="ml-1">{feat.icon}</span>}
                          </td>
                          {plans.map((plan: any) => {
                            const planFeat = plan.planFeatures?.find((pf: any) => (typeof pf.feature === 'string' ? pf.feature === feat.id : pf.feature?.id === feat.id))
                            const val = planFeat ? (planFeat.value || 'Yes') : null

                            return (
                              <td key={plan.id} className="p-4 px-6 border-b border-gray-100 text-center">
                                {!val ? (
                                  <span className="text-gray-400">—</span>
                                ) : val.toLowerCase() === 'yes' || val.toLowerCase() === 'true' ? (
                                  <div className="flex justify-center"><Check className="w-5 h-5 text-green-500" strokeWidth={3} /></div>
                                ) : val.toLowerCase() === 'no' || val.toLowerCase() === 'false' ? (
                                  <span className="text-gray-400">—</span>
                                ) : (
                                  <span className="text-gray-700 font-medium">{val}</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })
              ) : (
                // Fallback rendering for old data structure
                oldFeatureRows.map((rowName: string, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 px-6 border-b border-gray-100 text-sm font-medium text-gray-800">
                      {rowName}
                    </td>
                    {plans.map((plan: any) => {
                      const featureObj = plan.features?.find((f: any) => f.featureText === rowName)
                      const val = featureObj ? (featureObj.value || 'Yes') : null

                      return (
                        <td key={plan.id} className="p-4 px-6 border-b border-gray-100 text-center">
                          {!val ? (
                            <span className="text-gray-400">—</span>
                          ) : val.toLowerCase() === 'yes' || val.toLowerCase() === 'true' ? (
                            <div className="flex justify-center"><Check className="w-5 h-5 text-green-500" strokeWidth={3} /></div>
                          ) : val.toLowerCase() === 'no' || val.toLowerCase() === 'false' ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span className="text-gray-700 font-medium">{val}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-6 bg-gray-50/50"></td>
                {plans.map((plan: any) => (
                  <td key={plan.id} className="p-6 bg-white text-center">
                    <Link
                      href={`/checkout?planId=${plan.id}&billing=${billingPeriod}`}
                      className="w-full block py-2.5 px-4 rounded-lg font-medium transition-all bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                    >
                      Get Started
                    </Link>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      {/* Custom Plan Callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center bg-gradient-to-b from-purple-50 to-white border border-purple-200 rounded-2xl p-10 shadow-sm"
      >
        <h3 className="text-3xl font-bold mb-4 text-gray-900">Need a Custom Solution?</h3>
        <p className="text-gray-600 mb-8 text-lg">Build a tailored package that fits your exact needs. Access to all features, custom volumes, and dedicated support.</p>
        <button
          onClick={() => setShowWizard(true)}
          className="px-8 py-3 rounded-xl font-bold transition-all bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          Open Interactive Growth Planner
        </button>
      </motion.div>
    </div>
  )
}
