import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// PUT - Update bank details for staff
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('staff-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);
    const staffId = payload.staffId as string;

    const { accountHolderName, bankName, accountNumber, ifscCode, upiId } = await request.json();

    // Validate required fields
    if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
      return NextResponse.json(
        { error: 'Missing required bank details' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const staffCollection = db.collection('staff');

    // Update staff document with bank details
    const result = await staffCollection.updateOne(
      { _id: new ObjectId(staffId) },
      {
        $set: {
          bankDetails: {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode,
            upiId: upiId || null,
          },
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bank details updated successfully' });
  } catch (error: any) {
    console.error('Error updating bank details:', error);
    return NextResponse.json(
      { error: 'Failed to update bank details' },
      { status: 500 }
    );
  }
}
