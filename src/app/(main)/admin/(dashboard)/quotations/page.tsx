'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCheck, 
  Plus, 
  Send, 
  Eye, 
  Edit2, 
  Trash2, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface QuotationItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Quotation {
  _id: string;
  quotationNumber: string;
  clientId: string;
  clientSalutation?: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientAddress?: string;
  title: string;
  description?: string;
  items: QuotationItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  validUntil: string;
  terms?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  sentAt?: string;
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

interface Client {
  _id: string;
  salutation?: string;
  name: string;
  email: string;
}

const defaultTerms = '1. Payment is due within 15 days of invoice date.\n2. 50% advance payment required to commence work.\n3. This quotation is valid for 30 days from the date of issue.';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    clientAddress: '',
    title: '',
    description: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    tax: 0,
    discount: 0,
    validUntil: '',
    terms: defaultTerms,
    notes: ''
  });

  useEffect(() => {
    fetchQuotations();
    fetchClients();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch('/api/quotations');
      const data = await response.json();
      if (data.success) {
        setQuotations(data.quotations);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      // The clients API returns clients directly as an array
      if (Array.isArray(data)) {
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const calculateItemAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * (formData.tax || 0)) / 100;
    return subtotal + taxAmount - (formData.discount || 0);
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = calculateItemAmount(
        newItems[index].quantity,
        newItems[index].rate
      );
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subtotal: calculateSubtotal(),
          total: calculateTotal()
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Quotation created successfully!');
        setShowCreateModal(false);
        fetchQuotations();
        resetForm();
      } else {
        alert(data.error || 'Failed to create quotation');
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      alert('Failed to create quotation');
    }
  };

  const handleSendQuotation = async (id: string) => {
    if (!confirm('Send this quotation to the client?')) return;
    
    try {
      const response = await fetch(`/api/quotations/${id}/send`, {
        method: 'POST'
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Quotation sent successfully!');
        fetchQuotations();
      } else {
        alert(data.error || 'Failed to send quotation');
      }
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert('Failed to send quotation');
    }
  };

  const handleDeleteQuotation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    
    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Quotation deleted successfully!');
        fetchQuotations();
      }
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert('Failed to delete quotation');
    }
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setEditingId(quotation._id);
    setFormData({
      clientId: quotation.clientId,
      clientAddress: quotation.clientAddress || '',
      title: quotation.title,
      description: quotation.description || '',
      items: quotation.items,
      tax: quotation.tax || 0,
      discount: quotation.discount || 0,
      validUntil: new Date(quotation.validUntil).toISOString().split('T')[0],
      terms: quotation.terms || defaultTerms,
      notes: quotation.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const response = await fetch(`/api/quotations/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          subtotal: calculateSubtotal(),
          total: calculateTotal()
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Quotation updated successfully!');
        setShowEditModal(false);
        setEditingId(null);
        fetchQuotations();
        resetForm();
      } else {
        alert(data.error || 'Failed to update quotation');
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      alert('Failed to update quotation');
    }
  };

  const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
    const message = status === 'accepted' 
      ? 'Mark this quotation as CONVERTED/ACCEPTED?' 
      : 'Mark this quotation as REJECTED?';
    
    if (!confirm(message)) return;

    let reason = '';
    if (status === 'rejected') {
      reason = prompt('Enter rejection reason (optional):') || 'No reason provided';
    }

    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: status === 'accepted' ? 'accept' : 'reject',
          rejectionReason: reason
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Quotation ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
        fetchQuotations();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDownloadPDF = (quotation: Quotation) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation - ${quotation.quotationNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', sans-serif;
            padding: 50px;
            color: #334155;
            font-size: 13px;
            line-height: 1.6;
            background-color: #fff;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 30px;
            margin-bottom: 40px;
          }
          .brand {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .doc-type {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 5px;
          }
          .quotation-meta {
            text-align: right;
          }
          .meta-row {
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            margin-bottom: 5px;
          }
          .meta-label {
            font-weight: 600;
            color: #64748b;
          }
          .meta-value {
            font-weight: 500;
            color: #0f172a;
            min-width: 100px;
          }
          .info-section {
            display: flex;
            gap: 50px;
            margin-bottom: 40px;
          }
          .info-block {
            flex: 1;
          }
          .section-title {
            font-size: 11px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
          }
          .info-name {
            font-weight: 700;
            font-size: 15px;
            color: #0f172a;
            margin-bottom: 5px;
          }
          .info-line {
            color: #475569;
            margin-bottom: 3px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 40px 0;
          }
          th {
            background: #f8fafc;
            color: #475569;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            border-bottom: 2px solid #e2e8f0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            padding: 15px;
            border-bottom: 1px solid #f1f5f9;
            color: #1e293b;
          }
          tr:nth-child(even) td {
            background-color: #fcfcfd;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .totals-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 50px;
          }
          .totals {
            width: 350px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            color: #475569;
          }
          .totals-row.grand-total {
            border-top: 2px solid #e2e8f0;
            font-weight: 700;
            font-size: 16px;
            color: #0f172a;
            margin-top: 10px;
            padding-top: 15px;
          }
          .terms {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            page-break-inside: avoid;
          }
          .terms-title {
            font-weight: 600;
            margin-bottom: 15px;
            color: #0f172a;
            font-size: 14px;
          }
          .terms-content {
            font-size: 12px;
            line-height: 1.8;
            color: #64748b;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }
          @page {
            margin: 0.5cm;
          }
          @media print {
            body { 
              padding: 0 !important;
              margin: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-size: 11px !important;
            }
            .brand { font-size: 24px !important; }
            .info-section { gap: 30px !important; margin-bottom: 30px !important; }
            .totals { width: 280px !important; padding: 15px !important; }
            .no-print { display: none !important; }
            .info-section, .totals-wrapper { page-break-inside: avoid; }
            table { page-break-inside: auto; width: 100% !important; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div>
            <div class="brand">PIXELS DIGITAL SOLUTIONS</div>
            <div class="doc-type">Quotation</div>
          </div>
          <div class="quotation-meta">
            <div class="meta-row">
              <span class="meta-label">Quotation No:</span>
              <span class="meta-value">${quotation.quotationNumber}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Date:</span>
              <span class="meta-value">${new Date(quotation.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Valid Until:</span>
              <span class="meta-value">${new Date(quotation.validUntil).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <!-- From -->
          <div class="info-block">
            <div class="section-title">From</div>
            <div class="info-name">Pixels Digital Solutions</div>
            <div class="info-line">mpiyush2727@gmail.com</div>
            <div class="info-line">+91 9766504856</div>
            <div class="info-line">pixelsdigitalsolutions.com</div>
          </div>

          <!-- To -->
          <div class="info-block">
            <div class="section-title">Quotation For</div>
            ${quotation.clientCompany ? `<div class="info-name" style="margin-bottom: 2px;">${quotation.clientCompany}</div>` : ''}
            <div class="${quotation.clientCompany ? 'info-line' : 'info-name'}" style="font-weight: ${quotation.clientCompany ? '500' : '700'};">
              ${quotation.clientSalutation ? quotation.clientSalutation + ' ' : ''}${quotation.clientName}
            </div>
            <div class="info-line">${quotation.clientEmail}</div>
            ${quotation.clientAddress ? `<div class="info-line" style="white-space: pre-wrap;">${quotation.clientAddress}</div>` : ''}
          </div>
        </div>

        <!-- Project Overview -->
        ${quotation.title || quotation.description ? `
        <div style="margin-bottom: 30px;">
          ${quotation.title ? `<div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">${quotation.title}</div>` : ''}
          ${quotation.description ? `<div style="font-size: 13px; color: #475569; white-space: pre-wrap; line-height: 1.6;">${quotation.description}</div>` : ''}
        </div>
        ` : ''}

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th class="text-right">Rate</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${quotation.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">₹${item.rate.toFixed(2)}</td>
                <td class="text-right">₹${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-wrapper">
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>₹${quotation.subtotal.toFixed(2)}</span>
            </div>
            ${quotation.tax ? `
            <div class="totals-row">
              <span>Tax</span>
              <span>₹${quotation.tax.toFixed(2)}</span>
            </div>
            ` : ''}
            ${quotation.discount ? `
            <div class="totals-row">
              <span>Discount</span>
              <span>- ₹${quotation.discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="totals-row grand-total">
              <span>Total Amount</span>
              <span>₹${quotation.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Terms & Conditions -->
        ${(quotation.terms || defaultTerms) ? `
        <div class="terms">
          <div class="terms-title">Terms & Conditions</div>
          <div class="terms-content">${quotation.terms || defaultTerms}</div>
        </div>
        ` : ''}

        <!-- Additional Notes -->
        ${quotation.notes ? `
        <div class="terms">
          <div class="terms-title">Additional Notes</div>
          <div class="terms-content">${quotation.notes}</div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          Thank you for choosing Pixels Digital Solutions.
        </div>

        <!-- Print Button -->
        <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
          <button onclick="window.print()" style="
            background: #0f172a;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            margin-right: 10px;
            font-size: 12px;
            border-radius: 4px;
          ">Print PDF</button>
          <button onclick="window.close()" style="
            background: #64748b;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 12px;
            border-radius: 4px;
          ">Close</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientAddress: '',
      title: '',
      description: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      tax: 0,
      discount: 0,
      validUntil: '',
      terms: defaultTerms,
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      accepted: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-danger/10 text-danger border-danger/20',
      expired: 'bg-surface text-text-muted border-border'
    };
    
    const icons = {
      pending: <Clock className="w-3.5 h-3.5" />,
      accepted: <CheckCircle className="w-3.5 h-3.5" />,
      rejected: <XCircle className="w-3.5 h-3.5" />,
      expired: <AlertCircle className="w-3.5 h-3.5" />
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-text-primary mb-2">Quotations</h1>
          <p className="text-text-muted">Manage and send quotations to clients</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="ta-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Quotation
        </motion.button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="text"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 ta-input"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20 appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Material UI Style Table */}
      <div className="ta-table-container">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="ta-table-header">
                <th className="ta-table-th w-[35%]">
                  Quotation
                </th>
                <th className="ta-table-th w-[30%]">
                  Client
                </th>
                <th className="ta-table-th w-[15%]">
                  Amount
                </th>
                <th className="ta-table-th w-[20%]">
                  Valid Until
                </th>
                <th className="ta-table-th text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
              {filteredQuotations.map((quotation, index) => (
                <motion.tr
                  key={quotation._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ta-table-row"
                >
                  {/* Quotation Info */}
                  <td className="ta-table-td w-[35%]">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary">{quotation.title}</span>
                      <span className="text-xs font-semibold text-text-muted mt-0.5">{quotation.quotationNumber}</span>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="ta-table-td">
                    <div className="flex flex-col">
                      {quotation.clientCompany && (
                        <span className="text-sm font-bold text-text-primary">{quotation.clientCompany}</span>
                      )}
                      <span className={quotation.clientCompany ? "text-xs font-medium text-text-muted mt-0.5" : "text-sm font-bold text-text-primary"}>
                        {quotation.clientName}
                      </span>
                      <span className="text-xs font-medium text-text-muted mt-0.5">{quotation.clientEmail}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="ta-table-td w-[15%]">
                    <span className="text-sm font-bold text-text-primary">₹{quotation.total.toLocaleString('en-IN')}</span>
                  </td>

                  {/* Valid Until */}
                  <td className="ta-table-td w-[20%]">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-text-primary">
                        {new Date(quotation.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {quotation.sentAt && (
                        <span className="text-xs font-medium text-text-muted mt-0.5">
                          Sent: {new Date(quotation.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="ta-table-td">
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <motion.button
                        onClick={() => {
                          setSelectedQuotation(quotation);
                          setShowViewModal(true);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-text-muted hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>

                      {/* Edit */}
                      <motion.button
                        onClick={() => handleEditQuotation(quotation)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-text-muted hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors"
                        title="Edit Quotation"
                      >
                        <Edit2 className="w-5 h-5" />
                      </motion.button>

                      {/* Download PDF */}
                      <motion.button
                        onClick={() => handleDownloadPDF(quotation)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-text-muted hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>

                      {/* Send Email - Only for Pending */}
                      {quotation.status === 'pending' && (
                        <motion.button
                          onClick={() => handleSendQuotation(quotation._id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-text-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title={quotation.sentAt ? 'Resend Email' : 'Send Email'}
                        >
                          <Send className="w-5 h-5" />
                        </motion.button>
                      )}

                      {/* Delete */}
                      <motion.button
                        onClick={() => handleDeleteQuotation(quotation._id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Quotation"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>

                      {/* Status Dropdown - Only for Pending */}
                      {quotation.status === 'pending' && (
                        <select
                          onChange={(e) => {
                            if (e.target.value === 'accepted') {
                              handleStatusUpdate(quotation._id, 'accepted');
                            } else if (e.target.value === 'rejected') {
                              handleStatusUpdate(quotation._id, 'rejected');
                            }
                            e.target.value = 'pending';
                          }}
                          className="ml-1 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-text-primary bg-surface hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer transition-colors"
                          value="pending"
                        >
                          <option value="pending">Status</option>
                          <option value="accepted">✓ Convert</option>
                          <option value="rejected">✗ Reject</option>
                        </select>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredQuotations.length === 0 && (
          <div className="text-center py-16 bg-surface">
            <FileCheck className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-muted font-semibold">No quotations found</p>
            <p className="text-text-muted text-sm mt-1">Create your first quotation to get started</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 ta-modal-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ta-modal-content p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-light text-text-primary mb-6">Create New Quotation</h2>
            
            <form onSubmit={handleCreateQuotation} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Address */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Client Address</label>
                <textarea
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="Client Address (optional)"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="e.g., Website Development Proposal"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="Brief description of the quotation"
                />
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Items *</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      required
                      className="col-span-5 px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-white/20"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Qty"
                      required
                      min="1"
                      className="col-span-2 px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-white/20"
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder="Rate"
                      required
                      min="0"
                      step="0.01"
                      className="col-span-2 px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-white/20"
                    />
                    <div className="col-span-2 px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text-primary text-sm flex items-center">
                      ₹{item.amount.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="col-span-1 px-2 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-2 px-4 py-2 bg-surface/30 text-text-primary rounded-lg hover:bg-surface/50 transition-colors text-sm"
                >
                  + Add Item
                </button>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Tax (%)</label>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Valid Until *</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="bg-surface/30 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between text-text-primary mb-2">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-primary mb-2">
                  <span>Tax ({formData.tax}%):</span>
                  <span>₹{((calculateSubtotal() * (formData.tax || 0)) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-primary mb-2">
                  <span>Discount:</span>
                  <span>-₹{(formData.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-primary text-xl font-medium pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Terms & Notes */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Terms & Conditions</label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="Payment terms, delivery timeline, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="Any additional information"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-colors font-medium"
                >
                  Create Quotation
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-surface/30 text-text-primary rounded-lg hover:bg-surface/50 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 ta-modal-overlay flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ta-modal-content p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-light text-text-primary mb-6">Edit Quotation</h2>
            
            <form onSubmit={handleUpdateQuotation} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Address */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Client Address</label>
                <textarea
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="Client Address (optional)"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="e.g., Website Development Proposal"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="Brief description of the quotation"
                />
              </div>

              {/* Items */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Items *</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Description"
                      required
                      className="col-span-5 px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-white/20"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="Qty"
                      required
                      min="1"
                      className="col-span-2 px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-white/20"
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder="Rate"
                      required
                      min="0"
                      step="0.01"
                      className="col-span-2 px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-white/20"
                    />
                    <div className="col-span-2 px-4 py-2 bg-surface/30 border border-white/10 rounded-lg text-text-primary text-sm flex items-center">
                      ₹{item.amount.toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="col-span-1 px-2 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-2 px-4 py-2 bg-surface/30 text-text-primary rounded-lg hover:bg-surface/50 transition-colors text-sm"
                >
                  + Add Item
                </button>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Tax (%)</label>
                  <input
                    type="number"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Valid Until *</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="bg-surface/30 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between text-text-primary mb-2">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-primary mb-2">
                  <span>Tax ({formData.tax}%):</span>
                  <span>₹{((calculateSubtotal() * (formData.tax || 0)) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-primary mb-2">
                  <span>Discount:</span>
                  <span>-₹{(formData.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-text-primary text-xl font-medium pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Terms & Notes */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Terms & Conditions</label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="Payment terms, delivery timeline, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-surface/30 border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-white/20"
                  placeholder="Any additional information"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-purple-500 text-text-primary rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  Update Quotation
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-surface/30 text-text-primary rounded-lg hover:bg-surface/50 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedQuotation && (
        <div className="fixed inset-0 ta-modal-overlay flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ta-modal-content p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-light text-text-primary mb-2">{selectedQuotation.title}</h2>
                <p className="text-text-muted">{selectedQuotation.quotationNumber}</p>
              </div>
              {getStatusBadge(selectedQuotation.status)}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-text-muted">Client</p>
                {selectedQuotation.clientCompany && (
                  <p className="text-text-primary font-medium">{selectedQuotation.clientCompany}</p>
                )}
                <p className={selectedQuotation.clientCompany ? "text-sm text-text-primary" : "text-text-primary"}>
                  {selectedQuotation.clientSalutation && `${selectedQuotation.clientSalutation} `}
                  {selectedQuotation.clientName}
                </p>
                <p className="text-sm text-text-muted">{selectedQuotation.clientEmail}</p>
                {selectedQuotation.clientAddress && (
                  <p className="text-sm text-text-muted mt-1 whitespace-pre-wrap">{selectedQuotation.clientAddress}</p>
                )}
              </div>

              {selectedQuotation.description && (
                <div>
                  <p className="text-sm text-text-muted">Description</p>
                  <p className="text-text-primary">{selectedQuotation.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-text-primary mb-2">Items</p>
                <div className="bg-surface/30 border border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface/30">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-text-muted">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-text-muted">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-text-muted">Rate</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-text-muted">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotation.items.map((item, index) => (
                        <tr key={index} className="border-t border-white/10">
                          <td className="px-4 py-3 text-sm text-text-primary">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-text-primary text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-text-primary text-right">₹{item.rate.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-text-primary text-right">₹{item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-surface/30 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between text-text-primary mb-2">
                  <span>Subtotal:</span>
                  <span>₹{selectedQuotation.subtotal.toFixed(2)}</span>
                </div>
                {selectedQuotation.tax && (
                  <div className="flex justify-between text-text-primary mb-2">
                    <span>Tax:</span>
                    <span>₹{selectedQuotation.tax.toFixed(2)}</span>
                  </div>
                )}
                {selectedQuotation.discount && (
                  <div className="flex justify-between text-text-primary mb-2">
                    <span>Discount:</span>
                    <span>-₹{selectedQuotation.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-primary text-xl font-medium pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span>₹{selectedQuotation.total.toFixed(2)}</span>
                </div>
              </div>

              {(selectedQuotation.terms || defaultTerms) && (
                <div>
                  <p className="text-sm text-text-primary mb-2">Terms & Conditions</p>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-text-primary text-sm whitespace-pre-wrap">{selectedQuotation.terms || defaultTerms}</p>
                  </div>
                </div>
              )}

              {selectedQuotation.notes && (
                <div>
                  <p className="text-sm text-text-primary mb-2">Additional Notes</p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-100 text-sm whitespace-pre-wrap">{selectedQuotation.notes}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-muted">Created</p>
                  <p className="text-text-primary">{new Date(selectedQuotation.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-text-muted">Valid Until</p>
                  <p className="text-text-primary">{new Date(selectedQuotation.validUntil).toLocaleDateString()}</p>
                </div>
                {selectedQuotation.sentAt && (
                  <div>
                    <p className="text-text-muted">Sent</p>
                    <p className="text-text-primary">{new Date(selectedQuotation.sentAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedQuotation.acceptedAt && (
                  <div>
                    <p className="text-text-muted">Accepted</p>
                    <p className="text-text-primary">{new Date(selectedQuotation.acceptedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Status Update Buttons - Only for Pending */}
              {selectedQuotation.status === 'pending' && (
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => {
                      handleStatusUpdate(selectedQuotation._id, 'accepted');
                      setShowViewModal(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-text-primary rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Converted
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      handleStatusUpdate(selectedQuotation._id, 'rejected');
                      setShowViewModal(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 text-text-primary rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    <XCircle className="w-5 h-5" />
                    Mark as Rejected
                  </motion.button>
                </div>
              )}

              {/* Other Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => handleDownloadPDF(selectedQuotation)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-text-primary rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </motion.button>
                <motion.button
                  onClick={() => setShowViewModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 bg-surface/30 text-text-primary rounded-lg hover:bg-surface/50 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
