import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';

// Get total unread message count
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get('admin-token');
    const clientAuth = cookieStore.get('client-session');
    
    if (!adminAuth && !clientAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('pixelsdigital');
    const chatCollection = db.collection('chats');

    let unreadCount = 0;

    if (adminAuth) {
      // Admin: count unread messages from clients
      unreadCount = await chatCollection.countDocuments({
        sender: 'client',
        read: false,
      });
    } else if (clientAuth) {
      // Client: count unread messages from admin
      unreadCount = await chatCollection.countDocuments({
        sender: 'admin',
        read: false,
      });
    }

    return NextResponse.json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
