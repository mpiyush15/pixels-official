import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get('admin-token'); // Changed from 'admin_auth'
    const clientAuth = cookieStore.get('client-session'); // Changed from 'client_auth'
    
    if (!adminAuth && !clientAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const skipMarkAsRead = searchParams.get('skipMarkAsRead') === 'true';

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('pixelsdigital');
    const chatCollection = db.collection('chats');

    // Mark messages as read FIRST if viewed by the opposite party (unless skipped)
    if (!skipMarkAsRead) {
      if (adminAuth) {
        // Admin viewing, mark client messages as read
        await chatCollection.updateMany(
          { projectId, sender: 'client', read: false },
          { $set: { read: true } }
        );
      } else if (clientAuth) {
        // Client viewing, mark admin messages as read
        await chatCollection.updateMany(
          { projectId, sender: 'admin', read: false },
          { $set: { read: true } }
        );
      }
    }

    // Get all messages for this project, sorted by timestamp
    const messages = await chatCollection
      .find({ projectId })
      .sort({ timestamp: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
