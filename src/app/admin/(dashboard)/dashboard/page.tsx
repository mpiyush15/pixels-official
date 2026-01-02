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
  CreditCard,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
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
  
  // Financial metrics
  totalExpenses: number;
  totalSalaries: number;
  netProfit: number;
  cashBalance: number;
  bankBalance: number;
  totalBalance: number;
  monthlyProfit: number;
  pendingAmount: number;
  
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
    totalExpenses: 0,
    totalSalaries: 0,
    netProfit: 0,
    cashBalance: 0,
    bankBalance: 0,
    totalBalance: 0,
    monthlyProfit: 0,
    pendingAmount: 0,
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
      // Fetch basic stats
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      // Fetch financial stats
      const financialResponse = await fetch('/api/dashboard/financial-stats');
      const financialData = await financialResponse.json();
      
      if (financialData.success) {
        setStats({
          ...data,
          ...financialData.data
        });
      } else {
        setStats(data);
      }
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
          <h1 className="text-4xl font-semibold text-black mb-2">Business Dashboard</h1>
          <p className="text-gray-600 font-medium">Revenue, payments, and key business metrics</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          {dateFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setDateFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
              className={`bg-white rounded-2xl p-6 border ${
                stat.color === 'green' ? 'border-green-100' :
                stat.color === 'red' ? 'border-red-100' :
                stat.color === 'orange' ? 'border-orange-100' :
                stat.color === 'purple' ? 'border-purple-100' :
                'border-blue-100'
              } hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${
                  stat.color === 'green' ? 'bg-green-50' :
                  stat.color === 'red' ? 'bg-red-50' :
                  stat.color === 'orange' ? 'bg-orange-50' :
                  stat.color === 'purple' ? 'bg-purple-50' :
                  'bg-blue-50'
                } flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'green' ? 'text-green-500' :
                    stat.color === 'red' ? 'text-red-500' :
                    stat.color === 'orange' ? 'text-orange-500' :
                    stat.color === 'purple' ? 'text-purple-500' :
                    'text-blue-500'
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
              <p className="text-3xl font-semibold text-black mb-1">
                {loading ? '...' : stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 font-medium">{stat.subtitle}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Financial Overview - Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl p-8 mb-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-50 text-sm font-medium uppercase tracking-wide mb-2">Your Business Today</p>
            <h2 className="text-4xl font-bold">Financial Overview</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-center">
            <p className="text-blue-50 text-xs uppercase tracking-wider mb-1">Available Balance</p>
            <p className="text-3xl font-bold">
              {loading ? '...' : `₹${stats.totalBalance.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <ArrowUp className="w-5 h-5 text-green-300" />
              <span className="text-xs text-blue-100">Revenue</span>
            </div>
            <p className="text-2xl font-bold mb-1">
              {loading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
            </p>
            <p className="text-xs text-blue-100">Total income received</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <ArrowDown className="w-5 h-5 text-red-300" />
              <span className="text-xs text-blue-100">Spent</span>
            </div>
            <p className="text-2xl font-bold mb-1">
              {loading ? '...' : `₹${(stats.totalExpenses + stats.totalSalaries).toLocaleString('en-IN')}`}
            </p>
            <p className="text-xs text-blue-100">Expenses + Salaries</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-300" />
              <span className="text-xs text-blue-100">Profit</span>
            </div>
            <p className="text-2xl font-bold mb-1">
              {loading ? '...' : `₹${stats.netProfit.toLocaleString('en-IN')}`}
            </p>
            <p className="text-xs text-blue-100">Your earnings</p>
          </div>
        </div>
      </motion.div>

      {/* Money Flow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-3xl p-8 mb-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          Money Flow
        </h2>
        
        <div className="relative">
          {/* Flow visualization */}
          <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
            {/* Step 1: Revenue */}
            <div className="flex-1 min-w-[200px]">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                    1
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Income</p>
                    <p className="text-lg font-bold text-gray-900">Revenue</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {loading ? '...' : `₹${stats.totalRevenue.toLocaleString('en-IN')}`}
                </p>
                <p className="text-xs text-gray-600">Payments from clients</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ChevronDown className="w-8 h-8 text-gray-300 rotate-[-90deg]" />
            </div>

            {/* Step 2: Deductions */}
            <div className="flex-1 min-w-[200px]">
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        2A
                      </div>
                      <p className="text-sm font-bold text-gray-900">Expenses</p>
                    </div>
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {loading ? '...' : `₹${stats.totalExpenses.toLocaleString('en-IN')}`}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        2B
                      </div>
                      <p className="text-sm font-bold text-gray-900">Salaries</p>
                    </div>
                    <ArrowDown className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {loading ? '...' : `₹${stats.totalSalaries.toLocaleString('en-IN')}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ChevronDown className="w-8 h-8 text-gray-300 rotate-[-90deg]" />
            </div>

            {/* Step 3: Result */}
            <div className="flex-1 min-w-[200px]">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-sm">
                    3
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Result</p>
                    <p className="text-lg font-bold text-gray-900">Net Profit</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {loading ? '...' : `₹${stats.netProfit.toLocaleString('en-IN')}`}
                </p>
                <p className="text-xs text-gray-600">Your actual earnings</p>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-center text-sm text-gray-600">
              <span className="font-semibold text-blue-600">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
              {' '}<span className="text-gray-400">−</span>{' '}
              <span className="font-semibold text-red-600">₹{stats.totalExpenses.toLocaleString('en-IN')}</span>
              {' '}<span className="text-gray-400">−</span>{' '}
              <span className="font-semibold text-purple-600">₹{stats.totalSalaries.toLocaleString('en-IN')}</span>
              {' '}<span className="text-gray-400">=</span>{' '}
              <span className="font-bold text-green-600 text-lg">₹{stats.netProfit.toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Financial Breakdown Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-3xl p-8 mb-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Breakdown</h2>
        
        <div className="flex items-end justify-around gap-6 h-80">
          {/* Revenue Bar */}
          <div className="flex-1 flex flex-col items-center h-full">
            <div className="flex-1 w-full flex flex-col justify-end">
              <div className="relative w-full bg-gradient-to-t from-blue-500 via-blue-400 to-blue-300 rounded-t-2xl shadow-lg hover:shadow-xl transition-shadow"
                   style={{ height: '100%' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white drop-shadow-lg">100%</p>
                    <p className="text-xs font-medium text-white/90 mt-1">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-bold text-gray-900">Revenue</p>
              <p className="text-xs text-gray-600 mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
                <span className="text-xs font-semibold text-blue-700">Income</span>
              </div>
            </div>
          </div>

          {/* Expenses Bar */}
          <div className="flex-1 flex flex-col items-center h-full">
            <div className="flex-1 w-full flex flex-col justify-end">
              <div className="relative w-full bg-gradient-to-t from-rose-500 via-rose-400 to-rose-300 rounded-t-2xl shadow-lg hover:shadow-xl transition-shadow"
                   style={{ height: `${stats.totalRevenue > 0 ? (stats.totalExpenses / stats.totalRevenue) * 100 : 0}%` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {stats.totalExpenses > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white drop-shadow-lg">
                        {stats.totalRevenue > 0 ? Math.round((stats.totalExpenses / stats.totalRevenue) * 100) : 0}%
                      </p>
                      <p className="text-xs font-medium text-white/90 mt-1">₹{(stats.totalExpenses / 1000).toFixed(0)}K</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-bold text-gray-900">Expenses</p>
              <p className="text-xs text-gray-600 mt-1">₹{stats.totalExpenses.toLocaleString('en-IN')}</p>
              <div className="mt-2 px-3 py-1 bg-rose-100 rounded-full">
                <span className="text-xs font-semibold text-rose-700">Costs</span>
              </div>
            </div>
          </div>

          {/* Salaries Bar */}
          <div className="flex-1 flex flex-col items-center h-full">
            <div className="flex-1 w-full flex flex-col justify-end">
              <div className="relative w-full bg-gradient-to-t from-purple-500 via-purple-400 to-purple-300 rounded-t-2xl shadow-lg hover:shadow-xl transition-shadow"
                   style={{ height: `${stats.totalRevenue > 0 ? (stats.totalSalaries / stats.totalRevenue) * 100 : 0}%` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {stats.totalSalaries > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white drop-shadow-lg">
                        {stats.totalRevenue > 0 ? Math.round((stats.totalSalaries / stats.totalRevenue) * 100) : 0}%
                      </p>
                      <p className="text-xs font-medium text-white/90 mt-1">₹{(stats.totalSalaries / 1000).toFixed(0)}K</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-bold text-gray-900">Salaries</p>
              <p className="text-xs text-gray-600 mt-1">₹{stats.totalSalaries.toLocaleString('en-IN')}</p>
              <div className="mt-2 px-3 py-1 bg-purple-100 rounded-full">
                <span className="text-xs font-semibold text-purple-700">Payroll</span>
              </div>
            </div>
          </div>

          {/* Net Profit Bar */}
          <div className="flex-1 flex flex-col items-center h-full">
            <div className="flex-1 w-full flex flex-col justify-end">
              <div className="relative w-full bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300 rounded-t-2xl shadow-lg hover:shadow-xl transition-shadow"
                   style={{ height: `${stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue) * 100 : 0}%` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white drop-shadow-lg">
                      {stats.totalRevenue > 0 ? Math.round((stats.netProfit / stats.totalRevenue) * 100) : 0}%
                    </p>
                    <p className="text-xs font-medium text-white/90 mt-1">₹{(stats.netProfit / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-bold text-gray-900">Net Profit</p>
              <p className="text-xs text-gray-600 mt-1">₹{stats.netProfit.toLocaleString('en-IN')}</p>
              <div className="mt-2 px-3 py-1 bg-emerald-100 rounded-full">
                <span className="text-xs font-semibold text-emerald-700">Earnings</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pie Chart - Expense Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Revenue Distribution</h2>
            <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
              <span className="text-xs font-semibold text-blue-700">Interactive</span>
            </div>
          </div>
          
          {/* Legend Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-gray-700">Profit</span>
              </div>
              <p className="text-lg font-bold text-emerald-600">
                {stats.totalRevenue > 0 ? Math.round((stats.netProfit / stats.totalRevenue) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-600">₹{(stats.netProfit / 1000).toFixed(0)}K</p>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-3 border border-rose-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-xs font-semibold text-gray-700">Expenses</span>
              </div>
              <p className="text-lg font-bold text-rose-600">
                {stats.totalRevenue > 0 ? Math.round((stats.totalExpenses / stats.totalRevenue) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-600">₹{(stats.totalExpenses / 1000).toFixed(0)}K</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs font-semibold text-gray-700">Salaries</span>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {stats.totalRevenue > 0 ? Math.round((stats.totalSalaries / stats.totalRevenue) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-600">₹{(stats.totalSalaries / 1000).toFixed(0)}K</p>
            </div>
          </div>
          
          <div className="h-64 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={256}>
              <PieChart>
                <defs>
                  <filter id="shadow" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <Pie
                  data={[
                    { name: 'Net Profit', value: stats.netProfit, color: '#10b981' },
                    { name: 'Expenses', value: stats.totalExpenses, color: '#f43f5e' },
                    { name: 'Salaries', value: stats.totalSalaries, color: '#a855f7' },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent ? percent * 100 : 0).toFixed(0)}%`}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={3}
                  stroke="#fff"
                  animationBegin={0}
                  animationDuration={800}
                  style={{ filter: 'url(#shadow)' }}
                >
                  {[
                    { name: 'Net Profit', value: stats.netProfit, color: '#10b981' },
                    { name: 'Expenses', value: stats.totalExpenses, color: '#f43f5e' },
                    { name: 'Salaries', value: stats.totalSalaries, color: '#a855f7' },
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ 
                        cursor: 'pointer',
                        transition: 'opacity 0.3s'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px',
                    backgroundColor: 'white'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-600 text-center font-medium">
              💡 Hover over segments to see detailed breakdown
            </p>
          </div>
        </motion.div>

        {/* Bar Chart - Financial Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Comparison</h2>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <BarChart
                data={[
                  {
                    name: 'Income',
                    Revenue: stats.totalRevenue,
                  },
                  {
                    name: 'Costs',
                    Expenses: stats.totalExpenses,
                    Salaries: stats.totalSalaries,
                  },
                  {
                    name: 'Result',
                    Profit: stats.netProfit,
                  },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-sm font-medium text-gray-700">{value}</span>}
                />
                <Bar dataKey="Revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Salaries" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Profit" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              Visual comparison of income vs costs vs final profit
            </p>
          </div>
        </motion.div>
      </div>

      {/* Balance Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="bg-white rounded-3xl p-8 mb-6 shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Account Balances</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cash Balance */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 border border-amber-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 opacity-30"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm">
                  <IndianRupee className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Physical Cash</p>
                  <p className="text-lg font-bold text-gray-900">Cash Balance</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-amber-600 mb-2">
                {loading ? '...' : `₹${stats.cashBalance.toLocaleString('en-IN')}`}
              </p>
              <p className="text-sm text-gray-600">Available in cash drawer</p>
            </div>
          </div>

          {/* Bank Balance */}
          <div className={`relative overflow-hidden rounded-2xl p-6 border ${
            !loading && stats.bankBalance < 20000
              ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-30 ${
              !loading && stats.bankBalance < 20000 ? 'bg-red-100' : 'bg-blue-100'
            }`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    !loading && stats.bankBalance < 20000 ? 'bg-red-500' : 'bg-blue-500'
                  }`}>
                    <CreditCard className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${
                      !loading && stats.bankBalance < 20000 ? 'text-red-600' : 'text-blue-600'
                    }`}>HDFC Bank</p>
                    <p className="text-lg font-bold text-gray-900">Bank Balance</p>
                  </div>
                </div>
                {!loading && stats.bankBalance < 20000 && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">Low</span>
                  </div>
                )}
              </div>
              <p className={`text-4xl font-bold mb-2 ${
                !loading && stats.bankBalance < 20000 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {loading ? '...' : `₹${stats.bankBalance.toLocaleString('en-IN')}`}
              </p>
              <p className="text-sm text-gray-600">
                {!loading && stats.bankBalance < 20000 
                  ? '⚠️ Below minimum threshold (₹20,000)' 
                  : 'Available in business account'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Combined Total */}
        <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Combined Available Balance</p>
              <p className="text-xs text-gray-500">Cash + Bank = Total funds available</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : `₹${stats.totalBalance.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Active Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Active Projects ({projects.length})
          </h2>
          <Link 
            href="/admin/projects"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
        
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8 font-medium">No active projects</p>
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
                      <p className="text-sm text-gray-500 font-medium">{project.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-black">₹{project.budget.toLocaleString('en-IN')}</p>
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
                            <span className="text-gray-700 font-medium">• {milestone.name}</span>
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
          className="w-full flex items-center justify-between text-xl font-semibold text-black mb-4"
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
            <h3 className="text-lg font-semibold text-black">Total Clients</h3>
          </div>
          <p className="text-3xl font-semibold text-black">{loading ? '...' : stats.totalClients}</p>
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
            <h3 className="text-lg font-semibold text-black">Draft Invoices</h3>
          </div>
          <p className="text-3xl font-semibold text-black">
            {loading ? '...' : `₹${stats.draftValue.toLocaleString('en-IN')}`}
          </p>
          <p className="text-xs text-gray-500 font-medium mt-1">{stats.draftInvoices} drafts</p>
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
            <h3 className="text-lg font-semibold text-black">Total Leads</h3>
          </div>
          <p className="text-3xl font-semibold text-black">{loading ? '...' : stats.totalLeads}</p>
        </motion.div>
      </div>
    </div>
  );
}
