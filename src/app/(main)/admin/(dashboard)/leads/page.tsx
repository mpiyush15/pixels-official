'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Calendar, Trash2, Eye, X, UserPlus } from 'lucide-react';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  industry?: string;
  role?: string;
  companySize?: string;
  message?: string;
  projectDescription?: string;
  projectGoals?: string;
  currentChallenges?: string;
  requiredFeatures?: string;
  timeline?: string;
  estimatedBudget?: string;
  preferredStartDate?: string;
  existingWebsite?: string;
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
      case 'new': return 'bg-blue-500/10 text-blue-500';
      case 'contacted': return 'bg-orange-500/10 text-orange-500';
      case 'converted': return 'bg-emerald-500/10 text-emerald-500';
      case 'closed': return 'bg-gray-100 text-text-primary';
      default: return 'bg-gray-100 text-text-primary';
    }
  };

  return (
    <div className="p-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-medium text-text-primary mb-2">Leads Management</h1>
        <p className="text-text-muted font-medium">Manage and track all your leads from the website</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['new', 'contacted', 'converted', 'closed'].map((status) => (
          <div key={status} className="ta-card">
            <p className="text-sm text-text-muted font-medium capitalize">{status}</p>
            <p className="text-2xl font-medium text-text-primary mt-1">
              {leads.filter(l => l.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Leads Table */}
      <div className="ta-table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="ta-table-header">
              <tr>
                <th className="ta-table-th uppercase">Name</th>
                <th className="ta-table-th uppercase">Contact</th>
                <th className="ta-table-th uppercase">Source</th>
                <th className="ta-table-th uppercase">Status</th>
                <th className="ta-table-th uppercase">Date</th>
                <th className="ta-table-th uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted font-medium">
                      Loading leads...
                    </td>
                  </motion.tr>
                ) : leads.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted font-medium">
                      No leads yet
                    </td>
                  </motion.tr>
                ) : (
                  leads.map((lead) => (
                    <motion.tr 
                      key={lead._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b border-border hover:bg-surface"
                    >
                      <td className="ta-table-td">
                        <p className="font-medium text-text-primary">{lead.name}</p>
                      </td>
                      <td className="ta-table-td">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </p>
                          {lead.phone && (
                            <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {lead.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="ta-table-td">
                        <span className="text-sm font-medium text-text-muted">{lead.source}</span>
                      </td>
                      <td className="ta-table-td">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead._id, e.target.value)}
                          className={`ta-input !py-1 !px-3 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="ta-table-td">
                        <span className="text-sm font-medium text-text-muted flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="ta-table-td">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-text-muted" />
                          </button>
                          {lead.status !== 'converted' && (
                            <button
                              onClick={() => convertToClient(lead._id)}
                              className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Convert to Client"
                            >
                              <UserPlus className="w-4 h-4 text-emerald-500" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteLead(lead._id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
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
            className="ta-card max-w-2xl w-full p-8"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-medium text-text-primary">Lead Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-surface rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-text-muted font-medium">Name</label>
                  <p className="text-lg font-medium text-text-primary">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="text-sm text-text-muted font-medium">Email</label>
                  <p className="text-lg font-medium text-text-primary">{selectedLead.email}</p>
                </div>
                {selectedLead.phone && (
                  <div>
                    <label className="text-sm text-text-muted font-medium">Phone</label>
                    <p className="text-lg font-medium text-text-primary">{selectedLead.phone}</p>
                  </div>
                )}
                {selectedLead.companyName && (
                  <div>
                    <label className="text-sm text-text-muted font-medium">Company Name</label>
                    <p className="text-lg font-medium text-text-primary">{selectedLead.companyName}</p>
                  </div>
                )}
                {selectedLead.role && (
                  <div>
                    <label className="text-sm text-text-muted font-medium">Role</label>
                    <p className="text-lg font-medium text-text-primary">{selectedLead.role}</p>
                  </div>
                )}
                {selectedLead.industry && (
                  <div>
                    <label className="text-sm text-text-muted font-medium">Industry</label>
                    <p className="text-lg font-medium text-text-primary">{selectedLead.industry}</p>
                  </div>
                )}
                {selectedLead.companySize && (
                  <div>
                    <label className="text-sm text-text-muted font-medium">Company Size</label>
                    <p className="text-lg font-medium text-text-primary">{selectedLead.companySize}</p>
                  </div>
                )}
                {selectedLead.timeline && (
                  <div>
                    <label className="text-sm text-text-muted font-medium">Expected Timeline</label>
                    <p className="text-lg font-medium text-text-primary">{selectedLead.timeline}</p>
                  </div>
                )}
                {selectedLead.estimatedBudget && (
                  <div>
                    <label className="text-sm text-text-muted font-medium">Estimated Budget</label>
                    <p className="text-lg font-medium text-text-primary">{selectedLead.estimatedBudget}</p>
                  </div>
                )}
                {selectedLead.preferredStartDate && (
                  <div>
                    <label className="text-sm text-text-muted font-medium">Preferred Start Date</label>
                    <p className="text-lg font-medium text-text-primary">{selectedLead.preferredStartDate}</p>
                  </div>
                )}
                {selectedLead.existingWebsite && (
                  <div className="col-span-2">
                    <label className="text-sm text-text-muted font-medium">Existing Website</label>
                    <p className="text-lg font-medium text-text-primary">
                      <a href={selectedLead.existingWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {selectedLead.existingWebsite}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {(selectedLead.projectDescription || selectedLead.message) && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="text-sm text-text-muted font-medium">Project Description</label>
                  <p className="text-base font-medium text-text-primary mt-1 whitespace-pre-wrap">{selectedLead.projectDescription || selectedLead.message}</p>
                </div>
              )}

              {selectedLead.projectGoals && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="text-sm text-text-muted font-medium">Project Goals</label>
                  <p className="text-base font-medium text-text-primary mt-1 whitespace-pre-wrap">{selectedLead.projectGoals}</p>
                </div>
              )}

              {selectedLead.currentChallenges && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="text-sm text-text-muted font-medium">Current Challenges</label>
                  <p className="text-base font-medium text-text-primary mt-1 whitespace-pre-wrap">{selectedLead.currentChallenges}</p>
                </div>
              )}

              {selectedLead.requiredFeatures && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="text-sm text-text-muted font-medium">Required Features</label>
                  <p className="text-base font-medium text-text-primary mt-1 whitespace-pre-wrap">{selectedLead.requiredFeatures}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="text-sm text-text-muted font-medium">Source</label>
                  <p className="text-lg font-medium text-text-primary">{selectedLead.source}</p>
                </div>
                <div>
                  <label className="text-sm text-text-muted font-medium">Date</label>
                  <p className="text-lg font-medium text-text-primary">
                    {new Date(selectedLead.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {selectedLead.status !== 'converted' && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    convertToClient(selectedLead._id);
                    setSelectedLead(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Convert to Client
                </button>
              </div>
            )}

            {selectedLead.status === 'converted' && (
              <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-500 font-medium text-center">
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
