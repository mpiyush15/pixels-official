'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Search, Calendar, Eye, X, Edit, Trash2 } from 'lucide-react';

interface Receivable {
  _id: string;
  clientName: string;
  projectId?: string;
  projectName?: string;
  description: string;
  amount: number;
  expectedDate: string;
  status: 'expected' | 'invoiced' | 'received' | 'delayed';
  type: 'milestone' | 'retainer' | 'deposit' | 'other';
  notes?: string;
}

interface Project {
  _id: string;
  name: string;
  clientName: string;
}

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    clientName: '',
    projectId: '',
    projectName: '',
    description: '',
    amount: 0,
    expectedDate: new Date().toISOString().split('T')[0],
    status: 'expected' as const,
    type: 'milestone' as const,
    notes: '',
  });

  useEffect(() => {
    fetchReceivables();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchReceivables = async () => {
    try {
      const response = await fetch('/api/receivables');
      const data = await response.json();
      setReceivables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching receivables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/receivables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setShowAddModal(false);
      setFormData({
        clientName: '',
        projectId: '',
        projectName: '',
        description: '',
        amount: 0,
        expectedDate: new Date().toISOString().split('T')[0],
        status: 'expected',
        type: 'milestone',
        notes: '',
      });
      fetchReceivables();
    } catch (error) {
      console.error('Error saving receivable:', error);
      alert('Failed to save receivable.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-700';
      case 'expected': return 'bg-blue-100 text-blue-700';
      case 'invoiced': return 'bg-purple-100 text-purple-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredReceivables = receivables.filter(r => 
    r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpected = filteredReceivables.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-light text-black mb-2 flex items-center gap-3">
            <TrendingUp className="text-emerald-500 w-8 h-8" />
            Receivables Pipeline
          </h1>
          <p className="text-gray-600 font-light">Track expected incoming funds before they are invoiced.</p>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span>Add Receivable</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8 w-fit min-w-[300px]">
        <p className="text-sm text-gray-600 font-light mb-1">Total Expected Pipeline</p>
        <p className="text-4xl font-bold text-emerald-600">
          ₹{totalExpected.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light text-sm"
            />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Expected Date</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Client</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : filteredReceivables.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No receivables found.</td></tr>
            ) : (
              filteredReceivables.map((r) => (
                <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(r.expectedDate).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {r.clientName}
                    {r.projectName && <div className="text-xs text-indigo-600 mt-1">{r.projectName}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">{r.type}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">₹{r.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-black">Add Receivable</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Client Name *</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Link Project (Optional)</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => {
                      const projectId = e.target.value;
                      const project = projects.find(p => p._id === projectId);
                      setFormData({
                        ...formData,
                        projectId,
                        projectName: project ? project.name : '',
                        clientName: project ? project.clientName : formData.clientName, // Auto-fill client
                      });
                    }}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                  >
                    <option value="">-- No Project --</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Website Final Milestone"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Expected Date *</label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                  >
                    <option value="milestone">Milestone</option>
                    <option value="retainer">Retainer</option>
                    <option value="deposit">Deposit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-black outline-none"
                  >
                    <option value="expected">Expected</option>
                    <option value="invoiced">Invoiced</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium"
              >
                Save Receivable
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
