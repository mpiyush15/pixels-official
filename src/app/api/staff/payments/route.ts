import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET payment history for staff
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    const db = await getDatabase();
    
    // Check if collection exists
    const collections = await db.listCollections({ name: 'staff_payments' }).toArray();
    if (collections.length === 0) {
      // Collection doesn't exist yet, return empty array
      return NextResponse.json([]);
    }
    
    const paymentsCollection = db.collection('staff_payments');

    // Fetch all payments for this staff member
    const payments = await paymentsCollection
      .find({ staffId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
