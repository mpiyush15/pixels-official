'use client';

import { useState, useEffect } from 'react';
import { Loader2, ArrowUpRight, ArrowDownRight, Search, FileText } from 'lucide-react';

interface CashflowEntry {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  accountType: string;
  reference?: string;
  createdAt: string;
}

interface LedgerEntry extends CashflowEntry {
  runningBalance: number;
}

export default function LedgerTab() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/cashflow')
      .then(res => res.json())
      .then((data: CashflowEntry[]) => {
        // Data comes back from newest to oldest. Tally usually reads chronologically (oldest to newest) to calculate running balance.
        // Let's sort oldest to newest first.
        const sortedAsc = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let currentBalance = 0;
        const withBalance = sortedAsc.map(entry => {
          if (entry.type === 'income') {
            currentBalance += entry.amount;
          } else {
            currentBalance -= entry.amount;
          }
          return {
            ...entry,
            runningBalance: currentBalance
          };
        });
        
        // Reverse it back to show newest first
        setEntries(withBalance.reverse());
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredEntries = entries.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.reference && e.reference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Master Ledger Statement</h2>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search particulars or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-light text-sm w-80"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Particulars</th>
                <th className="px-6 py-4">Vch Type</th>
                <th className="px-6 py-4 text-right">Debit (Out)</th>
                <th className="px-6 py-4 text-right">Credit (In)</th>
                <th className="px-6 py-4 text-right font-bold text-black">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.map((entry) => (
                <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-light text-gray-600">
                    {new Date(entry.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                    {entry.reference && (
                      <p className="text-xs text-gray-500 font-light mt-0.5">Ref: {entry.reference}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-light text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.category === 'opening_balance' ? 'bg-purple-100 text-purple-700' :
                      entry.category === 'transfer' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {entry.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {entry.type === 'expense' ? (
                      <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                        <ArrowDownRight className="w-3 h-3" />
                        ₹{entry.amount.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {entry.type === 'income' ? (
                      <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        ₹{entry.amount.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    ₹{entry.runningBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-light">
                    No transactions found in ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
