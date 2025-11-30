'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Phone, Building, Edit, Trash2, X, Calendar } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry?: string;
  address?: string;
  totalRevenue: number;
  projectsCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingClient
        ? `/api/clients/${editingClient._id}`
        : '/api/clients';
      const method = editingClient ? 'PATCH' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setShowAddModal(false);
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        industry: '',
        address: '',
        status: 'active',
      });
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      industry: client.industry || '',
      address: client.address || '',
      status: client.status,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await fetch(`/api/clients/${clientId}`, { method: 'DELETE' });
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-light text-black mb-2">Clients Management</h1>
          <p className="text-gray-600 font-light">Manage your client relationships and details</p>
        </div>
        <motion.button
          onClick={() => {
            setEditingClient(null);
            setFormData({
              name: '',
              email: '',
              phone: '',
              company: '',
              industry: '',
              address: '',
              status: 'active',
            });
            setShowAddModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span>Add Client</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Clients</p>
          <p className="text-3xl font-light text-black mt-2">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Active Clients</p>
          <p className="text-3xl font-light text-black mt-2">
            {clients.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Revenue</p>
          <p className="text-3xl font-light text-black mt-2">
            ₹{clients.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500 font-light">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 font-light">
            No clients yet. Add your first client to get started.
          </div>
        ) : (
          clients.map((client) => (
            <motion.div
              key={client._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-black transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-light text-black mb-1">{client.name}</h3>
                  <p className="text-sm text-gray-600 font-light flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {client.company}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-light ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 font-light flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {client.email}
                </p>
                <p className="text-sm text-gray-600 font-light flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </p>
                {client.industry && (
                  <p className="text-sm text-gray-600 font-light">
                    Industry: {client.industry}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 font-light">Projects</p>
                  <p className="text-lg font-light text-black">{client.projectsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-light">Revenue</p>
                  <p className="text-lg font-light text-black">₹{client.totalRevenue.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-light">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(client._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-light">Delete</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-black">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingClient(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingClient(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-light transition-colors"
                >
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
