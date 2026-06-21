'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Receipt, Search, Calendar, IndianRupee, Eye, X, Edit, Trash2, Filter } from 'lucide-react';
import Link from 'next/link';

interface Expense {
  _id: string;
  vendorId?: string;
  vendorName: string;
  projectId?: string;
  projectName?: string;
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

interface Project {
  _id: string;
  name: string;
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
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBusiness, setFilterBusiness] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    vendorId: '',
    category: '',
    projectId: '',
    projectName: '',
    businessType: 'both' as 'saas' | 'pixels' | 'both',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    vendorName: '',
    notes: '',
  });

  useEffect(() => {
    fetchExpenses();
    fetchVendors();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/vendors');
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

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
        vendorId: '',
        category: '',
        projectId: '',
        projectName: '',
        businessType: 'both',
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        vendorName: '',
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
      vendorId: expense.vendorId || '',
      category: expense.category,
      projectId: expense.projectId || '',
      projectName: expense.projectName || '',
      businessType: expense.businessType || 'both',
      description: expense.description,
      amount: expense.amount,
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      vendorName: expense.vendorName || '',
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
      saas: 'bg-purple-500/10 text-purple-500',
      pixels: 'bg-blue-500/10 text-blue-500',
      both: 'bg-emerald-500/10 text-emerald-500',
    };
    return colors[type] || 'bg-surface text-text-muted';
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
    <div className="p-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-medium text-text-primary mb-2">Business Expenses</h1>
          <p className="text-text-muted font-medium">Track and manage all business expenses</p>
        </div>
        <Link
          href="/admin/expenses/new"
          className="ta-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="ta-card">
          <p className="text-sm text-text-muted font-medium">Total Expenses</p>
          <p className="text-3xl font-medium text-red-500 mt-2">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="ta-card">
          <p className="text-sm text-text-muted font-medium">SaaS Expenses</p>
          <p className="text-3xl font-medium text-purple-500 mt-2">
            ₹{saasExpenses.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="ta-card">
          <p className="text-sm text-text-muted font-medium">Pixels Digital</p>
          <p className="text-3xl font-medium text-blue-500 mt-2">
            ₹{pixelsExpenses.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="ta-card">
          <p className="text-sm text-text-muted font-medium">Total Records</p>
          <p className="text-3xl font-medium text-text-primary mt-2">{expenses.length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ta-input w-full pl-12"
          />
        </div>
        <select
          value={filterBusiness}
          onChange={(e) => setFilterBusiness(e.target.value)}
          className="ta-input"
        >
          <option value="all">All Businesses</option>
          <option value="saas">SaaS Only</option>
          <option value="pixels">Pixels Digital Only</option>
          <option value="both">Both</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="ta-input"
        >
          <option value="all">All Categories</option>
          {expenseCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="ta-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="ta-table-header">
              <tr>
                <th className="ta-table-th">Date</th>
                <th className="ta-table-th">Category</th>
                <th className="ta-table-th">Description</th>
                <th className="ta-table-th">Business</th>
                <th className="ta-table-th">Amount</th>
                <th className="ta-table-th">Actions</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <AnimatePresence mode="popLayout">
                {filteredExpenses.length === 0 && !loading ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={6} className="ta-table-td text-center py-8 text-text-muted">
                      {searchTerm || filterBusiness !== 'all' || filterCategory !== 'all'
                        ? 'No expenses found matching your filters.'
                        : 'No expenses recorded yet. Click "Add Expense" to get started.'}
                    </td>
                  </motion.tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <motion.tr 
                      key={expense._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b border-border hover:bg-surface"
                    >
                      <td className="ta-table-td">
                        <span className="text-sm font-medium text-text-muted flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(expense.date).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td className="ta-table-td">
                        <span className="text-sm font-medium text-text-muted">{expense.category}</span>
                      </td>
                      <td className="ta-table-td">
                        <p className="font-medium text-text-primary">{expense.description}</p>
                        {expense.projectName && (
                          <p className="text-xs text-indigo-500 font-medium mt-1">Project: {expense.projectName}</p>
                        )}
                        {expense.vendorName && (
                          <p className="text-xs text-text-muted font-medium mt-1">Vendor: {expense.vendorName}</p>
                        )}
                      </td>
                      <td className="ta-table-td">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBusinessTypeColor(expense.businessType || 'both')}`}>
                          {getBusinessTypeLabel(expense.businessType || 'both')}
                        </span>
                      </td>
                      <td className="ta-table-td">
                        <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-md font-medium inline-block text-lg">₹{expense.amount.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="ta-table-td">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedExpense(expense)}
                            className="p-2 hover:bg-surface rounded-lg transition-colors text-text-muted hover:text-text-primary"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* View Expense Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-8 max-w-2xl w-full"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-medium text-text-primary">Expense Details</h2>
              <button
                onClick={() => setSelectedExpense(null)}
                className="p-2 hover:bg-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-sm text-red-600 font-medium mb-2">Expense Amount</p>
                <p className="text-4xl font-medium text-red-700">
                  ₹{selectedExpense.amount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-muted font-medium mb-1">Category</p>
                  <p className="text-lg font-medium text-text-primary">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted font-medium mb-1">Business Type</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getBusinessTypeColor(selectedExpense.businessType || 'both')}`}>
                    {getBusinessTypeLabel(selectedExpense.businessType || 'both')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-text-muted font-medium mb-1">Date</p>
                  <p className="text-lg font-medium text-text-primary">
                    {new Date(selectedExpense.date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-muted font-medium mb-1">Payment Method</p>
                  <p className="text-lg font-medium text-text-primary capitalize">{selectedExpense.paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-text-muted font-medium mb-2">Description</p>
                <div className="bg-surface rounded-xl p-4">
                  <p className="font-medium text-text-primary">{selectedExpense.description}</p>
                </div>
              </div>

              {selectedExpense.vendorName && (
                <div>
                  <p className="text-sm text-text-muted font-medium mb-2">Vendor / Supplier</p>
                  <div className="bg-surface rounded-xl p-4">
                    <p className="font-medium text-text-primary">{selectedExpense.vendorName}</p>
                  </div>
                </div>
              )}

              {selectedExpense.notes && (
                <div>
                  <p className="text-sm text-text-muted font-medium mb-2">Additional Notes</p>
                  <div className="bg-surface rounded-xl p-4">
                    <p className="font-medium text-text-primary">{selectedExpense.notes}</p>
                  </div>
                </div>
              )}

              <div className="text-xs text-text-muted font-medium text-center pt-4 border-t">
                Recorded on {new Date(selectedExpense.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
