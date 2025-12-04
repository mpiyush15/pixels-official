"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  X,
  Calendar,
  FileText,
  Send,
  Eye,
  UserCheck,
  UserX,
  Key,
  Lock
} from "lucide-react";

// ----------------------------
// INTERFACES
// ----------------------------
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
  status: "active" | "inactive";
  createdAt: string;
  portalAccessEnabled?: boolean;
  clientType?: "development" | "other"; // New field
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: string;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  issueDate: string;
  dueDate: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [passwordClient, setPasswordClient] = useState<Client | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [sendingWelcomeEmail, setSendingWelcomeEmail] = useState<string | null>(null);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    address: "",
    status: "active" as "active" | "inactive",
    clientType: "development" as "development" | "other"
  };

  const [formData, setFormData] = useState(emptyForm);

  // ----------------------------
  // FETCHING FUNCTIONS
  // ----------------------------

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchClients(), fetchInvoices()]);
      setLoading(false);
    })();
  }, []);

  // ----------------------------
  // FORM SUBMIT
  // ----------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingClient ? `/api/clients/${editingClient._id}` : "/api/clients";
    const method = editingClient ? "PATCH" : "POST";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      setShowAddModal(false);
      setEditingClient(null);
      setFormData(emptyForm);
      fetchClients();
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  // ----------------------------
  // EDIT / VIEW / DELETE
  // ----------------------------

  const handleEdit = (c: Client) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      industry: c.industry || "",
      address: c.address || "",
      status: c.status,
      clientType: c.clientType || "development"
    });
    setShowAddModal(true);
  };

  const handleView = (c: Client) => {
    setViewingClient(c);
    const invs = invoices.filter((i) => i.clientId === c._id);
    setClientInvoices(invs);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client?")) return;

    try {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const sendWelcomeEmail = async (client: Client) => {
    if (!client.email) {
      alert("This client has no email address");
      return;
    }

    try {
      setSendingWelcomeEmail(client._id);
      const response = await fetch(
        `/api/test-welcome-email?email=${encodeURIComponent(client.email)}&name=${encodeURIComponent(client.name)}`
      );
      const result = await response.json();
      
      if (result.success) {
        alert("Welcome email sent successfully!");
      } else {
        alert("Failed to send email: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error sending welcome email:", error);
      alert("Failed to send welcome email");
    } finally {
      setSendingWelcomeEmail(null);
    }
  };

  const toggleClientStatus = async (client: Client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    
    if (!confirm(`Mark ${client.name} as ${newStatus}?`)) return;

    try {
      await fetch(`/api/clients/${client._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchClients();
    } catch (err) {
      console.error("Error updating client status:", err);
    }
  };

  const sendInvoiceEmail = (invoice: Invoice) => {
    alert(
      `Email integration soon.\nInvoice: ${invoice.invoiceNumber}\nTo: ${viewingClient?.email}`
    );
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (!passwordClient) return;

    try {
      const res = await fetch(`/api/clients/${passwordClient._id}/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        alert(`Portal access enabled for ${passwordClient.name}!\n\nLogin Details:\nEmail: ${passwordClient.email}\nPassword: (as set)\n\nClient Portal: ${window.location.origin}/client-portal/login`);
        setShowPasswordModal(false);
        setPassword("");
        setConfirmPassword("");
        setPasswordClient(null);
        fetchClients();
      } else {
        const data = await res.json();
        setPasswordError(data.error || "Failed to set password");
      }
    } catch (err) {
      console.error("Error setting password:", err);
      setPasswordError("Failed to set password");
    }
  };

  const openPasswordModal = (client: Client) => {
    setPasswordClient(client);
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const statusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "sent":
        return "bg-blue-100 text-blue-700";
      case "paid":
        return "bg-green-100 text-green-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ----------------------------
  // RENDER
  // ----------------------------

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-light">Clients Management</h1>
          <p className="text-gray-600 font-light">
            Manage all client details & billing
          </p>
        </div>

        <motion.button
          onClick={() => {
            setEditingClient(null);
            setFormData(emptyForm);
            setShowAddModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          className="px-6 py-3 bg-black text-white rounded-xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </motion.button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 border">
          <p className="text-gray-500 text-sm">Total Clients</p>
          <p className="text-3xl mt-2">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <p className="text-gray-500 text-sm">Active Clients</p>
          <p className="text-3xl mt-2">
            {clients.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl mt-2">
            ₹
            {clients
              .reduce((sum, c) => sum + c.totalRevenue, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* CLIENT CARDS */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : clients.length === 0 ? (
        <p className="text-center text-gray-500">No clients yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <motion.div
              key={client._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 border rounded-2xl"
            >
              {/* CARD HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl">{client.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {client.company}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    client.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {client.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 border-t pt-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Projects</p>
                  <p className="text-lg">{client.projectsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-lg">
                    ₹{client.totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* PORTAL ACCESS STATUS */}
              {client.portalAccessEnabled && (
                <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Portal Access Enabled</span>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleView(client)}
                  className="flex-1 min-w-[80px] bg-black text-white py-2 rounded-xl flex items-center justify-center gap-1 text-sm"
                >
                  <Eye className="w-4" /> View
                </button>
                <button
                  onClick={() => openPasswordModal(client)}
                  className={`p-2 rounded-xl ${
                    client.portalAccessEnabled
                      ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  title={client.portalAccessEnabled ? 'Reset Portal Password' : 'Enable Portal Access'}
                >
                  <Key className="w-4" />
                </button>
                <button
                  onClick={() => sendWelcomeEmail(client)}
                  disabled={!client.email || sendingWelcomeEmail === client._id}
                  className="p-2 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send Welcome Email"
                >
                  <Send className="w-4" />
                </button>
                <button
                  onClick={() => toggleClientStatus(client)}
                  className={`p-2 rounded-xl ${
                    client.status === 'active' 
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                  title={client.status === 'active' ? 'Mark as Inactive' : 'Mark as Active'}
                >
                  {client.status === 'active' ? (
                    <UserX className="w-4" />
                  ) : (
                    <UserCheck className="w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  <Edit className="w-4" />
                </button>
                <button
                  onClick={() => handleDelete(client._id)}
                  className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200"
                >
                  <Trash2 className="w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ADD/EDIT CLIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-black">
                {editingClient ? "Edit Client" : "Add New Client"}
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
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData({ ...formData, industry: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Client Type
                  </label>
                  <select
                    value={formData.clientType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clientType: e.target.value as "development" | "other"
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                  >
                    <option value="development">Development Client</option>
                    <option value="other">Other Services</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "inactive"
                      })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
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
                  {editingClient ? "Update Client" : "Add Client"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* VIEW CLIENT DETAILS MODAL */}
      {showViewModal && viewingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-light text-black mb-2">
                  {viewingClient.name}
                </h2>
                <p className="text-gray-600 font-light flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {viewingClient.company}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-light">Email</p>
                  <p className="text-lg font-light flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {viewingClient.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light">Phone</p>
                  <p className="text-lg font-light flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {viewingClient.phone}
                  </p>
                </div>
                {viewingClient.industry && (
                  <div>
                    <p className="text-sm text-gray-600 font-light">Industry</p>
                    <p className="text-lg font-light">{viewingClient.industry}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-light">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-light ${
                      viewingClient.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {viewingClient.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light">Total Revenue</p>
                  <p className="text-2xl font-light">
                    ₹{viewingClient.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-light">Projects</p>
                  <p className="text-2xl font-light">
                    {viewingClient.projectsCount}
                  </p>
                </div>
              </div>
            </div>

            {viewingClient.address && (
              <div className="mb-8">
                <p className="text-sm text-gray-600 font-light mb-2">Address</p>
                <p className="text-gray-800 font-light">{viewingClient.address}</p>
              </div>
            )}

            {/* Invoices Section */}
            <div>
              <h3 className="text-xl font-light mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoices ({clientInvoices.length})
              </h3>

              {clientInvoices.length === 0 ? (
                <p className="text-center text-gray-500 py-8 font-light">
                  No invoices for this client yet
                </p>
              ) : (
                <div className="space-y-3">
                  {clientInvoices.map((invoice) => (
                    <div
                      key={invoice._id}
                      className="bg-gray-50 p-4 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-light text-lg">
                            {invoice.invoiceNumber}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-light ${statusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 font-light">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Issue: {new Date(invoice.issueDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right mr-4">
                        <p className="text-2xl font-light">
                          ₹{invoice.total.toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => sendInvoiceEmail(invoice)}
                        className="px-4 py-2 bg-black text-white rounded-xl flex items-center gap-2 hover:bg-gray-900 transition-colors"
                        title="Send invoice via email"
                      >
                        <Send className="w-4 h-4" />
                        <span className="font-light">Send</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500 font-light">
                Member since {new Date(viewingClient.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* SET PASSWORD MODAL */}
      {showPasswordModal && passwordClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-light text-black mb-1">
                  {passwordClient.portalAccessEnabled ? "Reset" : "Enable"} Portal Access
                </h2>
                <p className="text-sm text-gray-600">
                  {passwordClient.name} • {passwordClient.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordClient(null);
                  setPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors font-light"
                  required
                />
              </div>

              {passwordError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-light">{passwordError}</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-blue-800 font-light mb-2">
                  <strong>Login Credentials:</strong>
                </p>
                <p className="text-sm text-blue-700 font-light">
                  Email: {passwordClient.email}<br />
                  Portal: {window.location.origin}/client-portal/login
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordClient(null);
                    setPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-light transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {passwordClient.portalAccessEnabled ? "Reset Password" : "Enable Access"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
