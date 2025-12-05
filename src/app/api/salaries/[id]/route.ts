import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();

    // Get old salary record
    const oldSalary = await db.collection('salaries').findOne({ _id: new ObjectId(id) });

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.amount || body.deductions || body.bonus) {
      updateData.netAmount = 
        parseFloat(body.amount || 0) - 
        parseFloat(body.deductions || 0) + 
        parseFloat(body.bonus || 0);
    }

    await db.collection('salaries').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Handle cash flow entries based on status change
    if (oldSalary) {
      const designation = body.designation || oldSalary.designation || '';
      const employeeId = body.employeeId || oldSalary.employeeId || '';
      const isAdmin = employeeId === 'EMP-ADMIN-001' ||
                      designation.toLowerCase().includes('admin') || 
                      designation.toLowerCase().includes('director') ||
                      designation.toLowerCase().includes('owner');

      if (oldSalary.status !== 'paid' && body.status === 'paid') {
        // Changed from pending to paid - Create cash flow entry
        const cashFlowEntry = {
          type: 'expense',
          category: 'salary',
          amount: updateData.netAmount,
          accountType: body.accountType || oldSalary.accountType,
          paymentMethod: body.paymentMethod || oldSalary.paymentMethod,
          bankName: body.bankName || oldSalary.bankName,
          reference: `Salary - ${body.employeeName || oldSalary.employeeName} (${body.month || oldSalary.month}/${body.year || oldSalary.year})`,
          description: `Salary payment to ${body.employeeName || oldSalary.employeeName}${(body.designation || oldSalary.designation) ? ` - ${body.designation || oldSalary.designation}` : ''}`,
          transactionDate: new Date(body.paymentDate || oldSalary.paymentDate || new Date()),
          employeeName: body.employeeName || oldSalary.employeeName,
          employeeId: body.employeeId || oldSalary.employeeId,
          salaryId: id,
          salaryMonth: body.month || oldSalary.month,
          salaryYear: body.year || oldSalary.year,
          createdAt: new Date(),
        };

        await db.collection('cashflow').insertOne(cashFlowEntry);

        // Auto-create personal account income entry for admin
        if (isAdmin) {
          const personalIncomeEntry = {
            type: 'income',
            category: 'salary',
            amount: updateData.netAmount,
            date: body.paymentDate || oldSalary.paymentDate || new Date().toISOString().split('T')[0],
            description: `Monthly salary - ${body.employeeName || oldSalary.employeeName} (${body.month || oldSalary.month}/${body.year || oldSalary.year})`,
            paymentMethod: body.paymentMethod || oldSalary.paymentMethod,
            notes: `Auto-recorded from business salary payment${body.notes ? ': ' + body.notes : ''}`,
            salaryId: id,
            employeeId: employeeId, // Link to employee record
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db.collection('personal_accounts').insertOne(personalIncomeEntry);
        }
      } else if (oldSalary.status === 'paid' && body.status !== 'paid') {
        // Changed from paid to pending - Remove cash flow entry and personal account entry
        await db.collection('cashflow').deleteOne({ salaryId: id });
        
        if (isAdmin) {
          await db.collection('personal_accounts').deleteOne({ salaryId: id });
        }
      } else if (oldSalary.status === 'paid' && body.status === 'paid') {
        // Still paid but details changed - Update cash flow entry and personal account entry
        await db.collection('cashflow').updateOne(
          { salaryId: id },
          {
            $set: {
              amount: updateData.netAmount,
              accountType: body.accountType || oldSalary.accountType,
              paymentMethod: body.paymentMethod || oldSalary.paymentMethod,
              bankName: body.bankName || oldSalary.bankName,
              reference: `Salary - ${body.employeeName || oldSalary.employeeName} (${body.month || oldSalary.month}/${body.year || oldSalary.year})`,
              description: `Salary payment to ${body.employeeName || oldSalary.employeeName}${(body.designation || oldSalary.designation) ? ` - ${body.designation || oldSalary.designation}` : ''}`,
              transactionDate: new Date(body.paymentDate || oldSalary.paymentDate || new Date()),
              employeeName: body.employeeName || oldSalary.employeeName,
              employeeId: body.employeeId || oldSalary.employeeId,
              salaryMonth: body.month || oldSalary.month,
              salaryYear: body.year || oldSalary.year,
              updatedAt: new Date(),
            }
          }
        );

        if (isAdmin) {
          await db.collection('personal_accounts').updateOne(
            { salaryId: id },
            {
              $set: {
                amount: updateData.netAmount,
                date: body.paymentDate || oldSalary.paymentDate || new Date().toISOString().split('T')[0],
                description: `Monthly salary - ${body.employeeName || oldSalary.employeeName} (${body.month || oldSalary.month}/${body.year || oldSalary.year})`,
                paymentMethod: body.paymentMethod || oldSalary.paymentMethod,
                notes: `Auto-recorded from business salary payment${body.notes ? ': ' + body.notes : ''}`,
                updatedAt: new Date(),
              }
            }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating salary:', error);
    return NextResponse.json(
      { error: 'Failed to update salary' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    // Get salary to check if it was paid
    const salary = await db.collection('salaries').findOne({ _id: new ObjectId(id) });

    await db.collection('salaries').deleteOne({
      _id: new ObjectId(id),
    });

    // Delete associated cash flow entry if salary was paid
    if (salary && salary.status === 'paid') {
      await db.collection('cashflow').deleteOne({ salaryId: id });

      // Delete personal account entry for admin/director
      const designation = salary.designation || '';
      const isAdmin = designation.toLowerCase().includes('admin') || 
                      designation.toLowerCase().includes('director') ||
                      designation.toLowerCase().includes('owner');
      
      if (isAdmin) {
        await db.collection('personal_accounts').deleteOne({ salaryId: id });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting salary:', error);
    return NextResponse.json(
      { error: 'Failed to delete salary' },
      { status: 500 }
    );
  }
}
