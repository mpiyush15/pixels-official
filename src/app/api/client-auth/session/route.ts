import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const clientId = request.cookies.get('client-session')?.value;

    if (!clientId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const db = await getDatabase();
    const client = await db.collection('clients').findOne({
      _id: new ObjectId(clientId),
    });

    // Check if client exists and is active
    if (!client || client.status === 'inactive') {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // All clients can now access the portal
    return NextResponse.json({
      authenticated: true,
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        company: client.company,
        phone: client.phone,
        address: client.address,
      },
    });
  } catch (error) {
    console.error('Client session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
