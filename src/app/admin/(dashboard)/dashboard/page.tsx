'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Mail,
  FileText,
  IndianRupee,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Clock,
  FolderKanban,
  DollarSign,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  Globe,
  ExternalLink,
} from 'lucide-react';
import AnalyticsWidget from '@/components/AnalyticsWidget';
import Link from 'next/link';

interface Stats {
  // Revenue metrics
  totalRevenue: number;
  currentMonthRevenue: number;
  totalDues: number;
  overdueAmount: number;
  draftValue: number;
  
  // Invoice counts
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  
  // Business metrics
  totalClients: number;
  activeProjects: number;
  totalProjects: number;
  totalProjectsRevenue: number;
  totalLeads: number;
  
  // Changes
  revenueChange: number;
}

interface Project {
  _id: string;
  projectName: string;
  clientName?: string;
  status: string;
  progress: number;
  budget: number;
  milestones: Array<{
    name: string;
    status: string;
    dueDate: string;
    amount?: number;
  }>;
}

type DateFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    currentMonthRevenue: 0,
    totalDues: 0,
    overdueAmount: 0,
    draftValue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
    draftInvoices: 0,
    totalClients: 0,
    activeProjects: 0,
    totalProjects: 0,
    totalProjectsRevenue: 0,
    totalLeads: 0,
    revenueChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [showTraffic, setShowTraffic] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchProjects();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.filter((p: Project) => p.status === 'in-progress' || p.status === 'review'));
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Projects Revenue',
      value: `₹${stats.totalProjectsRevenue.toLocaleString('en-IN')}`,
      subtitle: `${stats.totalProjects} total projects`,
      icon: FolderKanban,
      change: 0,
      color: 'purple',
    },
    {
      title: 'This Month Revenue',
      value: `₹${stats.currentMonthRevenue.toLocaleString('en-IN')}`,
      subtitle: 'Current month',
      icon: TrendingUp,
      change: stats.revenueChange,
      color: 'blue',
    },
    {
      title: 'Outstanding Dues',
      value: `₹${stats.totalDues.toLocaleString('en-IN')}`,
      subtitle: `${stats.unpaidInvoices} unpaid invoices`,
      icon: Clock,
      change: 0,
      color: 'orange',
    },
    {
      title: 'Overdue Payments',
      value: `₹${stats.overdueAmount.toLocaleString('en-IN')}`,
      subtitle: `${stats.overdueInvoices} overdue invoices`,
      icon: AlertCircle,
      change: 0,
      color: 'red',
    },
  ];

  const dateFilters: { label: string; value: DateFilter }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header with Date Filter */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-light text-black mb-2">Business Dashboard</h1>
          <p className="text-gray-600 font-light">Revenue, payments, and key business metrics</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          {dateFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setDateFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-light transition-colors ${
                dateFilter === filter.value
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-6 border-2 ${
                stat.color === 'green' ? 'border-green-200 bg-green-50' :
                stat.color === 'red' ? 'border-red-200 bg-red-50' :
                stat.color === 'orange' ? 'border-orange-200 bg-orange-50' :
                stat.color === 'purple' ? 'border-purple-200 bg-purple-50' :
                'border-blue-200 bg-blue-50'
              } hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'red' ? 'bg-red-100' :
                  stat.color === 'orange' ? 'bg-orange-100' :
                  stat.color === 'purple' ? 'bg-purple-100' :
                  'bg-blue-100'
                } flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'orange' ? 'text-orange-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    'text-blue-600'
                  }`} strokeWidth={1.5} />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-light text-black mb-1">
                {loading ? '...' : stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 font-light">{stat.subtitle}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Active Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-black flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Active Projects ({projects.length})
          </h2>
          <Link 
            href="/admin/projects"
            className="text-sm text-blue-600 hover:text-blue-700 font-light flex items-center gap-1"
          >
            View All <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8 font-light">No active projects</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const inProgressMilestones = project.milestones?.filter(m => m.status === 'in-progress') || [];
              
              return (
                <Link
                  key={project._id}
                  href={`/admin/projects?view=${project._id}`}
                  className="block border border-gray-200 rounded-xl p-4 hover:border-black hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-black hover:text-blue-600 transition-colors">
                        {project.projectName}
                      </h3>
                      <p className="text-sm text-gray-500 font-light">{project.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-light text-black">₹{project.budget.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500">{project.progress}% Complete</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* In Progress Milestones */}
                  {inProgressMilestones.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-xs font-medium text-yellow-700 mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        In Progress Milestones ({inProgressMilestones.length})
                      </p>
                      <div className="space-y-2">
                        {inProgressMilestones.slice(0, 3).map((milestone, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-light">• {milestone.name}</span>
                            <div className="flex items-center gap-2">
                              {milestone.amount && milestone.amount > 0 && (
                                <span className="text-xs text-gray-600">₹{milestone.amount.toLocaleString('en-IN')}</span>
                              )}
                              <span className="text-xs text-gray-500">
                                Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Website Traffic Section - Collapsible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 mb-6"
      >
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className="w-full flex items-center justify-between text-xl font-light text-black mb-4"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Website Traffic Analytics
          </div>
          {showTraffic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {showTraffic && (
          <div className="pt-4 border-t border-gray-200">
            <AnalyticsWidget days={7} />
          </div>
        )}
      </motion.div>

      {/* Quick Stats Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-light text-black">Total Clients</h3>
          </div>
          <p className="text-3xl font-light text-black">{loading ? '...' : stats.totalClients}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-light text-black">Draft Invoices</h3>
          </div>
          <p className="text-3xl font-light text-black">
            {loading ? '...' : `₹${stats.draftValue.toLocaleString('en-IN')}`}
          </p>
          <p className="text-xs text-gray-500 font-light mt-1">{stats.draftInvoices} drafts</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-light text-black">Total Leads</h3>
          </div>
          <p className="text-3xl font-light text-black">{loading ? '...' : stats.totalLeads}</p>
        </motion.div>
      </div>
    </div>
  );
}
