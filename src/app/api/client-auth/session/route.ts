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

    // Only allow development clients or clients without clientType (legacy) to access portal
    if (!client || client.status === 'inactive') {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (client.clientType && client.clientType !== 'development') {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'Portal access is only available for development clients'
      }, { status: 403 });
    }

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
