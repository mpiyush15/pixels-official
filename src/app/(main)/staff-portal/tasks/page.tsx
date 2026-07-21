'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, FileText, Calendar, User, ArrowRight, Filter } from 'lucide-react';
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

export default function StaffTasksPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (staff) {
      fetchTasks();
    }
  }, [staff, statusFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/staff-auth/session');
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/staff-portal/login');
        return;
      }

      setStaff(data.staff);
    } catch (error) {
      router.push('/staff-portal/login');
    }
  };

  const fetchTasks = async () => {
    try {
      const url = statusFilter === 'all' 
        ? '/api/staff/tasks'
        : `/api/staff/tasks?status=${statusFilter}`;
      
      const response = await fetch(url);
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = priorityFilter === 'all' 
    ? tasks 
    : tasks.filter(task => task.priority === priorityFilter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {staff && <StaffTopBar staffName={staff.name} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-2">
            Manage and track all your assigned tasks
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No tasks found</p>
              <p className="text-gray-400 text-sm mt-2">
                {statusFilter === 'all' 
                  ? 'You have no tasks assigned yet' 
                  : `No ${statusFilter.replace('-', ' ')} tasks`}
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
                          <p className="text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                          
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
                            <div className={`flex items-center text-sm ${
                              isOverdue(task.dueDate) && task.status !== 'approved' && task.status !== 'submitted'
                                ? 'text-red-600 font-semibold' 
                                : 'text-gray-600'
                            }`}>
                              <Calendar className="h-4 w-4 mr-1.5" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                              {isOverdue(task.dueDate) && task.status !== 'approved' && task.status !== 'submitted' && ' (Overdue)'}
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

        {/* Summary Stats */}
        {filteredTasks.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredTasks.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {filteredTasks.filter(t => 
                  isOverdue(t.dueDate) && 
                  t.status !== 'approved' && 
                  t.status !== 'submitted'
                ).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {filteredTasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {filteredTasks.filter(t => 
                  t.status === 'completed' || 
                  t.status === 'submitted' || 
                  t.status === 'approved'
                ).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
