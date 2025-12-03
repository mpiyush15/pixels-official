import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Track a page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const analyticsData = {
      page: body.page,
      referrer: body.referrer || 'direct',
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      timestamp: new Date(),
      sessionId: body.sessionId,
    };

    await db.collection('analytics').insertOne(analyticsData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

// Get analytics data
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total page views
    const totalViews = await db.collection('analytics').countDocuments({
      timestamp: { $gte: startDate }
    });

    // Unique visitors (by IP)
    const uniqueVisitors = await db.collection('analytics').distinct('ip', {
      timestamp: { $gte: startDate }
    });

    // Views by page
    const pageViews = await db.collection('analytics').aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Traffic sources
    const trafficSources = await db.collection('analytics').aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Daily views
    const dailyViews = await db.collection('analytics').aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Real-time visitors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const realtimeVisitors = await db.collection('analytics').distinct('sessionId', {
      timestamp: { $gte: fiveMinutesAgo }
    });

    return NextResponse.json({
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      pageViews: pageViews.map(p => ({ page: p._id, views: p.count })),
      trafficSources: trafficSources.map(t => ({ source: t._id, count: t.count })),
      dailyViews: dailyViews.map(d => ({ date: d._id, views: d.count })),
      realtimeVisitors: realtimeVisitors.length,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
