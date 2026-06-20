import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const { cashBalance, bankBalance } = body;

    // Check if opening balances already exist to prevent duplicates
    const existingCash = await db.collection('cashflow').findOne({ type: 'income', category: 'opening_balance', accountType: 'cash' });
    const existingBank = await db.collection('cashflow').findOne({ type: 'income', category: 'opening_balance', accountType: 'bank' });

    const entries = [];

    if (!existingCash && cashBalance > 0) {
      entries.push({
        type: 'income',
        category: 'opening_balance',
        amount: parseFloat(cashBalance),
        accountType: 'cash',
        reference: 'Opening Balance',
        description: 'Initial Cash in Hand Balance',
        date: new Date().toISOString(),
        createdAt: new Date(),
      });
    }

    if (!existingBank && bankBalance > 0) {
      entries.push({
        type: 'income',
        category: 'opening_balance',
        amount: parseFloat(bankBalance),
        accountType: 'bank',
        reference: 'Opening Balance',
        description: 'Initial Bank Account Balance',
        date: new Date().toISOString(),
        createdAt: new Date(),
      });
    }

    if (entries.length > 0) {
      await db.collection('cashflow').insertMany(entries);
    }

    return NextResponse.json({ success: true, message: 'Opening balances set successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error setting opening balance:', error);
    return NextResponse.json(
      { error: 'Failed to set opening balance' },
      { status: 500 }
    );
  }
}
