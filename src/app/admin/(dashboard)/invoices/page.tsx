'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Download, Eye, X, Calendar, IndianRupee, Printer, Mail } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientCompany?: string;
  clientAddress?: string;
  services: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentDetails?: string;
  paymentLink?: string;
  cashfreeOrderId?: string;
  paymentSessionId?: string;
  paymentLinkCreatedAt?: string;
  createdAt: string;
}

const defaultServices = [
  { name: 'Website Development', price: 50000, description: 'Complete website development with responsive design' },
  { name: 'E-commerce Website', price: 75000, description: 'Full-featured e-commerce platform with payment integration' },
  { name: 'Social Media Marketing (Monthly)', price: 15000, description: 'Monthly social media management and content creation' },
  { name: 'SEO Services (Monthly)', price: 12000, description: 'Search engine optimization and content strategy' },
  { name: 'Video Content Creation', price: 8000, description: 'Professional video production and editing' },
  { name: 'Corporate Video', price: 25000, description: 'High-quality corporate video production' },
  { name: 'Graphic Design', price: 5000, description: 'Custom graphic design services' },
  { name: 'Logo Design', price: 10000, description: 'Professional logo design with multiple concepts' },
  { name: 'Brand Identity Package', price: 30000, description: 'Complete brand identity development' },
  { name: 'Content Writing', price: 3000, description: 'Professional content writing services' },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [generatingPaymentLink, setGeneratingPaymentLink] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'bank_transfer',
    details: '',
  });
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    services: [{ name: '', description: '', quantity: 1, price: 0 }],
    tax: 18,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-fetch client details when client is selected
  useEffect(() => {
    if (formData.clientId) {
      const client = clients.find(c => c._id === formData.clientId);
      setSelectedClient(client || null);
    } else {
      setSelectedClient(null);
    }
  }, [formData.clientId, clients]);

  const fetchData = async () => {
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/clients'),
      ]);
      const invoicesData = await invoicesRes.json();
      const clientsData = await clientsRes.json();
      
      // Ensure we always set arrays, even if the response is malformed
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error to prevent undefined errors
      setInvoices([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) return;

    const subtotal = formData.services.reduce((sum, s) => sum + (s.quantity * s.price), 0);
    const taxAmount = (subtotal * formData.tax) / 100;
    const total = subtotal + taxAmount;

    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          clientName: selectedClient.name,
          clientEmail: selectedClient.email,
          clientPhone: selectedClient.phone,
          clientCompany: selectedClient.company,
          clientAddress: selectedClient.address || '',
          services: formData.services,
          subtotal,
          tax: taxAmount,
          total,
          issueDate: formData.issueDate,
          dueDate: formData.dueDate,
        }),
      });

      setShowCreateModal(false);
      setFormData({
        clientId: '',
        services: [{ name: '', description: '', quantity: 1, price: 0 }],
        tax: 18,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setSelectedClient(null);
      fetchData();
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', description: '', quantity: 1, price: 0 }],
    });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index),
    });
  };

  const updateService = (index: number, field: string, value: any) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    
    // If name changed to a predefined service, auto-fill price and description
    if (field === 'name' && value !== 'Custom') {
      const predefined = defaultServices.find(s => s.name === value);
      if (predefined) {
        updatedServices[index].price = predefined.price;
        updatedServices[index].description = predefined.description;
      }
    }
    
    setFormData({ ...formData, services: updatedServices });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'overdue': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePrintInvoice = () => {
    if (invoiceRef.current && selectedInvoice) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${selectedInvoice.invoiceNumber}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: Arial, sans-serif; 
                  font-size: 11pt;
                  line-height: 1.4;
                  color: #000;
                }
                .print-container {
                  max-width: 210mm;
                  margin: 0 auto;
                  padding: 15mm;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                  border-bottom: 2px solid #000;
                }
                .brand {
                  flex: 1;
                }
                .brand h1 {
                  font-size: 18pt;
                  font-weight: bold;
                  margin-bottom: 4px;
                  color: #000;
                }
                .brand-line {
                  width: 40px;
                  height: 3px;
                  background: #000;
                  margin: 4px 0 8px 0;
                }
                .brand-info {
                  font-size: 9pt;
                  color: #555;
                  line-height: 1.5;
                }
                .invoice-title {
                  text-align: right;
                  flex: 1;
                }
                .invoice-title h2 {
                  font-size: 24pt;
                  font-weight: 300;
                  margin-bottom: 4px;
                }
                .invoice-number {
                  font-size: 12pt;
                  margin-bottom: 6px;
                }
                .status-badge {
                  display: inline-block;
                  padding: 3px 12px;
                  font-size: 8pt;
                  border-radius: 12px;
                  background: ${selectedInvoice.status === 'paid' ? '#e8f5e9' : selectedInvoice.status === 'sent' ? '#e3f2fd' : '#f5f5f5'};
                  color: ${selectedInvoice.status === 'paid' ? '#2e7d32' : selectedInvoice.status === 'sent' ? '#1976d2' : '#666'};
                }
                .invoice-details {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                }
                .bill-to, .invoice-info {
                  flex: 1;
                  padding: 12px;
                  background: #f9f9f9;
                  border-radius: 6px;
                }
                .bill-to {
                  margin-right: 15px;
                }
                .section-title {
                  font-size: 9pt;
                  font-weight: 600;
                  color: #666;
                  text-transform: uppercase;
                  margin-bottom: 8px;
                  letter-spacing: 0.5px;
                }
                .client-name {
                  font-size: 13pt;
                  font-weight: 500;
                  margin-bottom: 4px;
                }
                .detail-row {
                  font-size: 9pt;
                  color: #555;
                  margin: 3px 0;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  font-size: 9pt;
                  margin: 4px 0;
                }
                .info-label {
                  color: #666;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 15px 0;
                }
                thead tr {
                  border-bottom: 2px solid #000;
                }
                th {
                  text-align: left;
                  font-size: 9pt;
                  font-weight: 600;
                  color: #666;
                  text-transform: uppercase;
                  padding: 8px 6px;
                  letter-spacing: 0.3px;
                }
                th.center {
                  text-align: center;
                }
                th.right {
                  text-align: right;
                }
                tbody tr {
                  border-bottom: 1px solid #e0e0e0;
                }
                td {
                  padding: 10px 6px;
                  font-size: 10pt;
                  vertical-align: top;
                }
                td.center {
                  text-align: center;
                }
                td.right {
                  text-align: right;
                }
                .service-name {
                  font-weight: 500;
                  margin-bottom: 2px;
                }
                .service-desc {
                  font-size: 8pt;
                  color: #666;
                }
                .totals {
                  margin: 20px 0;
                  display: flex;
                  justify-content: flex-end;
                }
                .totals-table {
                  width: 300px;
                }
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 6px 0;
                  font-size: 10pt;
                }
                .total-row.subtotal, .total-row.tax {
                  color: #555;
                }
                .total-row.final {
                  border-top: 2px solid #000;
                  padding-top: 10px;
                  margin-top: 6px;
                  font-size: 14pt;
                  font-weight: 500;
                }
                .footer {
                  margin-top: 30px;
                  padding-top: 15px;
                  border-top: 1px solid #e0e0e0;
                  display: flex;
                  justify-content: space-between;
                }
                .footer-section {
                  flex: 1;
                }
                .footer-section:first-child {
                  margin-right: 20px;
                }
                .footer-title {
                  font-size: 10pt;
                  font-weight: 600;
                  margin-bottom: 6px;
                  color: #333;
                }
                .footer-text {
                  font-size: 9pt;
                  color: #555;
                  line-height: 1.6;
                }
                .thank-you {
                  text-align: center;
                  margin-top: 25px;
                  padding-top: 15px;
                  border-top: 1px solid #f0f0f0;
                }
                .company-footer {
                  font-size: 10pt;
                  font-weight: 600;
                  margin-bottom: 4px;
                }
                .contact-footer {
                  font-size: 8pt;
                  color: #666;
                  margin: 2px 0;
                }
                .no-print {
                  display: none !important;
                }
                @media print {
                  body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                  }
                  .print-container {
                    padding: 10mm;
                  }
                  @page {
                    margin: 10mm;
                    size: A4;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-container">
                <div class="header">
                  <div class="brand">
                    <h1>PIXELS DIGITAL SOLUTIONS</h1>
                    <div class="brand-line"></div>
                    <div class="brand-info">
                      <div>Digital Marketing & Web Solutions</div>
                      <div><strong>Email:</strong> info@pixelsdigital.tech</div>
                      <div><strong>Website:</strong> pixelsdigital.tech</div>
                    </div>
                  </div>
                  <div class="invoice-title">
                    <h2>INVOICE</h2>
                    <div class="invoice-number">${selectedInvoice.invoiceNumber}</div>
                    <span class="status-badge">${selectedInvoice.status.toUpperCase()}</span>
                  </div>
                </div>

                <div class="invoice-details">
                  <div class="bill-to">
                    <div class="section-title">Bill To:</div>
                    <div class="client-name">${selectedInvoice.clientName}</div>
                    ${selectedInvoice.clientCompany ? `<div class="detail-row">${selectedInvoice.clientCompany}</div>` : ''}
                    <div class="detail-row">${selectedInvoice.clientEmail}</div>
                    ${selectedInvoice.clientPhone ? `<div class="detail-row">${selectedInvoice.clientPhone}</div>` : ''}
                    ${selectedInvoice.clientAddress ? `<div class="detail-row" style="margin-top: 4px;">${selectedInvoice.clientAddress}</div>` : ''}
                  </div>
                  <div class="invoice-info">
                    <div class="section-title">Invoice Details:</div>
                    <div class="info-row">
                      <span class="info-label">Issue Date:</span>
                      <span>${new Date(selectedInvoice.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Due Date:</span>
                      <span>${new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    ${selectedInvoice.paidAt ? `
                    <div class="info-row">
                      <span class="info-label">Paid Date:</span>
                      <span style="color: #2e7d32;">${new Date(selectedInvoice.paidAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    ` : ''}
                    ${selectedInvoice.paymentMethod ? `
                    <div class="info-row">
                      <span class="info-label">Payment Method:</span>
                      <span>${selectedInvoice.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    ` : ''}
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th class="center" style="width: 60px;">Qty</th>
                      <th class="right" style="width: 100px;">Rate</th>
                      <th class="right" style="width: 120px;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selectedInvoice.services.map(service => `
                      <tr>
                        <td>
                          <div class="service-name">${service.name}</div>
                          ${service.description ? `<div class="service-desc">${service.description}</div>` : ''}
                        </td>
                        <td class="center">${service.quantity}</td>
                        <td class="right">₹${service.price.toLocaleString('en-IN')}</td>
                        <td class="right">₹${(service.quantity * service.price).toLocaleString('en-IN')}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>

                <div class="totals">
                  <div class="totals-table">
                    <div class="total-row subtotal">
                      <span>Subtotal:</span>
                      <span>₹${selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="total-row tax">
                      <span>Tax (GST):</span>
                      <span>₹${selectedInvoice.tax.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="total-row final">
                      <span>Total Amount:</span>
                      <span>₹${selectedInvoice.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div class="footer">
                  <div class="footer-section">
                    <div class="footer-title">Payment Details:</div>
                    <div class="footer-text">
                      <div>Bank Name: Your Bank Name</div>
                      <div>Account No: XXXX XXXX XXXX</div>
                      <div>IFSC Code: XXXXXX</div>
                      <div>UPI: pixelsdigital@upi</div>
                    </div>
                  </div>
                  <div class="footer-section">
                    <div class="footer-title">Terms & Conditions:</div>
                    <div class="footer-text">
                      <div>1. Payment is due within 30 days.</div>
                      <div>2. Late payments may incur charges.</div>
                      <div>3. Include invoice number in reference.</div>
                    </div>
                  </div>
                </div>

                <div class="thank-you">
                  <div class="company-footer">PIXELS DIGITAL SOLUTIONS</div>
                  <div class="contact-footer">info@pixelsdigital.tech | pixelsdigital.tech</div>
                  <div class="contact-footer" style="margin-top: 6px;">Thank you for your business!</div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: string, paymentInfo?: { method: string; details: string }) => {
    try {
      const body: any = { status };
      
      if (paymentInfo && status === 'paid') {
        // Record payment in payments collection
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: invoiceId,
            paymentMethod: paymentInfo.method,
            paymentDetails: paymentInfo.details,
            paymentDate: new Date().toISOString().split('T')[0],
          }),
        });
      } else {
        // Just update status for non-paid status changes
        await fetch(`/api/invoices/${invoiceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      
      fetchData();
      setSelectedInvoice(null);
      setShowPaymentModal(false);
      setPaymentData({ method: 'bank_transfer', details: '' });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Failed to update invoice status. Please try again.');
    }
  };

  const handleMarkAsPaid = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInvoice) {
      updateInvoiceStatus(selectedInvoice._id, 'paid', paymentData);
    }
  };

  const handleGeneratePaymentLink = async () => {
    if (!selectedInvoice) return;
    
    setGeneratingPaymentLink(true);
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice._id}/generate-payment-link`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.paymentLink);
        
        // Update the invoice in state
        setInvoices(invoices.map(inv => 
          inv._id === selectedInvoice._id 
            ? { ...inv, paymentLink: data.paymentLink, cashfreeOrderId: data.orderId }
            : inv
        ));
        
        // Update selected invoice
        setSelectedInvoice({
          ...selectedInvoice,
          paymentLink: data.paymentLink,
          cashfreeOrderId: data.orderId
        } as any);

        alert('Payment link generated and copied to clipboard!\n\n' + data.paymentLink);
      } else {
        alert('Failed to generate payment link: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      alert('Failed to generate payment link. Please try again.');
    } finally {
      setGeneratingPaymentLink(false);
    }
  };

  const totalRevenue = (invoices || [])
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-light text-black mb-2">Invoices</h1>
          <p className="text-gray-600 font-light">Manage invoices and track payments</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span>Create Invoice</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Invoices</p>
          <p className="text-3xl font-light text-black mt-2">{invoices?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Paid</p>
          <p className="text-3xl font-light text-green-600 mt-2">
            {invoices?.filter(inv => inv.status === 'paid').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Pending</p>
          <p className="text-3xl font-light text-blue-600 mt-2">
            {invoices?.filter(inv => inv.status === 'sent').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Cancelled</p>
          <p className="text-3xl font-light text-red-600 mt-2">
            {invoices?.filter(inv => inv.status === 'cancelled').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Revenue</p>
          <p className="text-3xl font-light text-black mt-2">₹{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Invoice #</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Client</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Issue Date</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-light">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-light">
                    No invoices yet. Create your first invoice to get started.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-light text-black">{invoice.invoiceNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-light text-black">{invoice.clientName}</p>
                      <p className="text-sm text-gray-500 font-light">{invoice.clientEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-light text-black">₹{invoice.total.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-light ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-gray-600">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-gray-600">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4"
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b border-gray-100 z-10">
              <h2 className="text-2xl font-light text-black">Create Invoice</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">Select Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-fetched Client Details */}
              {selectedClient && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">Client Details:</p>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-900 font-light">
                    <p><strong>Name:</strong> {selectedClient.name}</p>
                    <p><strong>Company:</strong> {selectedClient.company}</p>
                    <p><strong>Email:</strong> {selectedClient.email}</p>
                    <p><strong>Phone:</strong> {selectedClient.phone}</p>
                    {selectedClient.address && (
                      <p className="md:col-span-2"><strong>Address:</strong> {selectedClient.address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Issue Date *</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  />
                </div>
              </div>

              {/* Services */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm text-gray-600 font-light">Services *</label>
                  <button
                    type="button"
                    onClick={addService}
                    className="text-sm text-black hover:underline font-light"
                  >
                    + Add Service
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.services.map((service, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 font-light mb-1">Service Name *</label>
                          {service.name === 'Custom' || !defaultServices.find(s => s.name === service.name) ? (
                            <input
                              type="text"
                              placeholder="Enter custom service name"
                              value={service.name === 'Custom' ? '' : service.name}
                              onChange={(e) => updateService(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                              required
                            />
                          ) : (
                            <select
                              value={service.name}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'Custom') {
                                  updateService(index, 'name', '');
                                  updateService(index, 'price', 0);
                                  updateService(index, 'description', '');
                                } else {
                                  updateService(index, 'name', value);
                                }
                              }}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                              required
                            >
                              <option value="">Select service...</option>
                              {defaultServices.map(s => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                              ))}
                              <option value="Custom">➕ Custom Service</option>
                            </select>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 font-light mb-1">Quantity *</label>
                            <input
                              type="number"
                              placeholder="Qty"
                              value={service.quantity}
                              onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 font-light mb-1">Price (₹) *</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={service.price}
                              onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                        />
                        {formData.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-light"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600 font-light">
                          Subtotal: ₹{(service.quantity * service.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax */}
              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">Tax (%)</label>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-2">
                <div className="flex justify-between text-gray-600 font-light">
                  <span>Subtotal:</span>
                  <span>₹{formData.services.reduce((sum, s) => sum + (s.quantity * s.price), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-light">
                  <span>Tax ({formData.tax}%):</span>
                  <span>₹{((formData.services.reduce((sum, s) => sum + (s.quantity * s.price), 0) * formData.tax) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl text-black font-light pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>₹{(formData.services.reduce((sum, s) => sum + (s.quantity * s.price), 0) * (1 + formData.tax / 100)).toLocaleString()}</span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-light"
                >
                  Create Invoice (Draft)
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center font-light mt-2">
                Invoice will be created as draft. You can send it to client later.
              </p>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Invoice Modal - Professional Design */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col"
          >
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-light text-black">Invoice Preview</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-light ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedInvoice.status === 'draft' && (
                  <>
                    <button
                      onClick={() => updateInvoiceStatus(selectedInvoice._id, 'sent')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-light whitespace-nowrap"
                    >
                      ✓ Mark as Sent
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this invoice?')) {
                          updateInvoiceStatus(selectedInvoice._id, 'cancelled');
                        }
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-light whitespace-nowrap"
                    >
                      ✕ Cancel Invoice
                    </button>
                  </>
                )}
                {selectedInvoice.status === 'sent' && (
                  <>
                    <button
                      onClick={handleMarkAsPaid}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-light whitespace-nowrap"
                    >
                      ✓ Mark as Paid
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this invoice?')) {
                          updateInvoiceStatus(selectedInvoice._id, 'cancelled');
                        }
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-light whitespace-nowrap"
                    >
                      ✕ Cancel Invoice
                    </button>
                  </>
                )}
                {selectedInvoice.status === 'paid' && (
                  <div className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-light">
                    ✓ Payment Received
                  </div>
                )}
                {selectedInvoice.status === 'cancelled' && (
                  <div className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-light">
                    ✕ Cancelled
                  </div>
                )}
                <button
                  onClick={handlePrintInvoice}
                  className="px-3 py-2 bg-gray-800 hover:bg-black text-white rounded-lg flex items-center gap-2 text-xs font-light whitespace-nowrap"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-4 h-4" />
                  Print/PDF
                </button>
                <button
                  onClick={() => {
                    const subject = `Invoice ${selectedInvoice.invoiceNumber} - Pixels Digital Solutions`;
                    const body = `Dear ${selectedInvoice.clientName},\n\nPlease find attached the invoice ${selectedInvoice.invoiceNumber} for the amount of ₹${selectedInvoice.total.toLocaleString('en-IN')}.\n\nDue Date: ${new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}\n\nFor any queries, please contact us at info@pixelsdigital.tech\n\nBest regards,\nPixels Digital Solutions\npixelsdigital.tech`;
                    window.location.href = `mailto:${selectedInvoice.clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 text-xs font-light whitespace-nowrap"
                  title="Send Email to Client"
                >
                  <Mail className="w-4 h-4" />
                  Email Client
                </button>
                {/* Generate Payment Link Button - Available for all statuses except cancelled */}
                {selectedInvoice.status !== 'cancelled' && (
                  <button
                    onClick={handleGeneratePaymentLink}
                    disabled={generatingPaymentLink}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-xs font-light whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Generate payment link with Cashfree"
                  >
                    <IndianRupee className="w-4 h-4" />
                    {generatingPaymentLink ? 'Generating...' : 'Generate Payment Link'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Professional Invoice Template - Scrollable */}
            <div className="overflow-y-auto flex-1">
              <div ref={invoiceRef} className="p-6 md:p-8 bg-white">
              {/* Header with Logo */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                  {/* Brand Name */}
                  <div className="mb-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">PIXELS DIGITAL SOLUTIONS</h1>
                    <div className="h-1 w-16 bg-black mb-2"></div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 font-light mb-1">Digital Marketing & Web Solutions</p>
                  <p className="text-xs md:text-sm text-gray-600 font-light mb-1">
                    <span className="font-medium">Email:</span> info@pixelsdigital.tech
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 font-light">
                    <span className="font-medium">Website:</span> pixelsdigital.tech
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <h1 className="text-3xl md:text-4xl font-light text-black mb-2">INVOICE</h1>
                  <p className="text-base md:text-lg font-light text-black">{selectedInvoice.invoiceNumber}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-light mt-2 ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Bill To & Invoice Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">Bill To:</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-base md:text-lg font-light text-black mb-1">{selectedInvoice.clientName}</p>
                    {selectedInvoice.clientCompany && (
                      <p className="text-xs md:text-sm text-gray-600 font-light mb-1">{selectedInvoice.clientCompany}</p>
                    )}
                    <p className="text-xs md:text-sm text-gray-600 font-light">{selectedInvoice.clientEmail}</p>
                    {selectedInvoice.clientPhone && (
                      <p className="text-xs md:text-sm text-gray-600 font-light">{selectedInvoice.clientPhone}</p>
                    )}
                    {selectedInvoice.clientAddress && (
                      <p className="text-xs md:text-sm text-gray-600 font-light mt-1">{selectedInvoice.clientAddress}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">Invoice Details:</h3>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs md:text-sm text-gray-600 font-light">Issue Date:</span>
                      <span className="text-xs md:text-sm font-light text-black">{new Date(selectedInvoice.issueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs md:text-sm text-gray-600 font-light">Due Date:</span>
                      <span className="text-xs md:text-sm font-light text-black">{new Date(selectedInvoice.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    {selectedInvoice.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-xs md:text-sm text-gray-600 font-light">Paid Date:</span>
                        <span className="text-xs md:text-sm font-light text-green-600">{new Date(selectedInvoice.paidAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                    {selectedInvoice.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-xs md:text-sm text-gray-600 font-light">Payment Method:</span>
                        <span className="text-xs md:text-sm font-light text-black capitalize">{selectedInvoice.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    )}
                    {selectedInvoice.paymentDetails && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-xs text-gray-600 font-light mb-1">Payment Details:</p>
                        <p className="text-xs text-gray-700 font-light">{selectedInvoice.paymentDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div className="mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-black">
                        <th className="text-left py-2 text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide">Description</th>
                        <th className="text-center py-2 text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide w-16">Qty</th>
                        <th className="text-right py-2 text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide w-24">Rate</th>
                        <th className="text-right py-2 text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.services.map((service, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-3">
                            <p className="font-light text-black text-xs md:text-sm">{service.name}</p>
                            {service.description && (
                              <p className="text-xs text-gray-600 font-light mt-0.5">{service.description}</p>
                            )}
                          </td>
                          <td className="text-center font-light text-gray-700 text-xs md:text-sm">{service.quantity}</td>
                          <td className="text-right font-light text-gray-700 text-xs md:text-sm">₹{service.price.toLocaleString('en-IN')}</td>
                          <td className="text-right font-light text-black text-xs md:text-sm">₹{(service.quantity * service.price).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Section */}
              <div className="flex justify-end mb-8">
                <div className="w-full md:w-80">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-600 font-light text-xs md:text-sm">Subtotal:</span>
                      <span className="font-light text-black text-xs md:text-sm">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-600 font-light text-xs md:text-sm">Tax (GST):</span>
                      <span className="font-light text-black text-xs md:text-sm">₹{selectedInvoice.tax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t-2 border-black">
                      <span className="text-lg md:text-xl font-light text-black">Total Amount:</span>
                      <span className="text-xl md:text-2xl font-light text-black">₹{selectedInvoice.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-8 mt-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Payment Details:</h4>
                    <p className="text-sm text-gray-600 font-light">Bank Name: Your Bank Name</p>
                    <p className="text-sm text-gray-600 font-light">Account No: XXXX XXXX XXXX</p>
                    <p className="text-sm text-gray-600 font-light">IFSC Code: XXXXXX</p>
                    <p className="text-sm text-gray-600 font-light">UPI: pixelsdigital@upi</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Terms & Conditions:</h4>
                    <p className="text-xs text-gray-600 font-light">1. Payment is due within 30 days of invoice date.</p>
                    <p className="text-xs text-gray-600 font-light">2. Late payments may incur additional charges.</p>
                    <p className="text-xs text-gray-600 font-light">3. Please include invoice number in payment reference.</p>
                  </div>
                </div>
                <div className="text-center mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm font-medium text-black mb-1">PIXELS DIGITAL SOLUTIONS</p>
                  <p className="text-xs text-gray-500 font-light">info@pixelsdigital.tech | pixelsdigital.tech</p>
                  <p className="text-xs text-gray-500 font-light mt-2">Thank you for your business!</p>
                </div>
              </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-light text-black">Record Payment</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentData({ method: 'bank_transfer', details: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Invoice Amount
                </label>
                <div className="text-2xl font-light text-black">
                  ₹{selectedInvoice.total.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
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
                  value={paymentData.details}
                  onChange={(e) => setPaymentData({ ...paymentData, details: e.target.value })}
                  placeholder="Enter transaction ID, reference number, or any additional details..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentData({ method: 'bank_transfer', details: '' });
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-light"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
