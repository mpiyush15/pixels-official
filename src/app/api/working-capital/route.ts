import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { FinanceDB } from '@/lib/finance';

export async function GET() {
  try {
    const db = await getDatabase();
    const capital = await db
      .collection('working_capital')
      .find({})
      .sort({ date: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(capital);
  } catch (error) {
    console.error('Error fetching working capital:', error);
    return NextResponse.json(
      { error: 'Failed to fetch working capital' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const capital = {
      source: body.source || '', // e.g. HDFC Bank Loan, Founder Injection
      description: body.description,
      amount: parseFloat(body.amount),
      date: body.date,
      type: body.type || 'loan', // loan, equity, revenue_reserve
      interestRate: body.interestRate ? parseFloat(body.interestRate) : 0,
      status: body.status || 'active', // active, repaid
      notes: body.notes || '',
      depositedTo: body.depositedTo || 'bank', // cash or bank
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('working_capital').insertOne(capital);

    // If it's cash entering the business, we log it to cashflow
    const cashFlowEntry = {
      type: 'income',
      category: 'capital_injection',
      amount: capital.amount,
      accountType: capital.depositedTo, // Cash or bank
      paymentMethod: capital.depositedTo === 'cash' ? 'cash' : 'bank_transfer',
      reference: `Capital: ${capital.source}`,
      description: capital.description,
      transactionDate: new Date(capital.date),
      date: new Date(capital.date).toISOString(),
      capitalId: result.insertedId.toString(),
      createdAt: new Date(),
    };

    await db.collection('cashflow').insertOne(cashFlowEntry);

    // Create Double-Entry Journal Record
    await FinanceDB.ensureSystemAccounts();
    const accounts = await FinanceDB.getAccounts();
    
    // Debit Bank/Cash
    const paymentAccount = accounts.find(a => capital.depositedTo === 'cash' ? a.name === 'Cash in Hand' : a.subType === 'Bank') || accounts.find(a => a.name === 'Cash in Hand');
    
    let creditAccount;
    if (capital.type === 'loan') {
        creditAccount = accounts.find(a => a.type === 'Liability') || await FinanceDB.createAccount({
            name: `Loan: ${capital.source}`, type: 'Liability', subType: 'Current Liability', currency: 'INR'
        });
    } else if (capital.type === 'equity') {
        creditAccount = accounts.find(a => a.type === 'Equity') || await FinanceDB.createAccount({
            name: `Equity: ${capital.source}`, type: 'Equity', subType: 'Capital', currency: 'INR'
        });
    } else {
        // revenue reserve -> normally retained earnings, an equity account
        creditAccount = accounts.find(a => a.type === 'Equity') || await FinanceDB.createAccount({
            name: `Reserve: ${capital.source}`, type: 'Equity', subType: 'Capital', currency: 'INR'
        });
    }

    if (paymentAccount && creditAccount) {
        await FinanceDB.createJournalEntry([
            {
                accountId: paymentAccount._id || paymentAccount,
                type: 'Debit',
                amount: capital.amount,
                currency: 'INR',
                date: new Date(capital.date),
                description: `Capital Received: ${capital.source}`,
                referenceId: result.insertedId.toString(),
                referenceType: 'Manual'
            },
            {
                accountId: creditAccount._id || creditAccount,
                type: 'Credit',
                amount: capital.amount,
                currency: 'INR',
                date: new Date(capital.date),
                description: `Capital Provided: ${capital.source} (${capital.type})`,
                referenceId: result.insertedId.toString(),
                referenceType: 'Manual'
            }
        ]);
    }

    return NextResponse.json(
      { _id: result.insertedId, ...capital },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating working capital:', error);
    return NextResponse.json(
      { error: 'Failed to create working capital' },
      { status: 500 }
    );
  }
}
