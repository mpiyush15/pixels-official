import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Get all employees
    const employees = await db
      .collection('employees')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    // Generate employee ID if not provided
    const employeeCount = await db.collection('employees').countDocuments();
    const employeeId = body.employeeId || `EMP-${String(employeeCount + 1).padStart(3, '0')}`;

    const employee = {
      employeeId,
      name: body.name,
      email: body.email || '',
      phone: body.phone || '',
      designation: body.designation,
      role: body.role || 'staff', // admin, staff
      department: body.department || '',
      joiningDate: body.joiningDate,
      salary: parseFloat(body.salary || 0),
      status: body.status || 'active', // active, inactive
      isOwner: body.isOwner || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('employees').insertOne(employee);

    return NextResponse.json({
      success: true,
      employeeId: result.insertedId,
      employee: {
        ...employee,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}
