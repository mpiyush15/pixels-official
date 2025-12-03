import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminAuth = cookieStore.get('admin-token'); // Changed from 'admin_auth'
    const clientAuth = cookieStore.get('client-session'); // Changed from 'client_auth'
    
    if (!adminAuth && !clientAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, message, sender, senderName, clientId, clientName, clientEmail, projectName } = await req.json();

    if (!projectId || !message || !sender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('pixelsdigital');

    // If sender is client, check for locked milestones
    if (sender === 'client' && clientAuth) {
      const project = await db.collection('projects').findOne({
        _id: new ObjectId(projectId),
      });

      if (project) {
        const hasLockedMilestone = project.milestones?.some(
          (m: any) => m.amount && m.amount > 0 && m.paymentStatus !== 'paid'
        );

        if (hasLockedMilestone) {
          return NextResponse.json(
            { error: 'Please complete milestone payments before using chat' },
            { status: 403 }
          );
        }
      }
    }

    const chatCollection = db.collection('chats');

    const chatMessage = {
      projectId,
      projectName,
      clientId,
      clientName,
      clientEmail,
      sender,
      senderName,
      message: message.trim(),
      timestamp: new Date(),
      read: false,
    };

    const result = await chatCollection.insertOne(chatMessage);

    return NextResponse.json({
      success: true,
      messageId: result.insertedId,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
