import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    const db = await getDatabase();
    
    // Check if admin already exists
    const existingAdmin = await db.collection('admins').findOne({ 
      email: 'piyush@pixelsdigital.tech' 
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Admin already exists' 
      });
    }

    // Create admin user
    const hashedPassword = await hashPassword('Pm@22442232');
    
    await db.collection('admins').insertOne({
      email: 'piyush@pixelsdigital.tech',
      password: hashedPassword,
      name: 'Piyush Magar',
      role: 'admin',
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      success: true,
      message: 'Admin created successfully' 
    });
  } catch (error) {
    console.error('Init admin error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
