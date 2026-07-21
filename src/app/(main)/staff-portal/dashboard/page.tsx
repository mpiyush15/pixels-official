'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, FileText, Calendar, User, LogOut, ArrowRight } from 'lucide-react';
import StaffTopBar from '@/components/StaffTopBar';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  projectName?: string;
  clientName: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'submitted' | 'approved' | 'revision-needed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  createdAt: string;
}

export default function StaffDashboardPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'in-progress' | 'completed' | 'submitted'>('all');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/staff-auth/session');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/staff-portal/login');
        return;
      }

      setStaff(data.staff);
      await fetchTasks();
    } catch (error) {
      router.push('/staff-portal/login');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/staff/tasks');
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

  const handleLogout = async () => {
    await fetch('/api/staff-auth/logout', { method: 'POST' });
    router.push('/staff-portal/login');
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(task => task.status === filter);

  const taskStats = {
    total: tasks.length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    submitted: tasks.filter(t => t.status === 'submitted').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {staff && <StaffTopBar staffName={staff.name} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{taskStats.total}</p>
              </div>
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-blue-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Assigned</p>
                <p className="text-3xl font-bold text-blue-700 mt-2">{taskStats.assigned}</p>
              </div>
              <Clock className="h-10 w-10 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-yellow-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-700 mt-2">{taskStats.inProgress}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-yellow-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-3xl font-bold text-green-700 mt-2">{taskStats.completed}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-purple-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Submitted</p>
                <p className="text-3xl font-bold text-purple-700 mt-2">{taskStats.submitted}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-purple-400" />
            </div>
          </motion.div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tasks ({taskStats.total})
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'assigned'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Assigned ({taskStats.assigned})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'in-progress'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress ({taskStats.inProgress})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({taskStats.completed})
            </button>
            <button
              onClick={() => setFilter('submitted')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'submitted'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Submitted ({taskStats.submitted})
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
            <p className="text-sm text-gray-600 mt-1">
              {staff && `Role: ${staff.role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
            </p>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No tasks found</p>
              <p className="text-gray-400 text-sm mt-2">
                {filter === 'all' ? 'You have no tasks assigned yet' : `No ${filter.replace('-', ' ')} tasks`}
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
                        <div className={`mt-1 ${getStatusColor(task.status)} p-2 rounded-lg`}>
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          <p className="text-gray-600 mt-1">{task.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-1.5" />
                              {task.clientName}
                            </div>
                            {task.projectName && (
                              <div className="flex items-center text-sm text-gray-600">
                                <FileText className="h-4 w-4 mr-1.5" />
                                {task.projectName}
                              </div>
                            )}
                            <div className={`flex items-center text-sm ${isOverdue(task.dueDate) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                              <Calendar className="h-4 w-4 mr-1.5" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                              {isOverdue(task.dueDate) && ' (Overdue)'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/staff-portal/tasks/${task._id}`}
                      className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
