import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this');

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    // Get staff to find assigned clients
    const db = await getDatabase();
    const { ObjectId } = require('mongodb');
    
    const staffCollection = db.collection('staff');
    const staff = await staffCollection.findOne({ _id: new ObjectId(staffId) });

    if (!staff || !staff.assignedClients || staff.assignedClients.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch client details
    const clientsCollection = db.collection('clients');
    
    const clientIds = staff.assignedClients.map((id: string) => {
      try {
        return new ObjectId(id);
      } catch {
        return id;
      }
    });

    const clients = await clientsCollection
      .find({ _id: { $in: clientIds } })
      .toArray();

    const sanitizedClients = clients.map(c => ({
      ...c,
      _id: c._id.toString(),
    }));

    return NextResponse.json(sanitizedClients);
  } catch (error) {
    console.error('Error fetching assigned clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
