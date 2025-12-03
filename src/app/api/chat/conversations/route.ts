import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';

// Get all chat conversations (for admin dashboard)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get('admin-token'); // Changed from 'admin_auth'
    
    if (!adminAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('pixelsdigital');
    const chatCollection = db.collection('chats');

    // Aggregate conversations by project
    const conversations = await chatCollection.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$projectId',
          projectName: { $first: '$projectName' },
          clientId: { $first: '$clientId' },
          clientName: { $first: '$clientName' },
          clientEmail: { $first: '$clientEmail' },
          lastMessage: { $first: '$message' },
          lastMessageTime: { $first: '$timestamp' },
          lastSender: { $first: '$sender' },
          messages: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          projectName: 1,
          clientId: 1,
          clientName: 1,
          clientEmail: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          lastSender: 1,
          unreadCount: {
            $size: {
              $filter: {
                input: '$messages',
                as: 'msg',
                cond: { 
                  $and: [
                    { $eq: ['$$msg.sender', 'client'] }, 
                    { $eq: ['$$msg.read', false] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]).toArray();

    const formattedConversations = conversations.map(conv => ({
      projectId: conv._id,
      projectName: conv.projectName,
      clientId: conv.clientId,
      clientName: conv.clientName,
      clientEmail: conv.clientEmail,
      lastMessage: conv.lastMessage,
      lastMessageTime: conv.lastMessageTime,
      lastSender: conv.lastSender,
      unreadCount: conv.unreadCount,
    }));

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
