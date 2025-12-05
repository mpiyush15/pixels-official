import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const salaries = await db
      .collection('salaries')
      .find({})
      .sort({ year: -1, month: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: salaries
    });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch salaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const salary = {
      employeeName: body.employeeName,
      employeeId: body.employeeId || null,
      designation: body.designation || '',
      amount: parseFloat(body.amount),
      month: body.month, // 1-12
      year: body.year,
      paymentDate: body.paymentDate,
      paymentMethod: body.paymentMethod || 'bank_transfer',
      accountType: body.accountType || 'bank', // cash, bank
      bankName: body.bankName || '',
      transactionId: body.transactionId || '',
      status: body.status || 'paid', // paid, pending
      deductions: parseFloat(body.deductions || 0),
      bonus: parseFloat(body.bonus || 0),
      netAmount: parseFloat(body.amount) - parseFloat(body.deductions || 0) + parseFloat(body.bonus || 0),
      notes: body.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('salaries').insertOne(salary);

    // Auto-create cash flow entry if salary is paid
    if (salary.status === 'paid') {
      // Use accountType from salary (already set as cash or bank)
      const cashFlowEntry = {
        type: 'expense',
        category: 'salary',
        amount: salary.netAmount,
        accountType: salary.accountType,
        paymentMethod: salary.paymentMethod,
        bankName: salary.bankName,
        reference: `Salary - ${body.employeeName} (${salary.month}/${salary.year})`,
        description: `Salary payment to ${body.employeeName}${salary.designation ? ` - ${salary.designation}` : ''}`,
        transactionDate: new Date(salary.paymentDate || new Date()),
        employeeName: body.employeeName,
        employeeId: body.employeeId,
        salaryId: result.insertedId.toString(),
        salaryMonth: salary.month,
        salaryYear: salary.year,
        createdAt: new Date(),
      };

      await db.collection('cashflow').insertOne(cashFlowEntry);

      // Auto-create personal account income entry for admin (using employeeId)
      // Check if this is admin employee (EMP-ADMIN-001 or role=admin/owner)
      const isAdminEmployee = body.employeeId === 'EMP-ADMIN-001' || 
                              salary.designation.toLowerCase().includes('admin') || 
                              salary.designation.toLowerCase().includes('director') ||
                              salary.designation.toLowerCase().includes('owner');
      
      if (isAdminEmployee) {
        const personalIncomeEntry = {
          type: 'income',
          category: 'salary',
          amount: salary.netAmount,
          date: salary.paymentDate || new Date().toISOString().split('T')[0],
          description: `Monthly salary - ${body.employeeName} (${salary.month}/${salary.year})`,
          paymentMethod: salary.paymentMethod,
          notes: `Auto-recorded from business salary payment${salary.notes ? ': ' + salary.notes : ''}`,
          salaryId: result.insertedId.toString(),
          employeeId: body.employeeId, // Link to employee record
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.collection('personal_accounts').insertOne(personalIncomeEntry);
      }
    }

    return NextResponse.json({
      success: true,
      salaryId: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating salary:', error);
    return NextResponse.json(
      { error: 'Failed to create salary' },
      { status: 500 }
    );
  }
}
