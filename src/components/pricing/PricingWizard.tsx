'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

export default function PricingWizard({ plannerSettings }: { plannerSettings: any }) {
  const [step, setStep] = useState(1)
  
  const [selections, setSelections] = useState<any>({
    industry: '',
    goals: [],
    platforms: [],
    contentTypes: [],
    videos: 8,
    graphics: 12,
    shootDays: 0,
    hasAds: false,
    adBudget: 0,
    assets: [],
    contentState: ''
  })
  
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', businessName: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Calculate dynamic price
  const estimatedPrice = useMemo(() => {
    let total = 0
    
    // Industry Base Price
    if (selections.industry) {
      const ind = plannerSettings?.industryTemplates?.find((i: any) => i.industryName === selections.industry)
      if (ind) total += ind.basePrice
    }

    // Goals (some might have base prices)
    selections.goals.forEach((g: string) => {
      const goalObj = plannerSettings?.goals?.find((x: any) => x.value === g)
      if (goalObj) total += goalObj.basePrice || 0
    })

    // Platforms
    selections.platforms.forEach((p: string) => {
      const platObj = plannerSettings?.platforms?.find((x: any) => x.value === p)
      if (platObj) total += platObj.cost || 0
    })

    // Add some hardcoded math for the sliders for demonstration, 
    // ideally this would also be pulled from CMS
    total += selections.videos * 1500
    total += selections.graphics * 500
    total += selections.shootDays * 10000
    if (selections.hasAds) total += 5000 // Ads management fee

    return total
  }, [selections, plannerSettings])

  const toggleSelection = (key: string, value: string) => {
    setSelections((prev: any) => {
      const current = prev[key]
      if (Array.isArray(current)) {
        return {
          ...prev,
          [key]: current.includes(value) ? current.filter(v => v !== value) : [...current, value]
        }
      }
      return { ...prev, [key]: value }
    })
  }

  const handleIndustrySelect = (industryName: string) => {
    setSelections({ ...selections, industry: industryName })
    // Pre-fill recommendations
    const ind = plannerSettings?.industryTemplates?.find((i: any) => i.industryName === industryName)
    if (ind && ind.recommendedFeatures) {
      // In a full implementation, you'd parse these and pre-check checkboxes.
      // For now we just set the industry to get the base price.
    }
    setStep(2)
  }

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          industry: selections.industry,
          estimatedPrice,
          configuration: selections
        })
      })
      if (res.ok) {
        setIsSubmitted(true)
      } else {
        alert("Something went wrong.")
      }
    } catch (err) {
      console.error(err)
    }
    setIsSubmitting(false)
  }

  const steps = [
    {
      id: 1,
      title: "What type of business are you?",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {plannerSettings?.industryTemplates?.map((ind: any, i: number) => (
            <button
              key={i}
              onClick={() => handleIndustrySelect(ind.industryName)}
              className={`p-4 rounded-xl border transition-all text-left ${
                selections.industry === ind.industryName ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="font-medium text-gray-900">{ind.industryName}</div>
            </button>
          ))}
          <button
            onClick={() => handleIndustrySelect('Other')}
            className={`p-4 rounded-xl border transition-all text-left ${
              selections.industry === 'Other' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 hover:border-gray-400'
            }`}
          >
            <div className="font-medium text-gray-900">Other</div>
          </button>
        </div>
      )
    },
    {
      id: 2,
      title: "What do you want to grow?",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {plannerSettings?.goals?.map((g: any, i: number) => (
            <button
              key={i}
              onClick={() => toggleSelection('goals', g.value)}
              className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                selections.goals.includes(g.value) ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-900'
              }`}
            >
              <span className="font-medium">{g.label}</span>
              {selections.goals.includes(g.value) && <Check className="w-5 h-5 text-purple-600" />}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 3,
      title: "Which platforms?",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {plannerSettings?.platforms?.map((p: any, i: number) => (
            <button
              key={i}
              onClick={() => toggleSelection('platforms', p.value)}
              className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                selections.platforms.includes(p.value) ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 hover:border-gray-400 text-gray-900'
              }`}
            >
              <span className="font-medium">{p.label}</span>
              {selections.platforms.includes(p.value) && <Check className="w-5 h-5 text-purple-600" />}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 4,
      title: "Content Volume",
      content: (
        <div className="space-y-8">
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-2">How many Videos/Reels per month?</label>
            <input 
              type="range" min="0" max="30" step="2" 
              value={selections.videos} 
              onChange={(e) => setSelections({...selections, videos: parseInt(e.target.value)})}
              className="w-full accent-purple-600"
            />
            <div className="text-right font-bold mt-2 text-gray-900">{selections.videos} Videos</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-2">How many Graphics per month?</label>
            <input 
              type="range" min="0" max="60" step="4" 
              value={selections.graphics} 
              onChange={(e) => setSelections({...selections, graphics: parseInt(e.target.value)})}
              className="w-full accent-purple-600"
            />
            <div className="text-right font-bold mt-2 text-gray-900">{selections.graphics} Graphics</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-2">Shoot Days needed?</label>
            <div className="flex gap-4">
              {[0, 1, 2, 4].map(days => (
                <button
                  key={days}
                  onClick={() => setSelections({...selections, shootDays: days})}
                  className={`flex-1 py-3 rounded-xl border font-medium ${selections.shootDays === days ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 text-gray-700'}`}
                >
                  {days === 0 ? 'None' : days === 4 ? 'Weekly' : `${days} Days`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Get My Custom Proposal",
      content: (
        <form id="proposal-form" onSubmit={submitProposal} className="space-y-4">
          <p className="text-gray-600 mb-6">Enter your details and our team will prepare a formal proposal based on your configuration.</p>
          <input required type="text" placeholder="Your Name" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none text-gray-900" />
          <input required type="text" placeholder="Business Name" value={leadForm.businessName} onChange={e => setLeadForm({...leadForm, businessName: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none text-gray-900" />
          <input required type="email" placeholder="Email Address" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none text-gray-900" />
          <input required type="tel" placeholder="Phone Number" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none text-gray-900" />
        </form>
      )
    }
  ]

  if (isSubmitted) {
    return (
      <div className="text-center py-20 bg-white shadow-sm rounded-2xl border border-gray-200">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-bold mb-2 text-gray-900">Proposal Generated!</h3>
        <p className="text-gray-600">Our sales team has received your configuration. We will be in touch shortly.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start max-w-5xl mx-auto">
      
      {/* Main Form Area */}
      <div className="flex-1 w-full bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-10">
        <div className="mb-8 flex justify-between items-center text-sm font-medium text-gray-500">
          <span>Step {step} of {steps.length}</span>
          <div className="flex gap-1">
            {steps.map((s) => (
              <div key={s.id} className={`h-2 w-8 rounded-full transition-all ${step >= s.id ? 'bg-purple-600' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-8 text-gray-900">{steps[step-1].title}</h2>
            {steps[step-1].content}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-between">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => Math.max(1, s - 1))}
            className="px-6 py-2 rounded-lg text-gray-500 hover:text-gray-900 disabled:opacity-30 font-medium"
          >
            Previous
          </button>
          
          {step < steps.length ? (
            <button 
              onClick={() => setStep(s => Math.min(steps.length, s + 1))}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
            >
              Next Step
            </button>
          ) : (
            <button 
              type="submit"
              form="proposal-form"
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : 'Request Proposal'}
            </button>
          )}
        </div>
      </div>

      {/* Sticky Estimate Sidebar */}
      <div className="w-full md:w-80 bg-white border border-purple-200 shadow-md rounded-2xl p-6 sticky top-24">
        <h3 className="text-lg font-medium text-gray-600 mb-2">Estimated Investment</h3>
        <div className="text-4xl font-bold text-gray-900 mb-6">
          ₹{estimatedPrice.toLocaleString()}
          <span className="text-sm text-gray-500 font-normal ml-1">/mo</span>
        </div>

        <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
          {selections.industry && (
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">Industry Base</span>
               <span className="text-gray-900 font-medium">Included</span>
             </div>
          )}
          {selections.platforms.length > 0 && (
             <div className="flex justify-between text-sm">
               <span className="text-gray-500">Platforms</span>
               <span className="text-gray-900 font-medium">{selections.platforms.length}</span>
             </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Videos</span>
            <span className="text-gray-900 font-medium">{selections.videos}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Graphics</span>
            <span className="text-gray-900 font-medium">{selections.graphics}</span>
          </div>
          {selections.shootDays > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shoot Days</span>
              <span className="text-gray-900 font-medium">{selections.shootDays}</span>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500 italic">
          This is an estimate. Final pricing is confirmed after consultation.
        </p>
      </div>

    </div>
  )
}
