'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, Trash2, Eye, X, UserPlus } from 'lucide-react';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const convertToClient = async (leadId: string) => {
    if (!confirm('Are you sure you want to convert this lead to a client?')) return;

    try {
      const response = await fetch('/api/leads/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Lead converted to client successfully!');
        fetchLeads();
      } else {
        alert(data.error || 'Failed to convert lead');
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead to client');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'contacted': return 'bg-yellow-100 text-yellow-700';
      case 'converted': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-black mb-2">Leads Management</h1>
        <p className="text-gray-600 font-light">Manage and track all your leads from the website</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['new', 'contacted', 'converted', 'closed'].map((status) => (
          <div key={status} className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-sm text-gray-600 font-light capitalize">{status}</p>
            <p className="text-2xl font-light text-black mt-1">
              {leads.filter(l => l.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Name</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Source</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-light text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-light">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-light">
                    No leads yet
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-light text-black">{lead.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-light text-gray-600 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </p>
                        {lead.phone && (
                          <p className="text-sm font-light text-gray-600 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-gray-600">{lead.source}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-light ${getStatusColor(lead.status)}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-light text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {lead.status !== 'converted' && (
                          <button
                            onClick={() => convertToClient(lead._id)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Convert to Client"
                          >
                            <UserPlus className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteLead(lead._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-light text-black">Lead Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-light">Name</label>
                <p className="text-lg font-light text-black">{selectedLead.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-light">Email</label>
                <p className="text-lg font-light text-black">{selectedLead.email}</p>
              </div>
              {selectedLead.phone && (
                <div>
                  <label className="text-sm text-gray-600 font-light">Phone</label>
                  <p className="text-lg font-light text-black">{selectedLead.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-600 font-light">Message</label>
                <p className="text-base font-light text-black mt-1">{selectedLead.message}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-light">Source</label>
                <p className="text-lg font-light text-black">{selectedLead.source}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-light">Date</label>
                <p className="text-lg font-light text-black">
                  {new Date(selectedLead.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedLead.status !== 'converted' && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    convertToClient(selectedLead._id);
                    setSelectedLead(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-light transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Convert to Client
                </button>
              </div>
            )}

            {selectedLead.status === 'converted' && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 font-light text-center">
                  ✓ This lead has been converted to a client
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
