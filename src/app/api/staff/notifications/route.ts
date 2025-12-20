import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET staff notifications
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');
    const readNotificationsCollection = db.collection('read_notifications');

    // Get read notification IDs for this staff member
    const readNotifications = await readNotificationsCollection
      .find({ userId: staffId, userType: 'staff' })
      .toArray();

    const readNotificationIds = new Set(
      readNotifications.map((n) => n.notificationId)
    );

    const notifications: any[] = [];

    // Get new task assignments
    const newTasks = await tasksCollection
      .find({
        assignedTo: staffId,
        status: 'assigned',
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    newTasks.forEach((task) => {
      const notificationId = `task-assigned-${task._id}`;
      notifications.push({
        id: notificationId,
        type: 'task-assigned',
        message: `New task assigned: ${task.title}`,
        timestamp: task.createdAt,
        read: readNotificationIds.has(notificationId),
        taskId: task._id.toString(),
      });
    });

    // Get tasks with upcoming deadlines (within 48 hours)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const upcomingTasks = await tasksCollection
      .find({
        assignedTo: staffId,
        status: { $in: ['assigned', 'in-progress'] },
        dueDate: { $lte: twoDaysFromNow.toISOString() },
      })
      .sort({ dueDate: 1 })
      .limit(5)
      .toArray();

    upcomingTasks.forEach((task) => {
      const notificationId = `task-deadline-${task._id}`;
      notifications.push({
        id: notificationId,
        type: 'task-deadline',
        message: `Deadline approaching: ${task.title} (Due: ${new Date(task.dueDate).toLocaleDateString()})`,
        timestamp: task.createdAt,
        read: readNotificationIds.has(notificationId),
        taskId: task._id.toString(),
      });
    });

    // Get approved tasks
    const approvedTasks = await tasksCollection
      .find({
        assignedTo: staffId,
        status: 'approved',
      })
      .sort({ approvedDate: -1 })
      .limit(5)
      .toArray();

    approvedTasks.forEach((task) => {
      const notificationId = `task-approved-${task._id}`;
      notifications.push({
        id: notificationId,
        type: 'task-approved',
        message: `Task approved: ${task.title}`,
        timestamp: task.approvedDate || task.updatedAt,
        read: readNotificationIds.has(notificationId),
        taskId: task._id.toString(),
      });
    });

    // Get revision requests
    const revisionTasks = await tasksCollection
      .find({
        assignedTo: staffId,
        status: 'revision-needed',
      })
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray();

    revisionTasks.forEach((task) => {
      const notificationId = `task-revision-${task._id}`;
      notifications.push({
        id: notificationId,
        type: 'task-comment',
        message: `Revision needed: ${task.title}`,
        timestamp: task.updatedAt,
        read: readNotificationIds.has(notificationId),
        taskId: task._id.toString(),
      });
    });

    // Sort by timestamp (newest first)
    notifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching staff notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// PATCH mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const readNotificationsCollection = db.collection('read_notifications');

    await readNotificationsCollection.updateOne(
      { userId: staffId, userType: 'staff', notificationId },
      {
        $set: {
          userId: staffId,
          userType: 'staff',
          notificationId,
          readAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

// POST mark all notifications as read
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');
    const readNotificationsCollection = db.collection('read_notifications');

    // Get all tasks for this staff member to generate notification IDs
    const tasks = await tasksCollection
      .find({ assignedTo: staffId })
      .toArray();

    const bulkOps = [];
    const now = new Date();

    for (const task of tasks) {
      // Mark various notification types as read
      const notificationIds = [
        `task-assigned-${task._id}`,
        `task-deadline-${task._id}`,
        `task-approved-${task._id}`,
        `task-revision-${task._id}`,
      ];

      for (const notificationId of notificationIds) {
        bulkOps.push({
          updateOne: {
            filter: { userId: staffId, userType: 'staff', notificationId },
            update: {
              $set: {
                userId: staffId,
                userType: 'staff',
                notificationId,
                readAt: now,
              },
            },
            upsert: true,
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      await readNotificationsCollection.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
