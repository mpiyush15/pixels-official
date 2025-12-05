import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const transactions = await db
      .collection('personal_accounts')
      .find({})
      .toArray();

    // Calculate totals
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const balance = totalIncome - totalExpenses;

    // Get category-wise breakdown for expenses
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'other';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + (t.amount || 0);
      });

    // Get monthly breakdown
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount || 0;
      } else {
        monthlyData[month].expenses += t.amount || 0;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalIncome,
        totalExpenses,
        balance,
        expensesByCategory,
        monthlyData,
      }
    });
  } catch (error) {
    console.error('Error fetching personal stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch personal stats' },
      { status: 500 }
    );
  }
}
