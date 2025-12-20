import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET tasks for client
export async function GET(request: NextRequest) {
  try {
    // Get client from session cookie
    const clientCookie = request.cookies.get('client-session')?.value;
    
    if (!clientCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse client ID from cookie
    let clientId: string;
    try {
      const parsed = JSON.parse(clientCookie);
      clientId = parsed.clientId || parsed._id || clientCookie;
    } catch {
      clientId = clientCookie;
    }

    const db = await getDatabase();
    const { ObjectId } = require('mongodb');
    
    // Get client document
    const clientsCollection = db.collection('clients');
    const client = await clientsCollection.findOne({ _id: new ObjectId(clientId) });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get tasks for this client
    const tasksCollection = db.collection('tasks');
    const tasks = await tasksCollection
      .find({ clientId: clientId })
      .sort({ dueDate: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(
      tasks.map((task) => ({ ...task, _id: task._id.toString() }))
    );
  } catch (error: any) {
    console.error('Error fetching client tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
