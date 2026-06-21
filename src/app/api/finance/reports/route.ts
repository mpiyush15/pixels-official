import { NextRequest, NextResponse } from 'next/server';
import { FinanceDB } from '@/lib/finance';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    if (type === 'pl') {
      const pl = await FinanceDB.getProfitAndLoss();
      return NextResponse.json(pl);
    } else if (type === 'bs') {
      const bs = await FinanceDB.getBalanceSheet();
      return NextResponse.json(bs);
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
