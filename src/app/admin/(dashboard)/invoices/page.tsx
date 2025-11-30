'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Download, Eye, X, Calendar, IndianRupee } from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  services: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

const defaultServices = [
  { name: 'Website Development', price: 50000 },
  { name: 'E-commerce Website', price: 75000 },
  { name: 'Social Media Marketing (Monthly)', price: 15000 },
  { name: 'SEO Services (Monthly)', price: 12000 },
  { name: 'Video Content Creation', price: 8000 },
  { name: 'Corporate Video', price: 25000 },
  { name: 'Graphic Design', price: 5000 },
  { name: 'Logo Design', price: 10000 },
  { name: 'Brand Identity Package', price: 30000 },
  { name: 'Content Writing', price: 3000 },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
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

  const fetchData = async () => {
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/clients'),
      ]);
      const invoicesData = await invoicesRes.json();
      const clientsData = await clientsRes.json();
      setInvoices(invoicesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClient = clients.find(c => c._id === formData.clientId);
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
    setFormData({ ...formData, services: updatedServices });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalRevenue = invoices
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Invoices</p>
          <p className="text-3xl font-light text-black mt-2">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Paid</p>
          <p className="text-3xl font-light text-green-600 mt-2">
            {invoices.filter(inv => inv.status === 'paid').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Pending</p>
          <p className="text-3xl font-light text-blue-600 mt-2">
            {invoices.filter(inv => inv.status === 'sent').length}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8"
          >
            <div className="flex justify-between items-center mb-6">
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
                          <select
                            value={service.name}
                            onChange={(e) => {
                              const selected = defaultServices.find(s => s.name === e.target.value);
                              updateService(index, 'name', e.target.value);
                              if (selected) {
                                updateService(index, 'price', selected.price);
                              }
                            }}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                            required
                          >
                            <option value="">Select service...</option>
                            {defaultServices.map(s => (
                              <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                            <option value="Custom">Custom Service</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={service.quantity}
                            onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                            min="1"
                            required
                          />
                          <input
                            type="number"
                            placeholder="Price"
                            value={service.price}
                            onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                            min="0"
                            required
                          />
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
                  Create Invoice
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-light text-black mb-2">Invoice {selectedInvoice.invoiceNumber}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-light ${getStatusColor(selectedInvoice.status)}`}>
                  {selectedInvoice.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Info */}
            <div className="mb-8">
              <h3 className="text-sm text-gray-600 font-light mb-2">Bill To:</h3>
              <p className="text-lg font-light text-black">{selectedInvoice.clientName}</p>
              <p className="text-gray-600 font-light">{selectedInvoice.clientEmail}</p>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-sm text-gray-600 font-light">Issue Date</p>
                <p className="text-lg font-light text-black">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-light">Due Date</p>
                <p className="text-lg font-light text-black">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Services */}
            <div className="mb-8">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 text-sm font-light text-gray-600">Service</th>
                    <th className="text-right py-3 text-sm font-light text-gray-600">Qty</th>
                    <th className="text-right py-3 text-sm font-light text-gray-600">Price</th>
                    <th className="text-right py-3 text-sm font-light text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.services.map((service, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3">
                        <p className="font-light text-black">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 font-light">{service.description}</p>
                        )}
                      </td>
                      <td className="text-right font-light">{service.quantity}</td>
                      <td className="text-right font-light">₹{service.price.toLocaleString()}</td>
                      <td className="text-right font-light">₹{(service.quantity * service.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-2">
              <div className="flex justify-between text-gray-600 font-light">
                <span>Subtotal:</span>
                <span>₹{selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-light">
                <span>Tax:</span>
                <span>₹{selectedInvoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-2xl text-black font-light pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>₹{selectedInvoice.total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
