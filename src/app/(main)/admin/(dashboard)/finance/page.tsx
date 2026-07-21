'use client';
import { IndianRupee, TrendingUp, CreditCard, Loader2, LayoutDashboard, FileText, DollarSign, Receipt, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FinanceData {
  workingCapital: number;
  bankBalance: number;
  cashBalance: number;
  accountsReceivable: number;
  accountsPayable: number;
  totalRevenue: number;
  projectRevenue: number;
  replysysRevenue: number;
  totalExpenses: number;
  netProfit: number;
  burnRate: number;
  runwayMonths: string;
  hasOpeningBalance: boolean;
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
    fetch('/api/finance/dashboard')
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json);
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
    <div className="flex flex-col gap-10 transition-colors duration-300">
      
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Finance Hub</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTransferModal(true)}
            className="ta-btn-secondary"
          >
            Contra Transfer
          </button>
          {data && !data?.hasOpeningBalance && (
            <button 
              onClick={() => setShowOpeningModal(true)}
              className="ta-btn-primary"
            >
              Set Opening Balances
            </button>
          )}
        </div>
      </div>
      
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="ta-card flex flex-col justify-between">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-surface mb-4">
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-text-muted mb-1">Cash in Hand</p>
              <h3 className="text-3xl font-bold text-text-primary">₹{data?.cashBalance?.toLocaleString() || 0}</h3>
              <p className="text-xs text-emerald-500 mt-2 font-medium">Physical Cash</p>
            </div>

            <div className="ta-card flex flex-col justify-between">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-surface mb-4">
                <CreditCard className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-text-muted mb-1">Bank Balance</p>
              <h3 className="text-3xl font-bold text-text-primary">₹{data?.bankBalance?.toLocaleString() || 0}</h3>
              <p className="text-xs text-blue-500 mt-2 font-medium">Account Balance</p>
            </div>

            <div className="ta-card flex flex-col justify-between">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-surface mb-4">
                <Receipt className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-sm font-semibold text-text-muted mb-1">Accounts Receivable</p>
              <h3 className="text-3xl font-bold text-text-primary">₹{data?.accountsReceivable?.toLocaleString() || 0}</h3>
              <p className="text-xs text-indigo-500 mt-2 font-medium">Pending from Clients</p>
            </div>

            <div className="ta-card flex flex-col justify-between">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-surface mb-4">
                <FileSpreadsheet className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-text-muted mb-1">Accounts Payable</p>
              <h3 className="text-3xl font-bold text-text-primary">₹{data?.accountsPayable?.toLocaleString() || 0}</h3>
              <p className="text-xs text-red-500 mt-2 font-medium">Unpaid Vendors</p>
            </div>

            <div className="ta-card flex flex-col justify-between">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-surface mb-4">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-sm font-semibold text-text-muted mb-1">Working Capital</p>
              <h3 className="text-3xl font-bold text-text-primary">₹{data?.workingCapital?.toLocaleString() || 0}</h3>
              <p className="text-xs text-orange-500 mt-2 font-medium">Assets - Liabilities</p>
            </div>
          </div>
          
          {/* REVENUE BREAKDOWN & PnL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="ta-card">
              <h2 className="ta-title mb-6">Revenue Breakdown</h2>
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-sm border border-border bg-emerald-500/10 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-text-muted">Revenue from Projects (CRM)</p>
                    <p className="text-2xl font-bold text-text-primary">₹{data?.projectRevenue?.toLocaleString() || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-500 opacity-50" />
                </div>
                <div className="p-4 rounded-sm border border-border bg-purple-500/10 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-text-muted">Revenue from Replysys</p>
                    <p className="text-2xl font-bold text-text-primary">₹{data?.replysysRevenue?.toLocaleString() || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
              </div>
            </div>

            <div className="ta-card">
              <h2 className="ta-title mb-6">Profit & Loss Overview</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-text-primary">₹{data?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-500">₹{data?.totalExpenses?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-emerald-500">₹{data?.netProfit?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Estimated Runway</p>
                  <p className="text-2xl font-bold text-blue-500">{data?.runwayMonths} Months</p>
                </div>
              </div>
            </div>
          </div>

          {/* BASIC TABLE EXAMPLE (TailAdmin Style) */}
          <div className="ta-card p-0">
            <div className="border-b border-border px-6 py-4">
              <h4 className="text-xl font-bold text-text-primary">Recent Transactions</h4>
            </div>
            
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="ta-table-header">
                    <th className="ta-table-th">Date</th>
                    <th className="ta-table-th">Description</th>
                    <th className="ta-table-th">Type</th>
                    <th className="ta-table-th">Amount</th>
                    <th className="ta-table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="ta-table-row">
                    <td colSpan={5} className="ta-table-td text-center py-8 text-text-muted">
                      No recent transactions found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

      {/* MODALS */}
      {showOpeningModal && (
        <div className="ta-modal-overlay">
          <div className="ta-modal-content max-w-md">
            <h2 className="ta-title mb-2">Set Opening Balances</h2>
            <p className="ta-subtitle mb-6">Enter your current physical cash and bank balances to initialize your ledger.</p>
            
            <form onSubmit={handleSetOpeningBalance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Cash in Hand (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  className="ta-input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Bank Account Balance (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={openingBank}
                  onChange={(e) => setOpeningBank(e.target.value)}
                  className="ta-input"
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowOpeningModal(false)} className="flex-1 ta-btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 ta-btn-primary">Save Balances</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="ta-modal-overlay">
          <div className="ta-modal-content max-w-md">
            <h2 className="ta-title mb-2">Contra Transfer</h2>
            <p className="ta-subtitle mb-6">Move funds between Cash and Bank accounts.</p>
            
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-text-primary mb-2">From</label>
                  <select
                    value={transferFrom}
                    onChange={(e) => {
                      setTransferFrom(e.target.value);
                      setTransferTo(e.target.value === 'cash' ? 'bank' : 'cash');
                    }}
                    className="ta-input"
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>
                <div className="pt-6 font-bold text-text-muted">→</div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-text-primary mb-2">To</label>
                  <select value={transferTo} disabled className="ta-input opacity-70">
                    <option value="cash">Cash in Hand</option>
                    <option value="bank">Bank Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Transfer Amount (₹)</label>
                <input
                  type="number" min="0" step="0.01" required
                  value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}
                  className="ta-input" placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Particulars / Notes</label>
                <input
                  type="text" value={transferNotes} onChange={(e) => setTransferNotes(e.target.value)}
                  className="ta-input" placeholder="e.g. Cash deposit to HDFC"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTransferModal(false)} className="flex-1 ta-btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 ta-btn-primary">Confirm Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
