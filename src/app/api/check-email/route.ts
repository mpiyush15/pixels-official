import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'clients',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    return NextResponse.json({ exists: result.totalDocs > 0 })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
