'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, FileText } from 'lucide-react';

export default function ReportsPage() {
  const [pl, setPl] = useState<any>(null);
  const [bs, setBs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/finance/reports?type=pl').then(res => res.json()),
      fetch('/api/finance/reports?type=bs').then(res => res.json())
    ]).then(([plData, bsData]) => {
      setPl(plData);
      setBs(bsData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-text-muted">Generating Financial Reports...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Financial Reports</h1>
        <p className="text-text-muted">Real-time Profit & Loss and Balance Sheet.</p>
      </div>

      {/* P&L Section */}
      <div className="ta-card space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-text-primary">Profit & Loss Statement</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Revenue</h3>
            <div className="space-y-3">
              {pl?.revenueAccounts?.map((acc: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-text-primary">{acc.name}</span>
                  <span className="font-medium flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{acc.balance.toLocaleString()}</span>
                </div>
              ))}
              {pl?.revenueAccounts?.length === 0 && <p className="text-sm text-text-muted">No revenue recorded.</p>}
              <div className="flex justify-between items-center py-3 font-bold text-text-primary border-t-2 border-border mt-4">
                <span>Total Revenue</span>
                <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{pl?.totalRevenue?.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Expenses</h3>
            <div className="space-y-3">
              {pl?.expenseAccounts?.map((acc: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-text-primary">{acc.name}</span>
                  <span className="font-medium flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{acc.balance.toLocaleString()}</span>
                </div>
              ))}
              {pl?.expenseAccounts?.length === 0 && <p className="text-sm text-text-muted">No expenses recorded.</p>}
              <div className="flex justify-between items-center py-3 font-bold text-text-primary border-t-2 border-border mt-4">
                <span>Total Expenses</span>
                <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{pl?.totalExpense?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl flex justify-between items-center ${pl?.netProfit >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          <span className="text-xl font-bold">Net Profit</span>
          <span className="text-2xl font-black flex items-center"><IndianRupee className="w-5 h-5 mr-1"/>{pl?.netProfit?.toLocaleString()}</span>
        </div>
      </div>

      {/* Balance Sheet Section */}
      <div className="ta-card space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <FileText className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-text-primary">Balance Sheet</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Assets</h3>
            <div className="space-y-3">
              {bs?.assets?.map((acc: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-text-primary">{acc.name}</span>
                  <span className="font-medium flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{acc.balance.toLocaleString()}</span>
                </div>
              ))}
              {bs?.assets?.length === 0 && <p className="text-sm text-text-muted">No assets recorded.</p>}
              <div className="flex justify-between items-center py-3 font-bold text-text-primary border-t-2 border-border mt-4">
                <span>Total Assets</span>
                <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{bs?.totalAssets?.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Liabilities & Equity</h3>
            <div className="space-y-3">
              {bs?.liabilities?.map((acc: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-text-primary">{acc.name}</span>
                  <span className="font-medium flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{acc.balance.toLocaleString()}</span>
                </div>
              ))}
              {bs?.equity?.map((acc: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-text-primary">{acc.name}</span>
                  <span className="font-medium flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{acc.balance.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 font-bold text-text-primary border-t-2 border-border mt-4">
                <span>Total Liabilities & Equity</span>
                <span className="flex items-center"><IndianRupee className="w-3 h-3 mr-1"/>{bs?.totalLiabilitiesAndEquity?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
