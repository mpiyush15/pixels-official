'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building, Mail, Phone, Edit, Trash2, X, Globe, User, MapPin } from 'lucide-react';

interface Vendor {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  website: string;
  contactPerson: string;
  address: string;
  status: 'active' | 'inactive';
  totalPaid: number;
  createdAt: string;
}

const categories = [
  { value: 'hosting', label: 'Hosting' },
  { value: 'domain', label: 'Domain' },
  { value: 'internet', label: 'Internet/ISP' },
  { value: 'social_media', label: 'Social Media Services' },
  { value: 'communication', label: 'Communication (WhatsApp, Calls)' },
  { value: 'software', label: 'Software/SaaS' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'other', label: 'Other' },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    category: 'hosting',
    description: '',
    website: '',
    contactPerson: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      const data = await res.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingVendor ? `/api/vendors/${editingVendor._id}` : '/api/vendors';
    const method = editingVendor ? 'PATCH' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setShowModal(false);
      setEditingVendor(null);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        category: 'hosting',
        description: '',
        website: '',
        contactPerson: '',
        address: '',
        status: 'active',
      });
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      company: vendor.company,
      email: vendor.email,
      phone: vendor.phone,
      category: vendor.category,
      description: vendor.description,
      website: vendor.website,
      contactPerson: vendor.contactPerson,
      address: vendor.address,
      status: vendor.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vendor? This will not affect associated expenses.')) return;

    try {
      await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      hosting: 'bg-blue-100 text-blue-700',
      domain: 'bg-purple-100 text-purple-700',
      internet: 'bg-green-100 text-green-700',
      social_media: 'bg-pink-100 text-pink-700',
      communication: 'bg-orange-100 text-orange-700',
      software: 'bg-indigo-100 text-indigo-700',
      utilities: 'bg-yellow-100 text-yellow-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light text-black">Vendors</h1>
          <p className="text-gray-600 font-light mt-1">
            Manage hosting, domains, and service providers
          </p>
        </div>
        <button
          onClick={() => {
            setEditingVendor(null);
            setFormData({
              name: '',
              company: '',
              email: '',
              phone: '',
              category: 'hosting',
              description: '',
              website: '',
              contactPerson: '',
              address: '',
              status: 'active',
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" />
          Add Vendor
        </button>
      </div>

      {/* Vendors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <motion.div
            key={vendor._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 border rounded-2xl hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-light text-black">{vendor.name}</h3>
                {vendor.company && (
                  <p className="text-sm text-gray-600 font-light flex items-center gap-1 mt-1">
                    <Building className="w-4 h-4" />
                    {vendor.company}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-light ${
                  vendor.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {vendor.status}
              </span>
            </div>

            <span className={`inline-block px-3 py-1 rounded-full text-xs font-light mb-4 ${getCategoryColor(vendor.category)}`}>
              {categories.find((c) => c.value === vendor.category)?.label || vendor.category}
            </span>

            {vendor.description && (
              <p className="text-sm text-gray-600 font-light mb-4 line-clamp-2">
                {vendor.description}
              </p>
            )}

            <div className="space-y-2 text-sm mb-4">
              {vendor.email && (
                <p className="flex items-center gap-2 text-gray-600 font-light">
                  <Mail className="w-4 h-4" />
                  {vendor.email}
                </p>
              )}
              {vendor.phone && (
                <p className="flex items-center gap-2 text-gray-600 font-light">
                  <Phone className="w-4 h-4" />
                  {vendor.phone}
                </p>
              )}
              {vendor.website && (
                <p className="flex items-center gap-2 text-gray-600 font-light">
                  <Globe className="w-4 h-4" />
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    {vendor.website.replace(/^https?:\/\//, '')}
                  </a>
                </p>
              )}
              {vendor.contactPerson && (
                <p className="flex items-center gap-2 text-gray-600 font-light">
                  <User className="w-4 h-4" />
                  {vendor.contactPerson}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 mb-4">
              <p className="text-sm text-gray-500 font-light">Total Paid</p>
              <p className="text-2xl font-light text-black">₹{vendor.totalPaid.toLocaleString()}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(vendor)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center gap-2 font-light text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(vendor._id)}
                className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl font-light text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {vendors.length === 0 && (
        <div className="text-center py-16">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-light">No vendors yet. Add your first vendor!</p>
        </div>
      )}

      {/* Add/Edit Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-light text-black">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingVendor(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                    placeholder="e.g., Namecheap, Meta Business"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                    placeholder="vendor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                    placeholder="https://vendor.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                    placeholder="Account manager name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                  placeholder="Brief description of services provided..."
                />
              </div>

              <div>
                <label className="block text-sm font-light text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent font-light"
                  placeholder="Full address"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVendor(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-light"
                >
                  {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
