import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST() {
  try {
    const db = await getDatabase();
    
    // Update admin to superadmin
    const result = await db.collection('admins').updateOne(
      { email: 'piyush@pixelsdigital.tech' },
      { $set: { role: 'superadmin' } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        error: 'Admin not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Admin role updated to superadmin',
      modified: result.modifiedCount
    });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}
