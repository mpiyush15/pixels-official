import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Get current date info
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Fetch all data - only development clients for dashboard
    const clients = await db.collection('clients').find({ 
      $or: [
        { clientType: 'development' },
        { clientType: { $exists: false } } // Include old clients without clientType field
      ]
    }).toArray();
    const invoices = await db.collection('invoices').find().toArray();

    // Calculate totals
    const totalClients = clients.length;
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent').length;

    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const monthlyRevenue = invoices
      .filter(inv => {
        if (inv.status !== 'paid') return false;
        const date = new Date(inv.paidAt || inv.createdAt);
        return date >= firstDayOfMonth;
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const lastMonthRevenue = invoices
      .filter(inv => {
        if (inv.status !== 'paid') return false;
        const date = new Date(inv.paidAt || inv.createdAt);
        return date >= lastMonth && date < firstDayOfMonth;
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);

    const monthlyGrowth = lastMonthRevenue === 0 ? 100 : 
      Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

    const activeProjects = invoices.filter(inv => 
      inv.status === 'draft' || inv.status === 'sent'
    ).length;

    // Top clients by revenue
    const topClients = clients
      .filter(client => client.totalRevenue > 0)
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 5);

    // Revenue trend for last 6 months
    const recentRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const revenue = invoices
        .filter(inv => {
          if (inv.status !== 'paid') return false;
          const date = new Date(inv.paidAt || inv.createdAt);
          return date >= monthDate && date < nextMonth;
        })
        .reduce((sum, inv) => sum + (inv.total || 0), 0);

      recentRevenue.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        revenue: revenue,
      });
    }

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue,
      totalClients,
      activeProjects,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      recentRevenue,
      topClients,
      monthlyGrowth,
    });
  } catch (error) {
    console.error('Overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
