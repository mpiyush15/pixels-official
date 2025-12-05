import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Get current month stats
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total counts - only development clients
    const totalLeads = await db.collection('leads').countDocuments();
    const totalClients = await db.collection('clients').countDocuments({
      $or: [
        { clientType: 'development' },
        { clientType: { $exists: false } }
      ]
    });
    const totalInvoices = await db.collection('invoices').countDocuments();

    // Current month stats
    const currentMonthLeads = await db.collection('leads').countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });
    const lastMonthLeads = await db.collection('leads').countDocuments({
      createdAt: { $gte: lastMonth, $lt: firstDayOfMonth }
    });

    const currentMonthClients = await db.collection('clients').countDocuments({
      createdAt: { $gte: firstDayOfMonth },
      $or: [
        { clientType: 'development' },
        { clientType: { $exists: false } }
      ]
    });
    const lastMonthClients = await db.collection('clients').countDocuments({
      createdAt: { $gte: lastMonth, $lt: firstDayOfMonth },
      $or: [
        { clientType: 'development' },
        { clientType: { $exists: false } }
      ]
    });

    // Get all invoices for detailed revenue analysis
    const allInvoices = await db.collection('invoices').find().toArray();
    
    // Revenue from PAID and PARTIALLY PAID invoices
    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
    const partiallyPaidInvoices = allInvoices.filter(inv => inv.status === 'partially_paid');
    
    // Total revenue = fully paid invoices + amount paid on partial invoices
    const fullyPaidRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const partialRevenue = partiallyPaidInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalRevenue = fullyPaidRevenue + partialRevenue;
    
    // Outstanding dues = (sent + overdue + partially paid remaining)
    const unpaidInvoices = allInvoices.filter(inv => 
      inv.status === 'sent' || inv.status === 'overdue'
    );
    const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const partiallyPaidRemaining = partiallyPaidInvoices.reduce((sum, inv) => 
      sum + (inv.remainingAmount || (inv.total - (inv.amountPaid || 0))), 0
    );
    const totalDues = unpaidTotal + partiallyPaidRemaining;
    
    // Draft invoices value
    const draftInvoices = allInvoices.filter(inv => inv.status === 'draft');
    const draftValue = draftInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // This month's revenue from payments
    const payments = await db.collection('payments').find({
      status: 'completed',
      paymentDate: { $gte: firstDayOfMonth }
    }).toArray();
    const currentMonthRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const lastMonthPayments = await db.collection('payments').find({
      status: 'completed',
      paymentDate: { $gte: lastMonth, $lt: firstDayOfMonth }
    }).toArray();
    const lastMonthRevenue = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Overdue amount (critical) - full amount for overdue, remaining for partial overdue
    const overdueInvoices = allInvoices.filter(inv => inv.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, inv) => {
      if (inv.status === 'partially_paid') {
        return sum + (inv.remainingAmount || (inv.total - (inv.amountPaid || 0)));
      }
      return sum + (inv.total || 0);
    }, 0);
    
    // Active projects
    const activeProjects = await db.collection('projects').countDocuments({
      status: { $in: ['in-progress', 'review'] }
    });
    
    // Total projects and their revenue
    const allProjects = await db.collection('projects').find().toArray();
    const totalProjects = allProjects.length;
    const totalProjectsRevenue = allProjects.reduce((sum, proj) => sum + (proj.budget || 0), 0);

    // Calculate percentage changes
    const revenueChange = lastMonthRevenue === 0 ? (currentMonthRevenue > 0 ? 100 : 0) : 
      Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

    return NextResponse.json({
      // Revenue metrics
      totalRevenue,
      currentMonthRevenue,
      totalDues,
      overdueAmount,
      draftValue,
      
      // Invoice counts
      totalInvoices: allInvoices.length,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length + partiallyPaidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      draftInvoices: draftInvoices.length,
      partiallyPaidInvoices: partiallyPaidInvoices.length,
      
      // Business metrics
      totalClients,
      activeProjects,
      totalProjects,
      totalProjectsRevenue,
      totalLeads,
      
      // Changes
      revenueChange,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
