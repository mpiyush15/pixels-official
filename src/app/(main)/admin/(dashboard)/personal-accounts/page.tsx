'use client';

import { useState, useEffect } from 'react';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  CreditCard,
  X,
} from 'lucide-react';

interface PersonalTransaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  notes: string;
  salaryId?: string;
  employeeId?: string;
  createdAt: string;
}

interface PersonalStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: Record<string, number>;
  monthlyData: Record<string, { income: number; expenses: number }>;
}

export default function PersonalAccountsPage() {
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([]);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'other',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'bank_transfer',
    notes: '',
  });

  const incomeCategories = ['salary', 'freelance', 'investment_return', 'other'];
  const expenseCategories = [
    'food',
    'travel',
    'shopping',
    'bills',
    'rent',
    'healthcare',
    'entertainment',
    'investment',
    'education',
    'other',
  ];

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, statsRes] = await Promise.all([
        fetch('/api/personal-accounts'),
        fetch('/api/personal-accounts/stats'),
      ]);

      const transactionsData = await transactionsRes.json();
      const statsData = await statsRes.json();

      if (transactionsData.success) {
        setTransactions(transactionsData.data);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/personal-accounts/${editingId}`
        : '/api/personal-accounts';

      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchData();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (transaction: PersonalTransaction) => {
    setEditingId(transaction._id);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      date: transaction.date.split('T')[0],
      description: transaction.description,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const response = await fetch(`/api/personal-accounts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: 'other',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'bank_transfer',
      notes: '',
    });
    setEditingId(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personal Accounts</h1>
          <p className="text-gray-600 mt-1">Track your personal income and expenses</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Income</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expenses</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalExpenses)}
            </p>
          </div>

          {/* Balance */}
          <div className={`bg-gradient-to-br ${
            stats.balance >= 0
              ? 'from-blue-50 to-indigo-50 border-blue-200'
              : 'from-orange-50 to-red-50 border-orange-200'
          } border rounded-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                stats.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
              }`}>
                <Wallet className={`w-6 h-6 ${
                  stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Current Balance</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.balance)}
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No transactions found. Add your first transaction to get started!
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const isAutoSalary = transaction.salaryId && transaction.category === 'salary';
                  return (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">
                          {getCategoryLabel(transaction.category)}
                        </span>
                        {isAutoSalary && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            Auto
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {paymentMethods.find(m => m.value === transaction.paymentMethod)?.label}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isAutoSalary ? (
                        <span className="text-xs text-gray-400 italic">Auto-recorded</span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type *
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: 'other' })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      formData.type === 'income'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5 inline mr-2" />
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: 'other' })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      formData.type === 'expense'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5 inline mr-2" />
                    Expense
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {(formData.type === 'income' ? incomeCategories : expenseCategories).map(
                    (category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="E.g., Monthly salary, Grocery shopping"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
