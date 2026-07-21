'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  IndianRupee,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Payment {
  _id: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paymentDate: string;
  paymentDetails?: string;
}

export default function ClientPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/client-auth/session');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/client-portal/login');
        return;
      }

      fetchPayments();
    } catch (error) {
      router.push('/client-portal/login');
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/client-portal/payments');
      const data = await response.json();
      
      if (response.status === 401) {
        router.push('/client-portal/login');
        return;
      }
      
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'completed': 'bg-green-100 text-green-700',
      'failed': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'completed') return payment.status === 'completed';
    if (filter === 'pending') return payment.status === 'pending';
    return true;
  });

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-black mb-2">Payment History</h1>
        <p className="text-gray-600 font-light">
          View all your payment transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600 font-light">Total Paid</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            ₹{pendingAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-600 font-light">Pending</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {payments.filter(p => p.status === 'completed').length}
          </p>
          <p className="text-sm text-gray-600 font-light">Transactions</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'all'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Payments ({payments.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'completed'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Completed ({payments.filter(p => p.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-6 py-2 rounded-xl font-light transition-colors ${
            filter === 'pending'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending ({payments.filter(p => p.status === 'pending').length})
        </button>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-gray-200">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-light">No payments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      payment.status === 'completed' 
                        ? 'bg-green-100' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                    }`}>
                      {payment.status === 'completed' ? (
                        <ArrowUpRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-light text-black">
                          {payment.invoiceNumber}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-light ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 font-light">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {payment.paymentMethod}
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-gray-500">
                            ID: {payment.transactionId}
                          </div>
                        )}
                      </div>
                      {payment.paymentDetails && (
                        <p className="text-xs text-gray-500 font-light mt-1">
                          {payment.paymentDetails}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-light ${
                      payment.status === 'completed' 
                        ? 'text-green-600' 
                        : payment.status === 'pending'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
