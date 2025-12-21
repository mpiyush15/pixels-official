import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// GET work summary for staff
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

    // Get all tasks for this staff member
    const allTasks = await tasksCollection
      .find({ assignedTo: staffId })
      .toArray();

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => 
      ['completed', 'submitted', 'approved'].includes(t.status)
    ).length;
    const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
    const approvedTasks = allTasks.filter(t => t.status === 'approved').length;

    // Generate weekly stats (last 4 weeks)
    const weeklyStats = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekTasks = allTasks.filter(t => {
        const completedDate = t.completedDate ? new Date(t.completedDate) : null;
        return completedDate && completedDate >= weekStart && completedDate <= weekEnd;
      });

      weeklyStats.push({
        week: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        completed: weekTasks.length,
        approved: weekTasks.filter(t => t.status === 'approved').length,
      });
    }

    // Generate monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      monthDate.setDate(1);
      monthDate.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthDate);
      monthEnd.setMonth(monthDate.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthTasks = allTasks.filter(t => {
        const completedDate = t.completedDate ? new Date(t.completedDate) : null;
        return completedDate && completedDate >= monthDate && completedDate <= monthEnd;
      });

      monthlyStats.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        completed: monthTasks.length,
        approved: monthTasks.filter(t => t.status === 'approved').length,
      });
    }

    return NextResponse.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      approvedTasks,
      weeklyStats,
      monthlyStats,
    });
  } catch (error: any) {
    console.error('Error fetching work summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work summary' },
      { status: 500 }
    );
  }
}
