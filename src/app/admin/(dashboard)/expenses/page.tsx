'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt, Search, Calendar, IndianRupee, Eye, X, Edit, Trash2, Filter } from 'lucide-react';

interface Expense {
  _id: string;
  vendorId?: string;
  vendorName: string;
  category: string;
  businessType?: 'saas' | 'pixels' | 'both';
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  invoiceNumber?: string;
  notes?: string;
  recurringType?: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  nextDueDate?: string;
  createdAt: string;
}

interface Vendor {
  _id: string;
  name: string;
  company: string;
  category: string;
}

const expenseCategories = [
  'SaaS Subscriptions',
  'Software Licenses',
  'Domain & Hosting',
  'Marketing & Advertising',
  'Office Supplies',
  'Equipment & Hardware',
  'Internet & Utilities',
  'Professional Services',
  'Salaries & Wages',
  'Freelancer Payments',
  'Travel & Transportation',
  'Training & Education',
  'Bank Charges',
  'Other',
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBusiness, setFilterBusiness] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    category: '',
    businessType: 'both' as 'saas' | 'pixels' | 'both',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    vendor: '',
    notes: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingExpense ? `/api/expenses/${editingExpense._id}` : '/api/expenses';
      const method = editingExpense ? 'PATCH' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setShowAddModal(false);
      setEditingExpense(null);
      setFormData({
        category: '',
        businessType: 'both',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        vendor: '',
        notes: '',
      });
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      businessType: expense.businessType || 'both',
      description: expense.description,
      amount: expense.amount,
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      vendor: expense.vendorName || '',
      notes: expense.notes || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense.');
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      saas: 'SaaS',
      pixels: 'Pixels Digital',
      both: 'Both',
    };
    return labels[type] || type;
  };

  const getBusinessTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      saas: 'bg-purple-100 text-purple-700',
      pixels: 'bg-blue-100 text-blue-700',
      both: 'bg-green-100 text-green-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.vendorName && expense.vendorName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBusiness = filterBusiness === 'all' || expense.businessType === filterBusiness;
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesBusiness && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const saasExpenses = expenses.filter(e => e.businessType === 'saas' || e.businessType === 'both').reduce((sum, exp) => sum + exp.amount, 0);
  const pixelsExpenses = expenses.filter(e => e.businessType === 'pixels' || e.businessType === 'both').reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-light text-black mb-2">Business Expenses</h1>
          <p className="text-gray-600 font-light">Track and manage all business expenses</p>
        </div>
        <motion.button
          onClick={() => {
            setEditingExpense(null);
            setFormData({
              category: '',
              businessType: 'both',
              description: '',
              amount: 0,
              date: new Date().toISOString().split('T')[0],
              paymentMethod: 'bank_transfer',
              vendor: '',
              notes: '',
            });
            setShowAddModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span>Add Expense</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Expenses</p>
          <p className="text-3xl font-light text-red-600 mt-2">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">SaaS Expenses</p>
          <p className="text-3xl font-light text-purple-600 mt-2">
            ₹{saasExpenses.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Pixels Digital</p>
          <p className="text-3xl font-light text-blue-600 mt-2">
            ₹{pixelsExpenses.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Records</p>
          <p className="text-3xl font-light text-black mt-2">{expenses.length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
          />
        </div>
        <select
          value={filterBusiness}
          onChange={(e) => setFilterBusiness(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
        >
          <option value="all">All Businesses</option>
          <option value="saas">SaaS Only</option>
          <option value="pixels">Pixels Digital Only</option>
          <option value="both">Both</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
        >
          <option value="all">All Categories</option>
          {expenseCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Category</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Description</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Business</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-light">
                    Loading expenses...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-light">
                    {searchTerm || filterBusiness !== 'all' || filterCategory !== 'all'
                      ? 'No expenses found matching your filters.'
                      : 'No expenses recorded yet. Click "Add Expense" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(expense.date).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-gray-700">{expense.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-light text-black">{expense.description}</p>
                      {expense.vendorName && (
                        <p className="text-xs text-gray-500 font-light">Vendor: {expense.vendorName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-light ${getBusinessTypeColor(expense.businessType || 'both')}`}>
                        {getBusinessTypeLabel(expense.businessType || 'both')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-light text-red-600 text-lg">₹{expense.amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-black">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingExpense(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  >
                    <option value="">Select category...</option>
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  >
                    <option value="both">Both Businesses</option>
                    <option value="saas">SaaS Only</option>
                    <option value="pixels">Pixels Digital Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the expense..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cheque">Cheque</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Vendor / Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g., AWS, Google, etc."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional details..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingExpense(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-light"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Expense Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-light text-black">Expense Details</h2>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-sm text-red-600 font-light mb-2">Expense Amount</p>
                <p className="text-4xl font-light text-red-700">
                  ₹{selectedExpense.amount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-light mb-1">Category</p>
                  <p className="text-lg font-light text-black">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light mb-1">Business Type</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-light ${getBusinessTypeColor(selectedExpense.businessType || 'both')}`}>
                    {getBusinessTypeLabel(selectedExpense.businessType || 'both')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light mb-1">Date</p>
                  <p className="text-lg font-light text-black">
                    {new Date(selectedExpense.date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light mb-1">Payment Method</p>
                  <p className="text-lg font-light text-black capitalize">{selectedExpense.paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-light mb-2">Description</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-light text-black">{selectedExpense.description}</p>
                </div>
              </div>

              {selectedExpense.vendorName && (
                <div>
                  <p className="text-sm text-gray-600 font-light mb-2">Vendor / Supplier</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-light text-black">{selectedExpense.vendorName}</p>
                  </div>
                </div>
              )}

              {selectedExpense.notes && (
                <div>
                  <p className="text-sm text-gray-600 font-light mb-2">Additional Notes</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-light text-black">{selectedExpense.notes}</p>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 font-light text-center pt-4 border-t">
                Recorded on {new Date(selectedExpense.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
