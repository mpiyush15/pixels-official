import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentDetails } = await req.json()

    const payload = await getPayload({ config: configPromise })
    const paymentSettings = await payload.findGlobal({ slug: 'payment-settings' })

    if (!paymentSettings?.razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay keys missing' }, { status: 500 })
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const expectedSignature = crypto
      .createHmac('sha256', paymentSettings.razorpayKeySecret as string)
      .update(text)
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Save payment to CMS
      await payload.create({
        collection: 'payments',
        data: {
          customerName: paymentDetails.customerName || 'Unknown',
          customerEmail: paymentDetails.customerEmail || 'unknown@example.com',
          planName: paymentDetails.planName || 'Unknown',
          billingPeriod: paymentDetails.billingPeriod || 'Monthly',
          amount: paymentDetails.amount,
          currency: paymentDetails.currency || 'INR',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'success',
        },
      })

      return NextResponse.json({ success: true })
    } else {
      // Save failed payment
      await payload.create({
        collection: 'payments',
        data: {
          customerName: paymentDetails?.customerName || 'Unknown',
          customerEmail: paymentDetails?.customerEmail || 'unknown@example.com',
          planName: paymentDetails?.planName || 'Unknown',
          billingPeriod: paymentDetails?.billingPeriod || 'Monthly',
          amount: paymentDetails?.amount || 0,
          currency: paymentDetails?.currency || 'INR',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'failed',
        },
      })
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
