'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
  assignedClients: string[];
  isActive: boolean;
  createdAt: string;
}

interface Client {
  _id: string;
  name: string;
}

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'content-creator',
    assignedClients: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchStaff();
    fetchClients();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleOpenModal = (staff?: Staff) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        email: staff.email,
        password: '',
        role: staff.role,
        assignedClients: staff.assignedClients || [],
        isActive: staff.isActive,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'content-creator',
        assignedClients: [],
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingStaff ? '/api/staff' : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';
      
      // Prepare body - remove empty password on update
      let body: any;
      if (editingStaff) {
        body = { id: editingStaff._id, ...formData };
        // Don't send password if it's empty (keeping existing password)
        if (!formData.password) {
          delete body.password;
        }
      } else {
        body = formData;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchStaff();
        handleCloseModal();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save staff');
      }
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const response = await fetch(`/api/staff?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStaff();
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const toggleClientAssignment = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedClients: prev.assignedClients.includes(clientId)
        ? prev.assignedClients.filter(id => id !== clientId)
        : [...prev.assignedClients, clientId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Staff Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage staff members and their client assignments
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Staff
        </button>
      </div>

      <div className="ta-table-container">
        {staff.length === 0 ? (
          <div className="px-4 py-8 text-center text-text-muted">
            No staff members found. Add one to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="ta-table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Assigned Clients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
              {staff.map((member) => (
                <motion.tr key={member._id} className="ta-table-row">
                  <td className="ta-table-td whitespace-nowrap text-sm font-medium text-text-primary">
                    {member.name}
                  </td>
                  <td className="ta-table-td whitespace-nowrap text-sm text-text-muted">
                    {member.email}
                  </td>
                  <td className="ta-table-td whitespace-nowrap text-sm text-text-primary capitalize">
                    {member.role}
                  </td>
                  <td className="ta-table-td whitespace-nowrap text-sm text-text-muted">
                    {member.assignedClients?.length || 0} clients
                  </td>
                  <td className="ta-table-td whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.isActive
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="ta-table-td whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenModal(member)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                  </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

            <div className="relative ta-modal-content transform transition-all sm:my-8 sm:max-w-lg w-full z-50">
              <form onSubmit={handleSubmit}>
                <div className="ta-modal-content p-6">
                  <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full border ta-input py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full border ta-input py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary">
                        Password {editingStaff && '(leave blank to keep current)'}
                      </label>
                      <input
                        type="password"
                        required={!editingStaff}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 block w-full border ta-input py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary">
                        Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="mt-1 block w-full border ta-input py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="content-creator">Content Creator</option>
                        <option value="video-editor">Video Editor</option>
                        <option value="graphic-designer">Graphic Designer</option>
                        <option value="manager">Manager</option>
                        <option value="social-media-manager">Social Media Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Assign Clients
                      </label>
                      <div className="max-h-40 overflow-y-auto border-border rounded-md p-2">
                        {clients.length === 0 ? (
                          <p className="text-sm text-text-muted">No clients available</p>
                        ) : (
                          clients.map((client) => (
                            <label key={client._id} className="flex items-center py-1">
                              <input
                                type="checkbox"
                                checked={formData.assignedClients.includes(client._id)}
                                onChange={() => toggleClientAssignment(client._id)}
                                className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                              />
                              <span className="ml-2 text-sm text-text-primary">{client.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                      <label className="ml-2 block text-sm text-text-primary">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-surface/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl border-t border-border mt-6">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ta-btn-primary sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingStaff ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border-border shadow-sm px-4 py-2 bg-surface/30 text-base font-medium text-text-primary hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
