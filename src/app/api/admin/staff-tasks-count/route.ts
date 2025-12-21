import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET - Count approved tasks for a staff member in a specific month
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await jwtVerify(token, secret);

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');
    const month = searchParams.get('month'); // Format: YYYY-MM

    if (!staffId || !month) {
      return NextResponse.json(
        { error: 'staffId and month are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const tasksCollection = db.collection('tasks');

    // Parse month to get date range
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59, 999);

    // Count approved tasks in the given month
    const count = await tasksCollection.countDocuments({
      assignedTo: staffId,
      status: 'approved',
      completedDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error counting tasks:', error);
    return NextResponse.json(
      { error: 'Failed to count tasks' },
      { status: 500 }
    );
  }
}
