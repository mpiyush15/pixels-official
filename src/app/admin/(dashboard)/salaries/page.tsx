'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Edit2, 
  Trash2, 
  X,
  CheckCircle,
  Clock,
  Filter,
  Download,
  TrendingUp,
  Briefcase
} from 'lucide-react';

interface Salary {
  _id: string;
  employeeName: string;
  employeeId?: string;
  designation?: string;
  amount: number;
  month: number;
  year: number;
  paymentDate?: string;
  paymentMethod: 'bank_transfer' | 'upi' | 'cash' | 'card' | 'cheque';
  accountType: 'cash' | 'bank';
  bankName?: string;
  deductions?: number;
  bonus?: number;
  netAmount: number;
  status: 'paid' | 'pending';
  notes?: string;
  createdAt: string;
}

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  designation: string;
  email?: string;
  phone?: string;
  role: string;
  department: string;
  salary?: number;
  status: string;
  isOwner?: boolean;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
];

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [filteredSalaries, setFilteredSalaries] = useState<Salary[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    designation: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer' as const,
    accountType: 'bank' as const,
    bankName: '',
    deductions: 0,
    bonus: 0,
    status: 'pending' as const,
    notes: ''
  });

  useEffect(() => {
    fetchSalaries();
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterSalaries();
  }, [salaries, searchTerm, statusFilter, monthFilter, yearFilter]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchSalaries = async () => {
    try {
      const response = await fetch('/api/salaries');
      const data = await response.json();
      if (data.success) {
        setSalaries(data.data);
      }
    } catch (error) {
      console.error('Error fetching salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSalaries = () => {
    let filtered = salaries;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(salary =>
        salary.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salary.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salary.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(salary => salary.status === statusFilter);
    }

    // Filter by month
    if (monthFilter !== 'all') {
      filtered = filtered.filter(salary => salary.month === monthFilter);
    }

    // Filter by year
    filtered = filtered.filter(salary => salary.year === yearFilter);

    setFilteredSalaries(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingSalary ? `/api/salaries/${editingSalary._id}` : '/api/salaries';
      const method = editingSalary ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        fetchSalaries();
        handleCloseModal();
      } else {
        alert(data.error || 'Failed to save salary');
      }
    } catch (error) {
      console.error('Error saving salary:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this salary record?')) return;

    try {
      const response = await fetch(`/api/salaries/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchSalaries();
      }
    } catch (error) {
      console.error('Error deleting salary:', error);
    }
  };

  const handleEdit = (salary: Salary) => {
    setEditingSalary(salary);
    setSelectedEmployeeId(salary.employeeId || '');
    setFormData({
      employeeName: salary.employeeName,
      employeeId: salary.employeeId || '',
      designation: salary.designation || '',
      amount: salary.amount,
      month: salary.month,
      year: salary.year,
      paymentDate: salary.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: salary.paymentMethod as any,
      accountType: salary.accountType as any,
      bankName: salary.bankName || '',
      deductions: salary.deductions || 0,
      bonus: salary.bonus || 0,
      status: salary.status as any,
      notes: salary.notes || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSalary(null);
    setSelectedEmployeeId('');
    setFormData({
      employeeName: '',
      employeeId: '',
      designation: '',
      amount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      accountType: 'bank',
      bankName: '',
      deductions: 0,
      bonus: 0,
      status: 'pending',
      notes: ''
    });
  };

  // Calculate statistics
  const totalPaid = salaries
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.netAmount, 0);

  const totalPending = salaries
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.netAmount, 0);

  const currentMonthSalaries = salaries.filter(
    s => s.month === new Date().getMonth() + 1 && s.year === new Date().getFullYear()
  );

  const uniqueEmployees = new Set(salaries.map(s => s.employeeName)).size;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-light text-black mb-2">Salary Management</h1>
          <p className="text-gray-600 font-light">Track and manage employee salaries</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Salary
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Paid</h3>
          </div>
          <p className="text-3xl font-light text-black">₹{totalPaid.toLocaleString('en-IN')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Pending</h3>
          </div>
          <p className="text-3xl font-light text-black">₹{totalPending.toLocaleString('en-IN')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Employees</h3>
          </div>
          <p className="text-3xl font-light text-black">{uniqueEmployees}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium">This Month</h3>
          </div>
          <p className="text-3xl font-light text-black">{currentMonthSalaries.length}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, designation, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>

          {/* Month Filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Months</option>
            {monthNames.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Salaries Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading salaries...</div>
        ) : filteredSalaries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No salaries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Employee</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Period</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Gross Amount</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Deductions</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Bonus</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Net Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Payment</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSalaries.map((salary) => (
                  <motion.tr
                    key={salary._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-black">{salary.employeeName}</p>
                        {salary.designation && (
                          <p className="text-sm text-gray-500">{salary.designation}</p>
                        )}
                        {salary.employeeId && (
                          <p className="text-xs text-gray-400">ID: {salary.employeeId}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{monthNames[salary.month - 1]} {salary.year}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">₹{salary.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right text-red-600">
                      {salary.deductions ? `-₹${salary.deductions.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="p-4 text-right text-green-600">
                      {salary.bonus ? `+₹${salary.bonus.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="p-4 text-right font-medium">₹{salary.netAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-gray-900">{paymentMethods.find(p => p.value === salary.paymentMethod)?.label}</p>
                        <p className="text-gray-500 capitalize">{salary.accountType}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        salary.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {salary.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {salary.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(salary)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(salary._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-light text-black">
                  {editingSalary ? 'Edit Salary' : 'Add Salary'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employee Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Employee *
                    </label>
                    <select
                      required
                      value={selectedEmployeeId}
                      onChange={(e) => {
                        const empId = e.target.value;
                        setSelectedEmployeeId(empId);
                        const employee = employees.find(emp => emp.employeeId === empId);
                        if (employee) {
                          setFormData({
                            ...formData,
                            employeeName: employee.name,
                            employeeId: employee.employeeId,
                            designation: employee.designation,
                            amount: employee.salary || formData.amount
                          });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">-- Select Employee --</option>
                      {employees.filter(emp => emp.status === 'active').map((employee) => (
                        <option key={employee._id} value={employee.employeeId}>
                          {employee.name} ({employee.employeeId}) - {employee.designation}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employee Name (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeeName}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Employee ID (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Designation (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Gross Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gross Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Month */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month *
                    </label>
                    <select
                      required
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {monthNames.map((month, index) => (
                        <option key={index} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <select
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {[2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Deductions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deductions (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.deductions}
                      onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Bonus */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bonus (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      required
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {paymentMethods.map(method => (
                        <option key={method.value} value={method.value}>{method.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type *
                    </label>
                    <select
                      required
                      value={formData.accountType}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="bank">Bank</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  {/* Bank Name */}
                  {formData.accountType === 'bank' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {/* Net Amount Display */}
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Net Amount:</span>
                      <span className="text-2xl font-light text-black">
                        ₹{(formData.amount - formData.deductions + formData.bonus).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingSalary ? 'Update Salary' : 'Add Salary'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
