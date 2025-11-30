'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, Search, Filter, Calendar, IndianRupee, Eye, X, XCircle } from 'lucide-react';

interface Payment {
  _id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentMethod: string;
  paymentDetails: string;
  paymentDate: string;
  status: 'completed' | 'cancelled';
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  status: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [formData, setFormData] = useState({
    invoiceId: '',
    paymentMethod: 'bank_transfer',
    paymentDetails: '',
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, invoicesRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/invoices'),
      ]);
      const paymentsData = await paymentsRes.json();
      const invoicesData = await invoicesRes.json();
      setPayments(paymentsData);
      setInvoices(invoicesData.filter((inv: Invoice) => inv.status === 'sent' || inv.status === 'draft'));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setShowAddModal(false);
      setFormData({
        invoiceId: '',
        paymentMethod: 'bank_transfer',
        paymentDetails: '',
        paymentDate: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      bank_transfer: 'Bank Transfer',
      upi: 'UPI',
      cash: 'Cash',
      cheque: 'Cheque',
      card: 'Card',
      other: 'Other',
    };
    return methods[method] || method;
  };

  const handleCancelPayment = async () => {
    if (!selectedPayment || !cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    if (!confirm(`Are you sure you want to cancel this payment? This will also revert the invoice status.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/${selectedPayment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancelReason: cancelReason,
        }),
      });

      if (response.ok) {
        setShowCancelModal(false);
        setSelectedPayment(null);
        setCancelReason('');
        fetchData();
      } else {
        alert('Failed to cancel payment');
      }
    } catch (error) {
      console.error('Error cancelling payment:', error);
      alert('Failed to cancel payment');
    }
  };

  const totalReceived = payments
    .filter(p => p.status !== 'cancelled')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-light text-black mb-2">Payments</h1>
          <p className="text-gray-600 font-light">Track and manage all payment transactions</p>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span>Record Payment</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Payments</p>
          <p className="text-3xl font-light text-black mt-2">{payments.filter(p => p.status !== 'cancelled').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Received</p>
          <p className="text-3xl font-light text-green-600 mt-2">
            ₹{totalReceived.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Cancelled</p>
          <p className="text-3xl font-light text-red-600 mt-2">{payments.filter(p => p.status === 'cancelled').length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Pending Invoices</p>
          <p className="text-3xl font-light text-orange-600 mt-2">{invoices.length}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by client name or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
        >
          <option value="all">All Payments</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Invoice</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Client</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Method</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-light">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-light">
                    {searchTerm || filterStatus !== 'all' ? 'No payments found matching your filters.' : 'No payments recorded yet.'}
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className={`border-b border-gray-100 hover:bg-gray-50 ${payment.status === 'cancelled' ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-light text-black">{payment.invoiceNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-light text-black">{payment.clientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-light text-lg ${payment.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-green-600'}`}>
                        ₹{payment.amount.toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-light">
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-light ${
                        payment.status === 'cancelled' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {payment.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {payment.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowCancelModal(true);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Payment"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-black">Record Payment</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Select Invoice *
                </label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  required
                >
                  <option value="">Choose an unpaid invoice...</option>
                  {invoices.map(invoice => (
                    <option key={invoice._id} value={invoice._id}>
                      {invoice.invoiceNumber} - {invoice.clientName} - ₹{invoice.total.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  required
                />
              </div>

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
                  <option value="bank_transfer">Bank Transfer / NEFT / RTGS</option>
                  <option value="upi">UPI Payment</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Payment Details / Reference Number
                </label>
                <textarea
                  value={formData.paymentDetails}
                  onChange={(e) => setFormData({ ...formData, paymentDetails: e.target.value })}
                  placeholder="Enter transaction ID, reference number, or any additional details..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-light"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Payment Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-light text-black">Payment Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <p className="text-sm text-green-600 font-light mb-2">Payment Amount</p>
                <p className="text-4xl font-light text-green-700">
                  ₹{selectedPayment.amount.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-light mb-1">Invoice Number</p>
                  <p className="text-lg font-light text-black">{selectedPayment.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light mb-1">Client Name</p>
                  <p className="text-lg font-light text-black">{selectedPayment.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light mb-1">Payment Date</p>
                  <p className="text-lg font-light text-black">
                    {new Date(selectedPayment.paymentDate).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light mb-1">Payment Method</p>
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-light">
                    {getPaymentMethodLabel(selectedPayment.paymentMethod)}
                  </span>
                </div>
              </div>

              {selectedPayment.paymentDetails && (
                <div>
                  <p className="text-sm text-gray-600 font-light mb-2">Payment Details / Reference</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-light text-black">{selectedPayment.paymentDetails}</p>
                  </div>
                </div>
              )}

              {selectedPayment.status === 'cancelled' && selectedPayment.cancelReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600 font-light mb-2">Cancellation Reason</p>
                  <p className="font-light text-black">{selectedPayment.cancelReason}</p>
                  {selectedPayment.cancelledAt && (
                    <p className="text-xs text-red-500 mt-2">
                      Cancelled on {new Date(selectedPayment.cancelledAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500 font-light text-center pt-4 border-t">
                Recorded on {new Date(selectedPayment.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Payment Modal */}
      {showCancelModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-black">Cancel Payment</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600 font-light mb-2">Warning</p>
              <p className="font-light text-black">
                Cancelling this payment will also revert the invoice status back to 'sent'.
                This action cannot be undone.
              </p>
            </div>

            <div className="mb-6">
              <p className="font-light text-black mb-2">Payment Details:</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-light">
                  <span className="text-gray-600">Invoice:</span> {selectedPayment.invoiceNumber}
                </p>
                <p className="text-sm font-light">
                  <span className="text-gray-600">Client:</span> {selectedPayment.clientName}
                </p>
                <p className="text-sm font-light">
                  <span className="text-gray-600">Amount:</span> ₹{selectedPayment.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-sm font-light">
                  <span className="text-gray-600">Date:</span> {new Date(selectedPayment.paymentDate).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 font-light mb-2">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this payment..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light resize-none"
                rows={4}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelPayment}
                className="flex-1 px-6 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-light"
                disabled={!cancelReason.trim()}
              >
                Cancel Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
