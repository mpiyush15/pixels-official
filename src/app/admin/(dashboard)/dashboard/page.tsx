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
} from 'lucide-react';

interface Stats {
  totalLeads: number;
  totalClients: number;
  totalInvoices: number;
  totalRevenue: number;
  leadsChange: number;
  clientsChange: number;
  revenueChange: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalClients: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    leadsChange: 0,
    clientsChange: 0,
    revenueChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
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

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Mail,
      change: stats.leadsChange,
      color: 'blue',
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      change: stats.clientsChange,
      color: 'green',
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FileText,
      change: 0,
      color: 'purple',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      change: stats.revenueChange,
      color: 'orange',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-black mb-2">Dashboard</h1>
        <p className="text-gray-600 font-light">Welcome back! Here's your business overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-black transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} strokeWidth={1.5} />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-light mb-1">{stat.title}</h3>
              <p className="text-3xl font-light text-black">
                {loading ? '...' : stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h2 className="text-xl font-light text-black mb-4">Recent Leads</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-light">
                  {item}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-light text-black">Loading...</p>
                  <p className="text-xs text-gray-500 font-light">Just now</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h2 className="text-xl font-light text-black mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors">
              <Users className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-light">Add New Client</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-colors">
              <FileText className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-light">Create Invoice</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-colors">
              <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
              <span className="font-light">View Reports</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
