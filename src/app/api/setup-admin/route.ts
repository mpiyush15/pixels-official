import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Check if admin user already exists
    const existingAdmin = await db.collection('employees').findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        admin: existingAdmin,
      });
    }

    // Create admin employee record
    const adminEmployee = {
      employeeId: 'EMP-ADMIN-001',
      name: 'Admin',
      email: '',
      phone: '',
      designation: 'Director',
      role: 'admin',
      department: 'Management',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 0, // Will be set when creating salary records
      status: 'active',
      isOwner: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('employees').insertOne(adminEmployee);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        ...adminEmployee,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to setup admin' },
      { status: 500 }
    );
  }
}
