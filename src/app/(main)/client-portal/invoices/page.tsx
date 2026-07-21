'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  IndianRupee,
} from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';
  issueDate: string;
  dueDate: string;
  services: Array<{ name: string; quantity: number; price: number }>;
  s3Key?: string;
  s3Url?: string;
  s3UploadedAt?: string;
}

export default function ClientInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

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

      fetchInvoices();
    } catch (error) {
      router.push('/client-portal/login');
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/client-portal/invoices');
      const data = await response.json();
      
      if (response.status === 401) {
        router.push('/client-portal/login');
        return;
      }
      
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-700',
      'sent': 'bg-blue-100 text-blue-700',
      'paid': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'overdue': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle className="w-4 h-4" />;
    if (status === 'sent') return <Clock className="w-4 h-4" />;
    if (status === 'overdue') return <AlertCircle className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const handlePayNow = async (invoiceId: string) => {
    try {
      setPayingInvoiceId(invoiceId);
      
      // Generate payment link
      const response = await fetch(`/api/invoices/${invoiceId}/generate-payment-link`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success && data.paymentLink) {
        // Redirect to Cashfree payment page
        window.location.href = data.paymentLink;
      } else {
        alert('Failed to generate payment link: ' + (data.error || 'Unknown error'));
        setPayingInvoiceId(null);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
      setPayingInvoiceId(null);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'pending') return invoice.status === 'sent' || invoice.status === 'overdue';
    if (filter === 'paid') return invoice.status === 'paid';
    return true;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingPayments = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-light text-black mb-2">Your Invoices</h1>
        <p className="text-sm md:text-base text-gray-600 font-light">
          View and manage all your invoices
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <p className="text-2xl md:text-3xl font-light text-black mb-1">{invoices.length}</p>
          <p className="text-xs md:text-sm text-gray-600 font-light">Total Invoices</p>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <IndianRupee className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
          </div>
          <p className="text-2xl md:text-3xl font-light text-black mb-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-xs md:text-sm text-gray-600 font-light">Total Paid</p>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
          </div>
          <p className="text-2xl md:text-3xl font-light text-black mb-1">
            ₹{pendingPayments.toLocaleString('en-IN')}
          </p>
          <p className="text-xs md:text-sm text-gray-600 font-light">Pending Payments</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 md:mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 md:px-6 py-2 rounded-xl font-light transition-colors whitespace-nowrap text-sm md:text-base ${
            filter === 'all'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({invoices.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 md:px-6 py-2 rounded-xl font-light transition-colors whitespace-nowrap text-sm md:text-base ${
            filter === 'pending'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending ({invoices.filter(i => i.status === 'sent').length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 md:px-6 py-2 rounded-xl font-light transition-colors whitespace-nowrap text-sm md:text-base ${
            filter === 'paid'
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Paid ({invoices.filter(i => i.status === 'paid').length})
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-3 md:space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-sm md:text-base text-gray-500 font-light">No invoices found</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <motion.div
              key={invoice._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-light text-black truncate mb-2">
                      {invoice.invoiceNumber}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 md:px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusIcon(invoice.status)}
                        {invoice.status.toUpperCase()}
                      </span>
                      {invoice.status === 'paid' && (
                        <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          PAID
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl md:text-3xl font-light text-black">
                      ₹{invoice.total.toLocaleString('en-IN')}
                    </p>
                    {invoice.status === 'sent' && (
                      <p className="text-xs text-orange-600 font-light mt-1">
                        Pending
                      </p>
                    )}
                    {invoice.status === 'paid' && (
                      <p className="text-xs text-green-600 font-light mt-1">Paid</p>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 text-xs md:text-sm text-gray-600 font-light">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">Issue: {new Date(invoice.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="truncate">Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>

                {/* Services */}
                {invoice.services && invoice.services.length > 0 && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 font-light mb-2">
                      Services:
                    </p>
                    <div className="space-y-1">
                      {invoice.services.map((service, idx) => (
                        <div
                          key={idx}
                          className="text-xs md:text-sm text-gray-700 font-light flex justify-between items-center gap-2"
                        >
                          <span className="truncate">• {service.name}</span>
                          <span className="text-gray-500 whitespace-nowrap">
                            {service.quantity} × ₹{service.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 border-t border-gray-100 pt-3">
                  {/* Pay Now button for unpaid invoices */}
                  {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                    <button
                      onClick={() => handlePayNow(invoice._id)}
                      disabled={payingInvoiceId === invoice._id}
                      className="flex-1 flex items-center gap-2 px-4 py-2.5 md:py-2 bg-green-600 text-white rounded-lg md:rounded-xl font-light hover:bg-green-700 transition-colors text-sm justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {payingInvoiceId === invoice._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <IndianRupee className="w-4 h-4" />
                          Pay Now
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Download Invoice button */}
                  {invoice.s3Url ? (
                    <a
                      href={invoice.s3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center gap-2 px-4 py-2.5 md:py-2 bg-black text-white rounded-lg md:rounded-xl font-light hover:bg-gray-900 transition-colors text-sm justify-center"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  ) : (
                    <button
                      className="flex-1 flex items-center gap-2 px-4 py-2.5 md:py-2 bg-gray-200 text-gray-500 rounded-lg md:rounded-xl font-light text-sm justify-center cursor-not-allowed"
                      disabled
                      title="Invoice file not available"
                    >
                      <Download className="w-4 h-4" />
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
