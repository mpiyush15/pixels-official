import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const db = await getDatabase()
    const client = await db.collection('clients').findOne({ email })

    return NextResponse.json({ exists: !!client })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
