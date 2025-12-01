import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// API route to delete ALL data (use with caution - for clean production deployment)
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Delete all collections data
    const deletions = await Promise.all([
      db.collection('clients').deleteMany({}),
      db.collection('invoices').deleteMany({}),
      db.collection('projects').deleteMany({}),
      db.collection('leads').deleteMany({}),
      db.collection('expenses').deleteMany({}),
      db.collection('payments').deleteMany({}),
      db.collection('staff').deleteMany({}),
      db.collection('dailyContent').deleteMany({}),
    ]);

    const totalDeleted = deletions.reduce((sum, result) => sum + result.deletedCount, 0);

    return NextResponse.json({
      success: true,
      message: 'All data deleted successfully',
      deletedCounts: {
        clients: deletions[0].deletedCount,
        invoices: deletions[1].deletedCount,
        projects: deletions[2].deletedCount,
        leads: deletions[3].deletedCount,
        expenses: deletions[4].deletedCount,
        payments: deletions[5].deletedCount,
        staff: deletions[6].deletedCount,
        dailyContent: deletions[7].deletedCount,
      },
      totalDeleted,
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );
  }
}
