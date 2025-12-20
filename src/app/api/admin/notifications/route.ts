import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Get admin ID from token (for now, we'll use a default admin ID)
    // In production, decode JWT token to get admin ID
    const adminId = 'admin'; // You can enhance this to get actual admin ID from token

    // Get recent activities from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get list of read notification IDs for this admin
    const readNotifications = await db
      .collection('read_notifications')
      .find({ adminId })
      .toArray();
    
    const readIds = new Set(readNotifications.map(rn => rn.notificationId));

    const notifications = [];

    // 1. Contract Acceptances
    const recentContracts = await db
      .collection('projects')
      .find({
        contractAccepted: true,
        contractAcceptedAt: { $gte: sevenDaysAgo },
      })
      .sort({ contractAcceptedAt: -1 })
      .limit(20)
      .toArray();

    for (const project of recentContracts) {
      const notificationId = `contract-${project._id}`;
      notifications.push({
        id: notificationId,
        type: 'contract',
        title: 'Contract Accepted',
        message: `${project.clientEmail} accepted contract for "${project.projectName}"`,
        timestamp: project.contractAcceptedAt,
        projectId: project._id,
        projectName: project.projectName,
        read: readIds.has(notificationId),
      });
    }

    // 2. Payment Completions
    const recentPayments = await db
      .collection('payments')
      .find({
        status: 'SUCCESS',
        createdAt: { $gte: sevenDaysAgo },
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    for (const payment of recentPayments) {
      const notificationId = `payment-${payment._id}`;
      notifications.push({
        id: notificationId,
        type: 'payment',
        title: 'Payment Received',
        message: `₹${payment.amount.toLocaleString()} received for ${payment.description || 'project'}`,
        timestamp: payment.createdAt,
        amount: payment.amount,
        paymentId: payment._id,
        read: readIds.has(notificationId),
      });
    }

    // 3. Work Submissions
    const recentSubmissions = await db
      .collection('work_submissions')
      .find({
        createdAt: { $gte: sevenDaysAgo },
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    for (const submission of recentSubmissions) {
      const notificationId = `submission-${submission._id}`;
      notifications.push({
        id: notificationId,
        type: 'submission',
        title: 'Work Submitted',
        message: `New work submission for "${submission.projectName}"`,
        timestamp: submission.createdAt,
        projectId: submission.projectId,
        projectName: submission.projectName,
        submissionId: submission._id,
        read: readIds.has(notificationId),
      });
    }

    // 4. Project Status Changes (track recent updates)
    const recentProjectUpdates = await db
      .collection('projects')
      .find({
        updatedAt: { $gte: sevenDaysAgo },
        status: { $in: ['completed', 'review'] },
      })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    for (const project of recentProjectUpdates) {
      const notificationId = `status-${project._id}-${project.updatedAt}`;
      notifications.push({
        id: notificationId,
        type: 'status',
        title: 'Project Status Update',
        message: `"${project.projectName}" is now ${project.status}`,
        timestamp: project.updatedAt,
        projectId: project._id,
        projectName: project.projectName,
        status: project.status,
        read: readIds.has(notificationId),
      });
    }

    // Sort all notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Count only unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;

    // Return top 30 most recent
    return NextResponse.json({
      notifications: notifications.slice(0, 30),
      unreadCount: unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const { notificationId } = await request.json();
    const db = await getDatabase();
    
    // Get admin ID (enhance this to get from JWT token)
    const adminId = 'admin';

    if (notificationId === 'all') {
      // Mark all as read - we'll handle this by clearing and re-adding all current notifications
      const response = await fetch(request.url.replace('/admin/notifications', '/admin/notifications'), {
        method: 'GET',
      });
      
      // For now, just return success
      return NextResponse.json({ success: true });
    } else {
      // Mark single notification as read
      await db.collection('read_notifications').updateOne(
        { adminId, notificationId },
        { 
          $set: { 
            adminId, 
            notificationId, 
            readAt: new Date() 
          } 
        },
        { upsert: true }
      );

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const adminId = 'admin';
    
    // Get all current notification IDs
    const { notificationIds } = await request.json();
    
    if (notificationIds && notificationIds.length > 0) {
      const operations = notificationIds.map((id: string) => ({
        updateOne: {
          filter: { adminId, notificationId: id },
          update: { 
            $set: { 
              adminId, 
              notificationId: id, 
              readAt: new Date() 
            } 
          },
          upsert: true,
        },
      }));

      await db.collection('read_notifications').bulkWrite(operations);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}
