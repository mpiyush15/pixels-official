import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await req.json()

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }

    // Get Payload Instance
    const payload = await getPayload({ config: configPromise })

    // Fetch PaymentSettings global from Payload
    const paymentSettings = await payload.findGlobal({
      slug: 'payment-settings',
    })

    if (!paymentSettings?.razorpayKeyId || !paymentSettings?.razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Razorpay keys are not configured in the CMS' },
        { status: 500 }
      )
    }

    // Initialize Razorpay with keys from CMS
    const razorpay = new Razorpay({
      key_id: paymentSettings.razorpayKeyId as string,
      key_secret: paymentSettings.razorpayKeySecret as string,
    })

    // Create an order
    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({ order, key_id: paymentSettings.razorpayKeyId })
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
