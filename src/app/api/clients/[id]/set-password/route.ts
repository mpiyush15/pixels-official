import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update client with hashed password
    await db.collection('clients').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          password: hashedPassword,
          portalAccessEnabled: true,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Client portal access enabled',
    });
  } catch (error) {
    console.error('Error setting client password:', error);
    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    );
  }
}
