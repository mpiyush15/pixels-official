import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const leads = await db
      .collection('leads')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const lead = {
      ...body,
      status: 'new',
      createdAt: new Date(),
    };

    const result = await db.collection('leads').insertOne(lead);

    return NextResponse.json({
      success: true,
      leadId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
