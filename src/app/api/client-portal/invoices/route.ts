import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const clientId = request.cookies.get('client-session')?.value;

    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const invoices = await db
      .collection('invoices')
      .find({ clientId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching client invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
