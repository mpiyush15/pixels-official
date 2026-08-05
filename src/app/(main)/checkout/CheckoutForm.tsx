'use client'

import React, { useState } from 'react'

export default function CheckoutForm({ planId, planName, billingPeriod, amount }: { planId: string, planName: string, billingPeriod: string, amount: number }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [emailStatus, setEmailStatus] = useState<'checking' | 'exists' | 'new' | ''>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'email') {
      if (value.includes('@') && value.includes('.')) {
        checkEmail(value)
      } else {
        setEmailStatus('')
      }
    }
  }

  const checkEmail = async (email: string) => {
    setEmailStatus('checking')
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.exists) {
        setEmailStatus('exists')
      } else {
        setEmailStatus('new')
      }
    } catch (e) {
      setEmailStatus('')
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsProcessing(true)

    const res = await loadRazorpayScript()
    if (!res) {
      setError('Razorpay SDK failed to load. Are you online?')
      setIsProcessing(false)
      return
    }

    try {
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          notes: {
            planId,
            planName,
            billingPeriod,
            customerEmail: formData.email,
            customerPhone: formData.phone
          }
        }),
      })

      const orderData = await orderResponse.json()
      if (orderData.error) throw new Error(orderData.error)

      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Pixels Digital',
        description: `${planName} - ${billingPeriod}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            const verifyData = {
              ...response,
              paymentDetails: {
                planId,
                planName,
                billingPeriod,
                amount,
                currency: 'INR',
                customerData: formData
              }
            }
            
            // Show a processing message while backend does heavy lifting (creates client, invoice, sends emails)
            const result = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(verifyData),
            })
            
            const resultData = await result.json()
            if (!result.ok || resultData.error) {
               throw new Error(resultData.error || 'Payment verification failed on server')
            }

            // Redirect to a success page or client portal
            window.location.href = '/client-portal/dashboard'
          } catch (err: any) {
            console.error(err)
            alert('Payment was successful, but there was an error setting up your account. Please contact support.')
          }
        },
        prefill: { 
          name: `${formData.firstName} ${formData.lastName}`.trim(), 
          email: formData.email, 
          contact: formData.phone 
        },
        theme: { color: '#8b5cf6' }
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to initiate payment')
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Details</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input 
              type="text" 
              name="firstName" 
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input 
              type="text" 
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input 
            type="email" 
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
          {emailStatus === 'exists' && (
            <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Account found! We will seamlessly upgrade your existing workspace.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input 
            type="tel" 
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company / Brand Name (Optional)</label>
          <input 
            type="text" 
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
          />
        </div>

        <div className="pt-4 mt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl font-bold transition-all bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Pay Securely — ₹{amount.toLocaleString()}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
