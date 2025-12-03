'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FolderKanban,
  X,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  IndianRupee,
  Upload,
  FileText,
  Download,
  Lock,
  Unlock,
} from 'lucide-react';
import WorkSubmissionsList from '@/components/WorkSubmissionsList';

interface Client {
  _id: string;
  name: string;
  company: string;
  email: string;
}

interface Project {
  _id: string;
  clientId: string;
  clientName?: string;
  projectName: string;
  projectType: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'on-hold';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  milestones: Array<{
    name: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    dueDate: string;
    amount?: number;
    paymentStatus?: 'unpaid' | 'paid';
    paidAt?: string;
    fileUrl?: string;
    fileKey?: string;
    fileName?: string;
    fileSize?: number;
    uploadedAt?: string;
  }>;
  tasks: Array<{
    name: string;
    completed: boolean;
  }>;
  createdAt: string;
}

const projectTypes = [
  'Website Development',
  'E-commerce Development',
  'Mobile App Development',
  'SEO Services',
  'Social Media Marketing',
  'Content Marketing',
  'Video Production',
  'Graphic Design',
  'Branding',
  'Other',
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: number]: boolean }>({});

  const [formData, setFormData] = useState({
    clientId: '',
    projectName: '',
    projectType: '',
    description: '',
    status: 'planning' as Project['status'],
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    budget: 0,
    milestones: [] as Array<{ 
      name: string;
      description?: string;
      status: 'pending' | 'in-progress' | 'completed'; 
      dueDate: string;
      amount?: number;
      paymentStatus?: 'unpaid' | 'paid';
      paidAt?: string;
      fileUrl?: string;
      fileKey?: string;
      fileName?: string;
      fileSize?: number;
      uploadedAt?: string;
    }>,
    tasks: [] as Array<{ name: string; completed: boolean }>,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Note: This fetches ALL projects (admin view)
      // We need to modify the API to support admin fetching
      const [projectsRes, clientsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/clients'),
      ]);

      const projectsData = await projectsRes.json();
      const clientsData = await clientsRes.json();

      // Match client names to projects
      const projectsWithClientNames = projectsData.map((p: Project) => {
        const client = clientsData.find((c: Client) => c._id === p.clientId);
        return { ...p, clientName: client ? `${client.name} (${client.company})` : 'Unknown Client' };
      });

      setProjects(projectsWithClientNames);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
      const method = editingProject ? 'PATCH' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setShowAddModal(false);
      setEditingProject(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      clientId: project.clientId,
      projectName: project.projectName,
      projectType: project.projectType,
      description: project.description,
      status: project.status,
      progress: project.progress,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      budget: project.budget,
      milestones: project.milestones || [],
      tasks: project.tasks || [],
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      projectName: '',
      projectType: '',
      description: '',
      status: 'planning',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: 0,
      milestones: [],
      tasks: [],
    });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [
        ...formData.milestones,
        { 
          name: '', 
          description: '', 
          status: 'pending', 
          dueDate: new Date().toISOString().split('T')[0],
          amount: 0,
          paymentStatus: 'unpaid'
        },
      ],
    });
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index),
    });
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...formData.milestones];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, milestones: updated });
  };

  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return;

    // Validate file size on frontend too
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(`File too large! Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Validate file type on frontend
    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      alert(`Invalid file type! Allowed: PDF, Word, Excel, Images, Text.\nYour file: ${file.name}`);
      return;
    }

    setUploadingFiles({ ...uploadingFiles, [index]: true });

    try {
      console.log('Step 1: Requesting presigned URL for:', {
        name: file.name,
        type: file.type,
        size: file.size,
        extension: fileExtension
      });

      // Step 1: Get presigned URL from our API
      const urlResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      const urlData = await urlResponse.json();
      console.log('Presigned URL response:', urlData);

      if (!urlData.success) {
        console.error('Failed to get presigned URL:', urlData);
        alert(`Failed to prepare upload: ${urlData.error || 'Unknown error'}`);
        return;
      }

      console.log('Step 2: Uploading directly to S3...');

      // Step 2: Upload directly to S3 using presigned URL
      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      console.log('S3 upload response:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        ok: uploadResponse.ok
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 upload failed:', errorText);
        alert(`Failed to upload to S3: ${uploadResponse.statusText}`);
        return;
      }

      console.log('Upload successful! Updating milestone...');

      // Step 3: Update milestone with file info
      const updated = [...formData.milestones];
      updated[index] = {
        ...updated[index],
        fileUrl: urlData.fileUrl,
        fileKey: urlData.fileKey,
        fileName: urlData.fileName,
        fileSize: urlData.fileSize,
        uploadedAt: new Date().toISOString(),
      };
      setFormData({ ...formData, milestones: updated });
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setUploadingFiles({ ...uploadingFiles, [index]: false });
    }
  };

  const removeFile = (index: number) => {
    const updated = [...formData.milestones];
    delete updated[index].fileUrl;
    delete updated[index].fileKey;
    delete updated[index].fileName;
    delete updated[index].fileSize;
    delete updated[index].uploadedAt;
    setFormData({ ...formData, milestones: updated });
  };

  const addTask = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, { name: '', completed: false }],
    });
  };

  const removeTask = (index: number) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index),
    });
  };

  const updateTask = (index: number, field: string, value: any) => {
    const updated = [...formData.tasks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, tasks: updated });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      planning: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      review: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      'on-hold': 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'in-progress') return <Clock className="w-4 h-4" />;
    if (status === 'on-hold') return <AlertCircle className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-light text-black mb-2">Project Management</h1>
          <p className="text-gray-600 font-light">Manage client projects and track progress</p>
        </div>
        <motion.button
          onClick={() => {
            setEditingProject(null);
            resetForm();
            setShowAddModal(true);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-2 font-light"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} />
          <span>New Project</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Projects</p>
          <p className="text-3xl font-light text-black mt-2">{projects.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Active Projects</p>
          <p className="text-3xl font-light text-yellow-600 mt-2">{activeProjects}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Completed</p>
          <p className="text-3xl font-light text-green-600 mt-2">{completedProjects}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 font-light">Total Budget</p>
          <p className="text-3xl font-light text-black mt-2">₹{totalBudget.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-center py-8 text-gray-500 font-light">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-light">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.map((project) => (
              <div
                key={project._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-light text-black">{project.projectName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-light flex items-center gap-1 ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-light mb-1">{project.clientName}</p>
                    <p className="text-sm text-gray-700 font-light mb-3">{project.projectType}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-600 font-light">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.startDate).toLocaleDateString('en-IN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {project.progress}% Complete
                      </div>
                      {project.budget > 0 && (
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          ₹{project.budget.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowViewModal(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Project Modal - Will continue in next part */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-light text-black">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProject(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} - {client.company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    placeholder="e.g., E-commerce Website"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Project Type *</label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  >
                    <option value="">Select type...</option>
                    {projectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-600 font-light mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light resize-none"
                  rows={3}
                  placeholder="Brief project description..."
                  required
                />
              </div>

              {/* Status and Progress */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Progress (%) *</label>
                  <input
                    type="number"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 font-light mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black font-light"
                    required
                  />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm text-gray-600 font-light">Milestones</label>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="text-sm text-black hover:underline font-light"
                  >
                    + Add Milestone
                  </button>
                </div>
                {formData.milestones.length > 0 && (
                  <div className="space-y-4">
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-xl space-y-3">
                        <div className="grid md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Milestone name"
                            value={milestone.name}
                            onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                          />
                          <select
                            value={milestone.status}
                            onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <input
                            type="date"
                            value={milestone.dueDate}
                            onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                          />
                        </div>

                        {/* Description Field */}
                        <div>
                          <textarea
                            placeholder="Milestone description (optional)"
                            value={milestone.description || ''}
                            onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm resize-none"
                            rows={2}
                          />
                        </div>

                        {/* Amount Field */}
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 font-light mb-1">
                              Amount (₹) - Leave 0 for free access
                            </label>
                            <input
                              type="number"
                              placeholder="Milestone amount"
                              value={milestone.amount || 0}
                              onChange={(e) => updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 font-light mb-1">
                              Payment Status
                            </label>
                            <select
                              value={milestone.paymentStatus || 'unpaid'}
                              onChange={(e) => updateMilestone(index, 'paymentStatus', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-black font-light text-sm"
                            >
                              <option value="unpaid">Unpaid (Locked)</option>
                              <option value="paid">Paid (Unlocked)</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* File Upload Section */}
                        <div className="border-t border-gray-200 pt-3">
                          <label className="block text-xs text-gray-600 font-light mb-2">
                            Attach Document (Report, PDF, etc.)
                          </label>
                          {milestone.fileUrl ? (
                            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                              <FileText className="w-4 h-4 text-green-600" />
                              <div className="flex-1">
                                <p className="text-sm font-light text-gray-700">{milestone.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {milestone.fileSize ? `${(milestone.fileSize / 1024).toFixed(1)} KB` : ''}
                                </p>
                              </div>
                              <a
                                href={milestone.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-green-50 rounded"
                                title="Download"
                              >
                                <Download className="w-4 h-4 text-green-600" />
                              </a>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-red-50 rounded text-red-600"
                                title="Remove file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(index, file);
                                }}
                                className="hidden"
                                id={`file-upload-${index}`}
                                disabled={uploadingFiles[index]}
                              />
                              <label
                                htmlFor={`file-upload-${index}`}
                                className={`flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-black transition-colors text-sm font-light ${
                                  uploadingFiles[index] ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {uploadingFiles[index] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                                    <span className="text-gray-600">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 text-gray-600" />
                                    <span className="text-gray-600">Choose file to upload</span>
                                  </>
                                )}
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                PDF, Word, Excel, Images (max 10MB)
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeMilestone(index)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm font-light"
                          >
                            Remove Milestone
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-900 rounded-xl font-light"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Project Modal */}
      {showViewModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-light text-black mb-2">{selectedProject.projectName}</h2>
                <p className="text-gray-600 font-light">{selectedProject.clientName}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-light flex items-center gap-2 ${getStatusColor(selectedProject.status)}`}>
                  {getStatusIcon(selectedProject.status)}
                  {selectedProject.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-2xl font-light text-black">{selectedProject.progress}% Complete</span>
              </div>

              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500"
                  style={{ width: `${selectedProject.progress}%` }}
                ></div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Description</h3>
                <p className="text-gray-700 font-light">{selectedProject.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Project Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Type:</span> <span className="font-light">{selectedProject.projectType}</span></p>
                    <p><span className="text-gray-600">Start Date:</span> <span className="font-light">{new Date(selectedProject.startDate).toLocaleDateString('en-IN')}</span></p>
                    <p><span className="text-gray-600">End Date:</span> <span className="font-light">{new Date(selectedProject.endDate).toLocaleDateString('en-IN')}</span></p>
                    {selectedProject.budget > 0 && (
                      <p><span className="text-gray-600">Budget:</span> <span className="font-light">₹{selectedProject.budget.toLocaleString('en-IN')}</span></p>
                    )}
                  </div>
                </div>

                {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Milestones</h3>
                    <div className="space-y-3">
                      {selectedProject.milestones.map((milestone, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {milestone.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : milestone.status === 'in-progress' ? (
                                <Clock className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                              )}
                              <span className="font-light text-sm">{milestone.name}</span>
                              
                              {/* Payment Status Badge */}
                              {milestone.amount && milestone.amount > 0 && (
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-light flex items-center gap-1 ${
                                  milestone.paymentStatus === 'paid' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {milestone.paymentStatus === 'paid' ? (
                                    <>
                                      <Unlock className="w-3 h-3" />
                                      Paid ₹{milestone.amount.toLocaleString('en-IN')}
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3 h-3" />
                                      ₹{milestone.amount.toLocaleString('en-IN')}
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(milestone.dueDate).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          {milestone.description && (
                            <p className="text-xs text-gray-600 font-light mt-1 mb-2">
                              {milestone.description}
                            </p>
                          )}
                          {milestone.fileUrl && (
                            <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-light text-gray-700 flex-1">
                                {milestone.fileName}
                              </span>
                              <a
                                href={milestone.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-blue-50 rounded transition-colors"
                                title="Download attachment"
                              >
                                <Download className="w-4 h-4 text-blue-600" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Client Work Submissions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Work Submissions</h3>
                <WorkSubmissionsList projectId={selectedProject._id} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
