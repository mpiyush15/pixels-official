import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { getDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import { createAndUploadInvoice } from '@/lib/invoiceGenerator'
import { 
  sendLoginCredentialsEmail, 
  sendPaymentConfirmationEmail, 
  sendInvoiceEmail 
} from '@/lib/email'

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
      const db = await getDatabase()
      const { customerData, planName, amount, billingPeriod } = paymentDetails
      const { firstName, lastName, email, phone, company } = customerData || {}
      
      const clientName = `${firstName} ${lastName}`.trim() || 'Valued Client'

      // 1. Check or Create Client
      let client = await db.collection('clients').findOne({ email })
      let isNewClient = false
      let rawPassword = ''

      if (!client && email) {
        isNewClient = true
        rawPassword = Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(rawPassword, 10)
        
        const newClient = {
          name: clientName,
          email: email,
          phone: phone || '',
          company: company || '',
          password: hashedPassword,
          status: 'active',
          projectsCount: 0,
          totalSpent: amount,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const clientRes = await db.collection('clients').insertOne(newClient)
        client = { _id: clientRes.insertedId, ...newClient }
      } else if (client) {
        await db.collection('clients').updateOne(
          { _id: client._id },
          { $inc: { totalSpent: amount } }
        )
      }

      // 2. Generate and Save Invoice
      const count = await db.collection('invoices').countDocuments()
      const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`
      const issueDate = new Date()
      const dueDate = new Date()
      
      const invoiceData = {
        invoiceNumber,
        clientName,
        clientEmail: email || '',
        clientCompany: company || '',
        invoiceDate: issueDate,
        dueDate: dueDate,
        items: [{
          description: `Subscription: ${planName} - ${billingPeriod}`,
          quantity: 1,
          rate: amount,
          amount: amount
        }],
        subtotal: amount,
        total: amount,
        status: 'paid' as const
      }

      const uploadResult = await createAndUploadInvoice(invoiceData)

      const dbInvoice = {
        invoiceNumber,
        clientId: client?._id?.toString() || null,
        clientName,
        clientEmail: email,
        services: invoiceData.items,
        subtotal: amount,
        tax: 0,
        total: amount,
        status: 'paid',
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        s3Key: uploadResult.success ? uploadResult.key : null,
        s3Url: uploadResult.success ? uploadResult.url : null,
        s3UploadedAt: uploadResult.success ? new Date() : null,
        createdAt: new Date()
      }

      await db.collection('invoices').insertOne(dbInvoice)

      // 3. Save Payment to CMS (using Payload for the admin panel /payments)
      await payload.create({
        collection: 'payments',
        data: {
          customerName: clientName,
          customerEmail: email || 'unknown@example.com',
          planName: planName || 'Unknown',
          billingPeriod: billingPeriod || 'Monthly',
          amount: amount,
          currency: paymentDetails.currency || 'INR',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'success',
        },
      })

      // 4. Send Emails in background (don't await them to avoid blocking response)
      if (email) {
        Promise.all([
          // Send Payment Confirmation
          sendPaymentConfirmationEmail(email, clientName, amount, razorpay_payment_id, new Date()),
          
          // Send Invoice (if URL available)
          uploadResult.success && uploadResult.url ? 
            sendInvoiceEmail(email, clientName, invoiceNumber, amount, dueDate, invoiceData.items, uploadResult.url) : Promise.resolve(),

          // Send Login Credentials for new users
          isNewClient ? 
            sendLoginCredentialsEmail(email, clientName, email, rawPassword, `${process.env.NEXT_PUBLIC_BASE_URL || 'https://pixelsdigitalsolutions.com'}/client-portal/login`) : Promise.resolve()
        ]).catch(err => console.error('Failed to send automated emails:', err))
      }

      return NextResponse.json({ success: true })
    } else {
      // Save failed payment
      await payload.create({
        collection: 'payments',
        data: {
          customerName: paymentDetails?.customerData?.firstName || 'Unknown',
          customerEmail: paymentDetails?.customerData?.email || 'unknown@example.com',
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
