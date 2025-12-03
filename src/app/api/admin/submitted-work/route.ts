import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// Get all work submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    const submissions = await db
      .collection('workSubmissions')
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching work submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work submissions' },
      { status: 500 }
    );
  }
}
