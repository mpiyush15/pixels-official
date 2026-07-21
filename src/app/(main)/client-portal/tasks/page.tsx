'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Calendar, User, CheckCircle, Clock, 
  AlertCircle, Filter, Search 
} from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  projectName?: string;
  assignedToName: string;
  assignedToRole: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'submitted' | 'approved' | 'revision-needed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  submittedDate?: string;
  approvedDate?: string;
  createdAt: string;
}

export default function ClientTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/client-portal/tasks');
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

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-700 border-blue-200',
      'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      submitted: 'bg-purple-100 text-purple-700 border-purple-200',
      approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'revision-needed': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <FileText className="h-5 w-5" />;
      case 'in-progress':
        return <Clock className="h-5 w-5" />;
      case 'completed':
      case 'submitted':
      case 'approved':
        return <CheckCircle className="h-5 w-5" />;
      case 'revision-needed':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedToName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const taskStats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    submitted: tasks.filter(t => t.status === 'submitted').length,
    approved: tasks.filter(t => t.status === 'approved').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-1 text-sm text-gray-600">
          View tasks assigned by our team for your projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-4 border border-yellow-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-700">{taskStats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-4 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Submitted</p>
              <p className="text-2xl font-bold text-purple-700">{taskStats.submitted}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-4 border border-emerald-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Completed</p>
              <p className="text-2xl font-bold text-emerald-700">{taskStats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="revision-needed">Revision Needed</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-400 text-sm mt-2">
              {statusFilter === 'all' ? 'No tasks have been assigned yet' : `No ${statusFilter.replace('-', ' ')} tasks`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 ${getStatusColor(task.status)} p-2 rounded-lg border`}>
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1.5" />
                            <span>{task.assignedToName}</span>
                            <span className="ml-2 text-gray-400 capitalize">({task.assignedToRole.replace('-', ' ')})</span>
                          </div>
                          {task.projectName && (
                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="h-4 w-4 mr-1.5" />
                              {task.projectName}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-1.5" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                            {task.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>

                        {/* Additional Info */}
                        {task.submittedDate && (
                          <p className="text-sm text-gray-500 mt-2">
                            Submitted: {new Date(task.submittedDate).toLocaleDateString()}
                          </p>
                        )}
                        {task.approvedDate && (
                          <p className="text-sm text-emerald-600 font-semibold mt-2">
                            ✓ Approved: {new Date(task.approvedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
