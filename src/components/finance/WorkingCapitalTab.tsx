'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Landmark, Building, Banknote, Search, Calendar, X } from 'lucide-react';

interface WorkingCapital {
  _id: string;
  source: string;
  description: string;
  amount: number;
  date: string;
  type: 'loan' | 'equity' | 'revenue_reserve';
  interestRate?: number;
  status: 'active' | 'repaid';
  notes?: string;
}

export default function WorkingCapitalPage() {
  const [capital, setCapital] = useState<WorkingCapital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    source: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'loan' as const,
    interestRate: 0,
    status: 'active' as const,
    notes: '',
    depositedTo: 'bank' as 'bank' | 'cash'
  });

  useEffect(() => {
    fetchCapital();
  }, []);

  const fetchCapital = async () => {
    try {
      const response = await fetch('/api/working-capital');
      const data = await response.json();
      setCapital(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching working capital:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/working-capital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setShowAddModal(false);
      setFormData({
        source: '',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'loan',
        interestRate: 0,
        status: 'active',
        notes: '',
        depositedTo: 'bank'
      });
      fetchCapital();
    } catch (error) {
      console.error('Error saving capital:', error);
      alert('Failed to save capital record.');
    }
  };

  const filteredCapital = capital.filter(c => 
    c.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActiveLoans = capital.filter(c => c.status === 'active' && c.type === 'loan').reduce((sum, c) => sum + c.amount, 0);
  const totalEquity = capital.filter(c => c.type === 'equity').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-light text-black mb-2 flex items-center gap-3">
            <Landmark className="text-indigo-500 w-8 h-8" />
            Working Capital & Debt
          </h1>
          <p className="text-gray-600 font-light">Track borrowed capital, investor equity, and cash reserves.</p>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span>Add Capital Source</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light mb-1">Total Active Loans (Debt)</p>
          <p className="text-4xl font-bold text-red-500">
            ₹{totalActiveLoans.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light mb-1">Investor Equity Injection</p>
          <p className="text-4xl font-bold text-emerald-600">
            ₹{totalEquity.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search capital sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light text-sm"
            />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Source</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : filteredCapital.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No records found.</td></tr>
            ) : (
              filteredCapital.map((c) => (
                <tr key={c._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(c.date).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{c.source}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{c.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.type === 'loan' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {c.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-semibold ${c.type === 'loan' ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₹{c.amount.toLocaleString('en-IN')}
                    {c.interestRate ? <span className="text-xs text-gray-500 ml-1">({c.interestRate}% int)</span> : null}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      c.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-black">Add Capital Record</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Source *</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="e.g. HDFC Bank, Founder Cash"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Server Upgrades"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                  >
                    <option value="loan">Loan (Debt)</option>
                    <option value="equity">Equity (Injection)</option>
                    <option value="revenue_reserve">Revenue Reserve</option>
                  </select>
                </div>
                {formData.type === 'loan' && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Deposited To *</label>
                <select
                  value={formData.depositedTo}
                  onChange={(e) => setFormData({ ...formData, depositedTo: e.target.value as 'cash' | 'bank' })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                >
                  <option value="bank">Bank Account</option>
                  <option value="cash">Cash in Hand</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium"
              >
                Save Record
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
