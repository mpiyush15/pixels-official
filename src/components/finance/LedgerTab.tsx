'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowUpRight, ArrowDownRight, Search, Filter, Plus, X, IndianRupee } from 'lucide-react';

interface LedgerEntry {
  _id: string;
  transactionId: string;
  accountId: string;
  type: 'Debit' | 'Credit';
  amount: number;
  date: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  account: {
    name: string;
    type: string;
    subType: string;
  };
  runningBalance?: number;
}

export default function LedgerTab() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Debit' | 'Credit'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { accountId: '', type: 'Debit', amount: 0 },
      { accountId: '', type: 'Credit', amount: 0 }
    ]
  });

  const fetchLedger = () => {
    setLoading(true);
    fetch('/api/finance/ledger')
      .then(res => res.json())
      .then((data: LedgerEntry[]) => setEntries(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchAccounts = () => {
    fetch('/api/finance/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchLedger();
    fetchAccounts();
  }, []);

  const handleSaveEntry = async () => {
    // Validate
    if (!journalForm.description) return alert('Please enter particulars/description');

    try {
      setIsSubmitting(true);
      let totalDebit = 0;
      let totalCredit = 0;
      
      const entriesToPost = journalForm.lines.map(line => {
        if (!line.accountId) throw new Error('All lines must have an account selected');
        if (line.amount <= 0) throw new Error('Amounts must be greater than zero');
        if (line.type === 'Debit') totalDebit += line.amount;
        if (line.type === 'Credit') totalCredit += line.amount;
        return {
          ...line,
          date: journalForm.date,
          description: journalForm.description,
          currency: 'INR',
          referenceType: 'Manual'
        };
      });

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Journal entry must balance! Total Debits: ${totalDebit}, Total Credits: ${totalCredit}`);
      }
      const res = await fetch('/api/finance/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: entriesToPost })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setShowModal(false);
      setJournalForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        lines: [
          { accountId: '', type: 'Debit', amount: 0 },
          { accountId: '', type: 'Credit', amount: 0 }
        ]
      });
      fetchLedger();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = 
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (e.referenceId && e.referenceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        e.account.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'All' || e.type === filterType;
      
      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(e.date) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(e.date) <= new Date(endDate);
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [entries, searchTerm, filterType, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Master Ledger Statement</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="ta-btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Journal Entry
        </button>
      </div>
      
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 w-full">
        <div className="relative w-full xl:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search particulars or references..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ta-input pl-10 pr-4 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-surface rounded-xl p-1 border border-border">
            {['All', 'Debit', 'Credit'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors text-center ${
                  filterType === type 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ta-input px-3 py-2 text-sm"
              title="Start Date"
            />
            <span className="text-text-muted text-sm font-medium">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ta-input px-3 py-2 text-sm"
              title="End Date"
            />
          </div>
        </div>
      </div>

      <div className="ta-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="ta-table-header">
                <th className="ta-table-th">Date</th>
                <th className="ta-table-th">Account</th>
                <th className="ta-table-th">Particulars</th>
                <th className="ta-table-th text-right">Debit (Dr)</th>
                <th className="ta-table-th text-right">Credit (Cr)</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry, idx) => (
                  <motion.tr 
                    key={entry._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx < 20 ? idx * 0.03 : 0 }}
                    className="ta-table-row"
                  >
                  <td className="ta-table-td">
                    {new Date(entry.date).toLocaleDateString('en-IN')}
                  </td>
                  <td className="ta-table-td">
                    <span className="px-3 py-1 bg-surface text-text-secondary rounded-full text-xs font-medium">
                      {entry.account?.name}
                    </span>
                  </td>
                  <td className="ta-table-td">
                    <p className="text-sm font-medium text-text-primary">{entry.description}</p>
                    {entry.referenceId && (
                      <p className="text-xs text-text-muted font-light mt-0.5">Ref: {entry.referenceType || 'TX'} - {entry.referenceId.slice(-6)}</p>
                    )}
                  </td>
                  <td className="ta-table-td text-right">
                    {entry.type === 'Debit' ? (
                      <span className="text-text-primary font-medium">
                        ₹{entry.amount.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-text-muted/50">-</span>
                    )}
                  </td>
                  <td className="ta-table-td text-right">
                    {entry.type === 'Credit' ? (
                      <span className="text-text-primary font-medium">
                        ₹{entry.amount.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-text-muted/50">-</span>
                    )}
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
              {!loading && filteredEntries.length === 0 && (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ta-table-row"
                >
                  <td colSpan={5} className="ta-table-td text-center py-12 text-text-muted">
                    No transactions found matching your filters.
                  </td>
                </motion.tr>
              )}
              {/* Remove loader to keep it entirely smooth as requested */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-background w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-border"
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">Manual Journal Entry</h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-text-muted mb-1">Particulars / Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Received Working Capital Loan from HDFC"
                    value={journalForm.description}
                    onChange={e => setJournalForm({...journalForm, description: e.target.value})}
                    className="ta-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Date</label>
                  <input 
                    type="date" 
                    value={journalForm.date}
                    onChange={e => setJournalForm({...journalForm, date: e.target.value})}
                    className="ta-input w-full"
                  />
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden mt-6">
                <table className="w-full text-left">
                  <thead className="bg-surface/50 border-b border-border">
                    <tr>
                      <th className="py-2 px-4 text-xs font-medium text-text-muted">Account</th>
                      <th className="py-2 px-4 text-xs font-medium text-text-muted w-32">Dr/Cr</th>
                      <th className="py-2 px-4 text-xs font-medium text-text-muted w-40 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journalForm.lines.map((line, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="p-2">
                          <select 
                            value={line.accountId}
                            onChange={e => {
                              const newLines = [...journalForm.lines];
                              newLines[idx].accountId = e.target.value;
                              setJournalForm({...journalForm, lines: newLines});
                            }}
                            className="ta-input py-1 text-sm w-full"
                          >
                            <option value="">Select Account...</option>
                            {accounts.map(acc => (
                              <option key={acc._id} value={acc._id}>{acc.name} ({acc.subType})</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <select 
                            value={line.type}
                            onChange={e => {
                              const newLines = [...journalForm.lines];
                              newLines[idx].type = e.target.value as any;
                              setJournalForm({...journalForm, lines: newLines});
                            }}
                            className="ta-input py-1 text-sm w-full"
                          >
                            <option value="Debit">Debit (Dr)</option>
                            <option value="Credit">Credit (Cr)</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input 
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.amount || ''}
                            onChange={e => {
                              const newLines = [...journalForm.lines];
                              newLines[idx].amount = parseFloat(e.target.value) || 0;
                              setJournalForm({...journalForm, lines: newLines});
                            }}
                            className="ta-input py-1 text-sm w-full text-right"
                            placeholder="0.00"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center text-sm px-4">
                <button 
                  onClick={() => setJournalForm({...journalForm, lines: [...journalForm.lines, { accountId: '', type: 'Debit', amount: 0 }]})}
                  className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" /> Add Line
                </button>
                <div className="flex gap-4 font-bold text-text-primary">
                  <span className={journalForm.lines.filter(l => l.type === 'Debit').reduce((a, b) => a + b.amount, 0) !== journalForm.lines.filter(l => l.type === 'Credit').reduce((a, b) => a + b.amount, 0) ? 'text-danger' : ''}>
                    Dr: ₹{journalForm.lines.filter(l => l.type === 'Debit').reduce((a, b) => a + b.amount, 0).toLocaleString()}
                  </span>
                  <span className={journalForm.lines.filter(l => l.type === 'Debit').reduce((a, b) => a + b.amount, 0) !== journalForm.lines.filter(l => l.type === 'Credit').reduce((a, b) => a + b.amount, 0) ? 'text-danger' : ''}>
                    Cr: ₹{journalForm.lines.filter(l => l.type === 'Credit').reduce((a, b) => a + b.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-surface/30 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-surface font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEntry}
                disabled={isSubmitting}
                className="ta-btn-primary flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Post Entry'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
