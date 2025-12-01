import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const clientType = searchParams.get('type');
    
    // Build query filter - if type is specified, filter by it, otherwise get all
    const filter = clientType ? { clientType } : {};
    
    const clients = await db
      .collection('clients')
      .find(filter)
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
