'use client';
import { IndianRupee, TrendingUp, CreditCard, Loader2, LayoutDashboard, FileText, DollarSign, Receipt, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FinanceData {
  hasOpeningBalance: boolean;
  liveBankBalance: number;
  cashInHand: number;
  bankBalance: number;
  expectedReceivables: number;
  breakdown: {
    unpaidInvoices: number;
    pipelineReceivables: number;
  };
  totalDebts: number;
  expectedPayables: number;
  profitability: {
    totalProjectRevenue: number;
    totalProjectCosts: number;
    margin: number;
  };
}

export default function FinanceOverview() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [openingBank, setOpeningBank] = useState('');
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState('cash');
  const [transferTo, setTransferTo] = useState('bank');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  const fetchFinanceData = () => {
    setLoading(true);
    fetch('/api/finance-overview')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleSetOpeningBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cashflow/opening-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashBalance: parseFloat(openingCash) || 0,
          bankBalance: parseFloat(openingBank) || 0
        })
      });
      if (res.ok) {
        setShowOpeningModal(false);
        fetchFinanceData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cashflow/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccount: transferFrom,
          toAccount: transferTo,
          amount: parseFloat(transferAmount),
          notes: transferNotes
        })
      });
      if (res.ok) {
        setShowTransferModal(false);
        setTransferAmount('');
        setTransferNotes('');
        fetchFinanceData();
      } else {
        alert('Failed to transfer funds. Check accounts and amount.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-light text-gray-900">Financial Command Center</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Contra Transfer
          </button>
          {data && !data.hasOpeningBalance && (
            <button 
              onClick={() => setShowOpeningModal(true)}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              Set Opening Balances
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : !data ? (
        <div className="p-8 text-red-500">Failed to load finance data.</div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold text-gray-500 mb-1 relative z-10">Cash in Hand</p>
              <h3 className="text-3xl font-bold text-gray-900 relative z-10">₹{data.cashInHand?.toLocaleString() || 0}</h3>
              <p className="text-xs text-emerald-600 mt-3 font-medium bg-emerald-50 px-2 py-1 rounded w-fit relative z-10">
                Physical Cash
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold text-gray-500 mb-1 relative z-10">Bank Balance</p>
              <h3 className="text-3xl font-bold text-gray-900 relative z-10">₹{data.bankBalance?.toLocaleString() || 0}</h3>
              <p className="text-xs text-blue-600 mt-3 font-medium bg-blue-50 px-2 py-1 rounded w-fit relative z-10">
                Account Balance
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold text-gray-500 mb-1 relative z-10">Expected Receivables</p>
              <h3 className="text-3xl font-bold text-gray-900 relative z-10">₹{data.expectedReceivables.toLocaleString()}</h3>
              <p className="text-xs text-indigo-600 mt-3 font-medium bg-indigo-50 px-2 py-1 rounded w-fit relative z-10">
                Pipeline + Invoices
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold text-gray-500 mb-1 relative z-10">Expected Payables</p>
              <h3 className="text-3xl font-bold text-gray-900 relative z-10">₹{data.expectedPayables.toLocaleString()}</h3>
              <p className="text-xs text-red-600 mt-3 font-medium bg-red-50 px-2 py-1 rounded w-fit relative z-10">
                Unpaid Expenses
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <p className="text-sm font-semibold text-gray-500 mb-1 relative z-10">Total Debts (Loans)</p>
              <h3 className="text-3xl font-bold text-gray-900 relative z-10">₹{data.totalDebts.toLocaleString()}</h3>
              <p className="text-xs text-orange-600 mt-3 font-medium bg-orange-50 px-2 py-1 rounded w-fit relative z-10">
                Working Capital
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Project Profitability Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                  <p className="text-sm text-gray-500 mb-1">Total Project Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{data.profitability.totalProjectRevenue.toLocaleString()}</p>
              </div>
              <div>
                  <p className="text-sm text-gray-500 mb-1">Total Project Costs</p>
                  <p className="text-2xl font-semibold text-red-600">₹{data.profitability.totalProjectCosts.toLocaleString()}</p>
              </div>
              <div>
                  <p className="text-sm text-gray-500 mb-1">Profit Margin</p>
                  <p className="text-2xl font-semibold text-emerald-600">₹{data.profitability.margin.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOpeningModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-light text-black mb-2">Set Opening Balances</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your current physical cash and bank balances to initialize your ledger.</p>
            
            <form onSubmit={handleSetOpeningBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cash in Hand (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Balance (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={openingBank}
                  onChange={(e) => setOpeningBank(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowOpeningModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Save Balances
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-light text-black mb-2">Contra Transfer</h2>
            <p className="text-sm text-gray-500 mb-6">Move funds between Cash and Bank accounts.</p>
            
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => {
                      setTransferFrom(e.target.value);
                      setTransferTo(e.target.value === 'cash' ? 'bank' : 'cash');
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>
                <div className="pt-6 font-bold text-gray-400">→</div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <select
                    value={transferTo}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light opacity-70"
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Particulars / Notes</label>
                <input
                  type="text"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  placeholder="e.g. Cash deposit to HDFC"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
