import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const payload = await getPayload({ config: configPromise })

    const proposal = await payload.create({
      collection: 'proposals',
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        businessName: data.businessName,
        industry: data.industry,
        estimatedPrice: data.estimatedPrice,
        configuration: data.configuration,
      },
    })

    // Optionally, if you wanted to send an email to the sales team, you would do it here using Resend/Nodemailer

    return NextResponse.json({ success: true, proposal })
  } catch (error: any) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to submit proposal' },
      { status: 500 }
    )
  }
}
