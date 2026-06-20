import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const receivables = await db
      .collection('receivables')
      .find({})
      .sort({ expectedDate: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json(receivables);
  } catch (error) {
    console.error('Error fetching receivables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receivables' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const receivable = {
      clientId: body.clientId || null,
      clientName: body.clientName || '',
      projectId: body.projectId || null,
      projectName: body.projectName || '',
      description: body.description,
      amount: parseFloat(body.amount),
      expectedDate: body.expectedDate,
      status: body.status || 'expected', // expected, invoiced, received, delayed
      type: body.type || 'milestone', // milestone, retainer, deposit, other
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('receivables').insertOne(receivable);

    return NextResponse.json(
      { _id: result.insertedId, ...receivable },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating receivable:', error);
    return NextResponse.json(
      { error: 'Failed to create receivable' },
      { status: 500 }
    );
  }
}
