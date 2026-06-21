import { NextResponse } from 'next/server';
import { FinanceDB } from '@/lib/finance';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const referenceId = searchParams.get('referenceId');
    const limit = parseInt(searchParams.get('limit') || '100');

    const filters: any = {};
    if (accountId) filters.accountId = new ObjectId(accountId);
    if (referenceId) filters.referenceId = referenceId;

    const db = await getDatabase();
    
    // Fetch ledger entries and join with account details
    const entries = await db.collection('ledger_entries').aggregate([
      { $match: filters },
      { $sort: { date: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'accounts',
          localField: 'accountId',
          foreignField: '_id',
          as: 'account'
        }
      },
      { $unwind: '$account' }
    ]).toArray();

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ledger entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entries } = body;

    if (!entries || !Array.isArray(entries) || entries.length < 2) {
      return NextResponse.json({ error: 'At least two entries (Debit and Credit) are required' }, { status: 400 });
    }

    // Convert string accountIds to ObjectId if needed
    const parsedEntries = entries.map((e: any) => ({
      ...e,
      accountId: typeof e.accountId === 'string' ? new ObjectId(e.accountId) : e.accountId,
      date: new Date(e.date)
    }));

    const transactionId = await FinanceDB.createJournalEntry(parsedEntries);

    return NextResponse.json({ success: true, transactionId }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}
