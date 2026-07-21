'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Building2, Wallet, Landmark, RefreshCw } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Asset',
    subType: 'Bank',
    currency: 'INR',
    description: ''
  });

  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  const subTypes: Record<string, string[]> = {
    Asset: ['Bank', 'Cash', 'Receivable', 'Fixed Asset'],
    Liability: ['Payable', 'Current Liability', 'Term Loan'],
    Equity: ['Capital', 'Drawings'],
    Revenue: ['Sales', 'Other Revenue'],
    Expense: ['Direct Expense', 'Indirect Expense']
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/finance/accounts');
      if (res.ok) {
        setAccounts(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/finance/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', type: 'Asset', subType: 'Bank', currency: 'INR', description: '' });
        fetchAccounts();
      } else {
        alert('Failed to create account');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-text-muted">Loading chart of accounts...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Chart of Accounts</h1>
          <p className="text-text-muted">Manage your bank accounts, cash registers, loans, and assets.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="ta-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc, i) => (
          <div key={i} className="ta-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${
                  acc.type === 'Asset' ? 'bg-success/10 text-success' : 
                  acc.type === 'Liability' ? 'bg-danger/10 text-danger' : 
                  'bg-primary/10 text-primary'
                }`}>
                  {acc.subType === 'Bank' ? <Landmark className="w-5 h-5" /> : 
                   acc.subType === 'Cash' ? <Wallet className="w-5 h-5" /> : 
                   <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{acc.name}</h3>
                  <span className="text-xs text-text-muted px-2 py-0.5 bg-surface rounded-full">
                    {acc.type} • {acc.subType}
                  </span>
                </div>
              </div>
              {acc.description && <p className="text-sm text-text-secondary">{acc.description}</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-xs font-medium text-text-muted">Currency: {acc.currency}</span>
              {acc.isSystem && <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">System</span>}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-2xl w-full max-w-lg overflow-hidden border border-border shadow-2xl"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-text-primary">Create Account</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Account Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="ta-input w-full" placeholder="e.g. HDFC Current Account" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                    <select className="ta-input w-full" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value, subType: subTypes[e.target.value][0]})}>
                      {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Sub Type</label>
                    <select className="ta-input w-full" value={formData.subType} onChange={e => setFormData({...formData, subType: e.target.value})}>
                      {subTypes[formData.type].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Currency</label>
                  <select className="ta-input w-full" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Description (Optional)</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="ta-input w-full" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-text-primary hover:bg-surface transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg ta-btn-primary transition-colors">Create Account</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
