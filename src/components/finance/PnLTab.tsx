'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, TrendingDown, Calendar, Loader2, ArrowRight } from 'lucide-react';

interface PnLData {
  period: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
}

export default function PnLTab() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly' | 'annual'>('monthly');
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const fetchData = async (selectedPeriod: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profit-loss?period=${selectedPeriod}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching P&L data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render removed for smooth framer motion loading

  const isProfitable = (data?.netProfit || 0) >= 0;

  return (
    <div className="p-8 space-y-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <PieChart className="w-8 h-8 text-primary" />
            Profit & Loss Statement
          </h2>
          <p className="text-text-muted mt-1 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {data?.startDate ? new Date(data.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Loading...'}
            <ArrowRight className="w-3 h-3" />
            {data?.endDate ? new Date(data.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Loading...'}
          </p>
        </div>

        <div className="flex bg-card rounded-xl shadow-sm border border-border p-1">
          {['weekly', 'monthly', 'quarterly', 'annual'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                period === p
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <div className="space-y-8">
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="ta-card"
            >
              <div className="flex items-center gap-3 text-emerald-500 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-medium text-text-muted">Total Income</span>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                ₹{data?.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="ta-card"
            >
              <div className="flex items-center gap-3 text-red-500 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <span className="font-medium text-text-muted">Total Expenses</span>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                ₹{data?.totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`ta-card border-2 ${
                isProfitable ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-red-500/50 bg-red-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`font-medium ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                  Net Profit
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  isProfitable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {data?.profitMargin.toFixed(1)}% Margin
                </span>
              </div>
              <p className={`text-4xl font-black tracking-tight ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                {isProfitable ? '+' : '-'}₹{Math.abs(data?.netProfit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </motion.div>
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="ta-card p-0 overflow-hidden">
              <div className="p-5 border-b border-border bg-surface">
                <h3 className="font-semibold text-text-primary">Income Breakdown</h3>
              </div>
              <div className="p-5">
                {!data || Object.keys(data.incomeBreakdown).length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No income recorded for this period.</p>
                ) : (
                  <ul className="space-y-4">
                    {Object.entries(data.incomeBreakdown).map(([category, amount]) => (
                      <li key={category} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${category === 'replysys_revenue' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                          <span className="text-sm font-medium text-text-secondary capitalize">
                            {category.replace('_', ' ')}
                            {category === 'replysys_revenue' && <span className="ml-2 text-xs text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">Auto-Synced</span>}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-text-primary">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="ta-card p-0 overflow-hidden">
              <div className="p-5 border-b border-border bg-surface">
                <h3 className="font-semibold text-text-primary">Expense Breakdown</h3>
              </div>
              <div className="p-5">
                {!data || Object.keys(data.expenseBreakdown).length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No expenses recorded for this period.</p>
                ) : (
                  <ul className="space-y-4">
                    {Object.entries(data.expenseBreakdown).map(([category, amount]) => (
                      <li key={category} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-sm font-medium text-text-secondary capitalize">{category.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm font-semibold text-text-primary">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
