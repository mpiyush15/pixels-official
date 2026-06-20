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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isProfitable = (data?.netProfit || 0) >= 0;

  return (
    <div className="p-8 space-y-8 bg-gray-50/50 min-h-[calc(100vh-8rem)] rounded-2xl">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-light text-gray-900 flex items-center gap-3">
            <PieChart className="w-8 h-8 text-indigo-500" />
            Profit & Loss Statement
          </h2>
          <p className="text-gray-500 mt-1 font-light flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {data && new Date(data.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            <ArrowRight className="w-3 h-3" />
            {data && new Date(data.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          {['weekly', 'monthly', 'quarterly', 'annual'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                period === p
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-500 hover:text-black hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      )}

      {data && !loading && (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3 text-emerald-600 mb-2">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-medium">Total Revenue</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ₹{data.totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3 text-red-500 mb-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <span className="font-medium">Total Expenses</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                ₹{data.totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`bg-white rounded-2xl p-6 border shadow-sm ${
                isProfitable ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`font-medium ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>
                  Net Profit / Loss
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  isProfitable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {data.profitMargin.toFixed(1)}% Margin
                </span>
              </div>
              <p className={`text-4xl font-black tracking-tight ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
                {isProfitable ? '+' : '-'}₹{Math.abs(data.netProfit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </motion.div>
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Income Breakdown</h3>
              </div>
              <div className="p-5">
                {Object.keys(data.incomeBreakdown).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No income recorded for this period.</p>
                ) : (
                  <ul className="space-y-4">
                    {Object.entries(data.incomeBreakdown).map(([category, amount]) => (
                      <li key={category} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${category === 'replysys_revenue' ? 'bg-purple-500' : 'bg-emerald-400'}`} />
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {category.replace('_', ' ')}
                            {category === 'replysys_revenue' && <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Auto-Synced</span>}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-900">Expense Breakdown</h3>
              </div>
              <div className="p-5">
                {Object.keys(data.expenseBreakdown).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No expenses recorded for this period.</p>
                ) : (
                  <ul className="space-y-4">
                    {Object.entries(data.expenseBreakdown).map(([category, amount]) => (
                      <li key={category} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="text-sm font-medium text-gray-700 capitalize">{category.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
