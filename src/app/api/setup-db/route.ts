import { getDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Create unique index on staff email
    await db.collection('staff').createIndex({ email: 1 }, { unique: true });
    
    // Create indexes for daily content
    await db.collection('dailyContent').createIndex({ clientId: 1 });
    await db.collection('dailyContent').createIndex({ createdBy: 1 });
    await db.collection('dailyContent').createIndex({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: 'Database indexes created successfully',
    });
  } catch (error: any) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
