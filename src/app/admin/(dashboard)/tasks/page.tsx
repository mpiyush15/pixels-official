'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Calendar, User, FileText, 
  CheckCircle, Clock, AlertCircle, X, Edit, Trash2 
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  projectName?: string;
  clientName: string;
  assignedToName: string;
  assignedToRole: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'submitted' | 'approved' | 'revision-needed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
}

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Client {
  _id: string;
  name: string;
  company: string;
}

interface Project {
  _id: string;
  projectName: string;
  clientName: string;
  clientId: string;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    projectName: '',
    clientId: '',
    clientName: '',
    assignedTo: '',
    assignedToName: '',
    assignedToRole: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchStaff();
    fetchClients();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.filter((s: Staff) => s.role !== 'admin'));
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
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

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.clientId || !formData.assignedTo || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTasks();
        setShowModal(false);
        resetForm();
        alert('Task created successfully!');
      } else {
        alert('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTasks();
      } else {
        alert('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      projectId: '',
      projectName: '',
      clientId: '',
      clientName: '',
      assignedTo: '',
      assignedToName: '',
      assignedToRole: '',
      priority: 'medium',
      dueDate: '',
    });
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c._id === clientId);
    setFormData({
      ...formData,
      clientId,
      clientName: client?.name || '',
      projectId: '',
      projectName: '',
    });
  };

  const handleProjectChange = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    setFormData({
      ...formData,
      projectId,
      projectName: project?.projectName || '',
    });
  };

  const handleStaffChange = (staffId: string) => {
    const staffMember = staff.find(s => s._id === staffId);
    setFormData({
      ...formData,
      assignedTo: staffId,
      assignedToName: staffMember?.name || '',
      assignedToRole: staffMember?.role || '',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      submitted: 'bg-purple-100 text-purple-700',
      approved: 'bg-emerald-100 text-emerald-700',
      'revision-needed': 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-text-primary';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-text-muted',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-text-muted';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedToName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskStats = {
    total: tasks.length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    submitted: tasks.filter(t => t.status === 'submitted').length,
  };

  return (
    <div className="p-8 bg-background min-h-[calc(100vh-8rem)] rounded-2xl">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium text-text-primary">Task Management</h1>
          <p className="mt-1 text-sm text-text-muted">
            Assign and manage tasks for your team
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary text-background rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted">Total Tasks</p>
              <p className="text-2xl font-medium text-text-primary">{taskStats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-text-muted" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Assigned</p>
              <p className="text-2xl font-medium text-blue-700">{taskStats.assigned}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">In Progress</p>
              <p className="text-2xl font-medium text-yellow-700">{taskStats.inProgress}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background rounded-lg shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Submitted</p>
              <p className="text-2xl font-medium text-purple-700">{taskStats.submitted}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="ta-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:border-primary focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:border-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="revision-needed">Revision Needed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:border-primary focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="ta-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
              <thead className="ta-table-header">
                <tr>
                  <th className="ta-table-th uppercase">
                    Task
                  </th>
                  <th className="ta-table-th uppercase">
                    Client/Project
                  </th>
                  <th className="ta-table-th uppercase">
                    Assigned To
                  </th>
                  <th className="ta-table-th uppercase">
                    Status
                  </th>
                  <th className="ta-table-th uppercase">
                    Priority
                  </th>
                  <th className="ta-table-th uppercase">
                    Due Date
                  </th>
                  <th className="ta-table-th uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <AnimatePresence mode="popLayout">
                  {filteredTasks.length === 0 && !loading ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={7} className="ta-table-td text-center py-8 text-text-muted">
                        No tasks found matching your filters.
                      </td>
                    </motion.tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <motion.tr 
                        key={task._id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-b border-border hover:bg-surface"
                      >
                        <td className="ta-table-td">
                          <div>
                            <div className="font-medium text-text-primary">{task.title}</div>
                            <div className="text-sm text-text-muted line-clamp-1">{task.description}</div>
                          </div>
                        </td>
                        <td className="ta-table-td">
                          <div className="text-sm text-text-primary">{task.clientName}</div>
                          {task.projectName && (
                            <div className="text-sm text-text-muted">{task.projectName}</div>
                          )}
                        </td>
                        <td className="ta-table-td">
                          <div className="text-sm text-text-primary">{task.assignedToName}</div>
                          <div className="text-sm text-text-muted capitalize">
                            {task.assignedToRole.replace('-', ' ')}
                          </div>
                        </td>
                        <td className="ta-table-td">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(task.status)}`}>
                            {task.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="ta-table-td">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="ta-table-td text-sm font-medium text-text-primary">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </td>
                        <td className="ta-table-td">
                          <div className="flex items-center space-x-2">
                            <a
                              href={`/admin/tasks/${task._id}`}
                              className="text-text-muted hover:text-text-primary font-medium text-sm transition-colors"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-5 w-5" />
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

      {/* Create Task Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-background border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-medium text-text-primary">Create New Task</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-text-muted hover:text-text-muted"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="ta-input w-full"
                      placeholder="e.g., Create social media graphics"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="ta-input w-full"
                      placeholder="Describe the task requirements..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Client *
                      </label>
                      <select
                        required
                        value={formData.clientId}
                        onChange={(e) => handleClientChange(e.target.value)}
                        className="ta-input w-full"
                      >
                        <option value="">Select Client</option>
                        {clients.map(client => (
                          <option key={client._id} value={client._id}>
                            {client.name} - {client.company}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Project (Optional)
                      </label>
                      <select
                        value={formData.projectId}
                        onChange={(e) => handleProjectChange(e.target.value)}
                        disabled={!formData.clientId}
                        className="ta-input w-full disabled:opacity-50"
                      >
                        <option value="">Select Project</option>
                        {projects
                          .filter(p => p.clientId === formData.clientId)
                          .map(project => (
                            <option key={project._id} value={project._id}>
                              {project.projectName}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Assign To *
                    </label>
                    <select
                      required
                      value={formData.assignedTo}
                      onChange={(e) => handleStaffChange(e.target.value)}
                      className="ta-input w-full"
                    >
                      <option value="">Select Staff Member</option>
                      {staff.map(member => (
                        <option key={member._id} value={member._id}>
                          {member.name} - {member.role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Priority *
                      </label>
                      <select
                        required
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="ta-input w-full"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="ta-input w-full"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-border text-text-primary rounded-lg hover:bg-surface"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ta-btn-primary"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
