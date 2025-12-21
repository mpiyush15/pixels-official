'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, TrendingUp, BarChart3, Download } from 'lucide-react';
import StaffTopBar from '@/components/StaffTopBar';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface WorkSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  approvedTasks: number;
  weeklyStats: {
    week: string;
    completed: number;
    approved: number;
  }[];
  monthlyStats: {
    month: string;
    completed: number;
    approved: number;
  }[];
}

export default function WorkSummaryPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'weekly' | 'monthly'>('monthly');
  const [summary, setSummary] = useState<WorkSummary>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    approvedTasks: 0,
    weeklyStats: [],
    monthlyStats: [],
  });

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
      await fetchWorkSummary();
    } catch (error) {
      router.push('/staff-portal/login');
    }
  };

  const fetchWorkSummary = async () => {
    try {
      const response = await fetch('/api/staff/work-summary');
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching work summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    // Generate CSV report
    const csvData = view === 'monthly'
      ? summary.monthlyStats.map(s => `${s.month},${s.completed},${s.approved}`).join('\n')
      : summary.weeklyStats.map(s => `${s.week},${s.completed},${s.approved}`).join('\n');
    
    const csv = `Period,Completed Tasks,Approved Tasks\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-summary-${view}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const stats = view === 'monthly' ? summary.monthlyStats : summary.weeklyStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {staff && <StaffTopBar staffName={staff.name} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <span>Work Summary</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Track your work performance and task completion statistics
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalTasks}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-yellow-700 mt-2">{summary.inProgressTasks}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-700 mt-2">{summary.completedTasks}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-purple-700 mt-2">{summary.approvedTasks}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-400" />
            </div>
          </motion.div>
        </div>

        {/* View Toggle & Download */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'weekly'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weekly View
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'monthly'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly View
            </button>
          </div>

          <button
            onClick={downloadReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Download Report</span>
          </button>
        </div>

        {/* Statistics Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              <span>{view === 'monthly' ? 'Monthly' : 'Weekly'} Performance</span>
            </h2>
          </div>

          {stats.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No data available yet</p>
              <p className="text-gray-400 text-sm mt-2">Complete tasks to see your performance stats</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat, index) => {
                    const period = 'month' in stat ? stat.month : stat.week;
                    const successRate = stat.completed > 0 
                      ? Math.round((stat.approved / stat.completed) * 100) 
                      : 0;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                            {stat.completed}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                            {stat.approved}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full"
                                style={{ width: `${successRate}%` }}
                              />
                            </div>
                            <span className="font-semibold">{successRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Calculation Info */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Payment Calculation</span>
          </h3>
          <p className="text-gray-700 mb-4">
            Your monthly payment is calculated based on approved tasks. Only tasks that have been reviewed and approved by the admin count towards your payment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-700">{summary.approvedTasks} Tasks</p>
              <p className="text-xs text-gray-500 mt-1">Approved & Payable</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-green-700">
                {summary.completedTasks > 0 
                  ? Math.round((summary.approvedTasks / summary.completedTasks) * 100) 
                  : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Approved vs Completed</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">View Details</p>
              <button
                onClick={() => router.push('/staff-portal/payments')}
                className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Go to Payments →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
