import { NextResponse } from 'next/server';
import { FinanceDB } from '@/lib/finance';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    await FinanceDB.ensureSystemAccounts(); // Ensure basic accounts exist
    const accounts = await FinanceDB.getAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.type || !body.subType || !body.currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const account = await FinanceDB.createAccount({
      name: body.name,
      type: body.type,
      subType: body.subType,
      currency: body.currency,
      description: body.description,
      isSystem: false // Users can only create non-system accounts
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        if (!body._id) {
            return NextResponse.json({ error: 'Missing _id' }, { status: 400 });
        }
        
        const db = await getDatabase();
        
        // Prevent editing system accounts name/type directly easily, though we can allow descriptions
        const existing = await db.collection('accounts').findOne({ _id: new ObjectId(body._id) });
        if (existing?.isSystem && (existing.name !== body.name || existing.type !== body.type)) {
            return NextResponse.json({ error: 'Cannot modify core properties of system accounts' }, { status: 403 });
        }

        const updateData = {
            name: body.name,
            type: body.type,
            subType: body.subType,
            currency: body.currency,
            description: body.description,
            updatedAt: new Date()
        };

        await db.collection('accounts').updateOne(
            { _id: new ObjectId(body._id) },
            { $set: updateData }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating account:', error);
        return NextResponse.json(
            { error: 'Failed to update account' },
            { status: 500 }
        );
    }
}
