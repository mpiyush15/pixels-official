import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

// Get client's conversations (for client portal)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const clientAuth = cookieStore.get('client-session');
    
    if (!clientAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client ID from session
    const clientId = clientAuth.value;

    const client = await clientPromise;
    const db = client.db('pixelsdigital');
    const chatCollection = db.collection('chats');

    // Get client info to match conversations
    const clientDoc = await db.collection('clients').findOne({
      _id: new ObjectId(clientId),
    });

    if (!clientDoc) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Aggregate conversations by project for this client
    const conversations = await chatCollection.aggregate([
      {
        $match: { clientId: clientId } // Only this client's messages
      },
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
                    { $eq: ['$$msg.sender', 'admin'] }, 
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
    console.error('Error fetching client conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
