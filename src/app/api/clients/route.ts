import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const clients = await db
      .collection('clients')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const client = {
      ...body,
      totalRevenue: 0,
      projectsCount: 0,
      createdAt: new Date(),
    };

    const result = await db.collection('clients').insertOne(client);

    return NextResponse.json({
      success: true,
      clientId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
