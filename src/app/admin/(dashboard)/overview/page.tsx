'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  FileText,
  IndianRupee,
  Calendar,
  Target,
  Activity,
} from 'lucide-react';

export default function BusinessOverviewPage() {
  const [data, setData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalClients: 0,
    activeProjects: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    recentRevenue: [] as any[],
    topClients: [] as any[],
    monthlyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/dashboard/overview');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light text-black mb-2">Business Overview</h1>
        <p className="text-gray-600 font-light">Comprehensive view of your business performance</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <IndianRupee className="w-8 h-8" strokeWidth={1.5} />
            <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-light opacity-90 mb-1">Total Revenue</h3>
          <p className="text-3xl font-light">
            {loading ? '...' : `₹${data.totalRevenue.toLocaleString()}`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8" strokeWidth={1.5} />
            <Activity className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-light opacity-90 mb-1">This Month</h3>
          <p className="text-3xl font-light">
            {loading ? '...' : `₹${data.monthlyRevenue.toLocaleString()}`}
          </p>
          {data.monthlyGrowth > 0 && (
            <p className="text-sm font-light opacity-90 mt-2">
              +{data.monthlyGrowth}% from last month
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8" strokeWidth={1.5} />
            <Target className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-light opacity-90 mb-1">Active Clients</h3>
          <p className="text-3xl font-light">
            {loading ? '...' : data.totalClients}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8" strokeWidth={1.5} />
            <Activity className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-light opacity-90 mb-1">Active Projects</h3>
          <p className="text-3xl font-light">
            {loading ? '...' : data.activeProjects}
          </p>
        </motion.div>
      </div>

      {/* Invoice Stats */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-lg font-light text-black mb-4">Invoice Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-light">Total Invoices</span>
              <span className="text-2xl font-light text-black">{data.totalInvoices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-light">Paid</span>
              <span className="text-2xl font-light text-green-600">{data.paidInvoices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-600 font-light">Pending</span>
              <span className="text-2xl font-light text-blue-600">{data.pendingInvoices}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-light">Collection Rate</span>
              <span className="text-lg font-light text-black">
                {data.totalInvoices > 0 
                  ? Math.round((data.paidInvoices / data.totalInvoices) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-lg font-light text-black mb-4">Top Clients by Revenue</h3>
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-gray-500 font-light py-4">Loading...</p>
            ) : data.topClients.length === 0 ? (
              <p className="text-center text-gray-500 font-light py-4">No data available</p>
            ) : (
              data.topClients.slice(0, 5).map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-light">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-light text-black">{client.name}</p>
                      <p className="text-sm text-gray-500 font-light">{client.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-light text-black">₹{client.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 font-light">{client.projectsCount} projects</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Monthly Revenue Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-light text-black mb-6">Revenue Trend (Last 6 Months)</h3>
        <div className="h-64 flex items-end justify-between gap-4">
          {loading ? (
            <p className="w-full text-center text-gray-500 font-light">Loading chart...</p>
          ) : data.recentRevenue.length === 0 ? (
            <p className="w-full text-center text-gray-500 font-light">No revenue data available</p>
          ) : (
            data.recentRevenue.map((month, index) => {
              const maxRevenue = Math.max(...data.recentRevenue.map(m => m.revenue), 1);
              const height = (month.revenue / maxRevenue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="w-full bg-gradient-to-t from-black to-gray-600 rounded-t-lg min-h-[20px] relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs font-light opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{month.revenue.toLocaleString()}
                    </div>
                  </motion.div>
                  <p className="text-xs text-gray-600 font-light">{month.month}</p>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-sm text-gray-600 font-light mb-2">Average Project Value</h3>
          <p className="text-3xl font-light text-black">
            ₹{data.totalInvoices > 0 
              ? Math.round(data.totalRevenue / data.totalInvoices).toLocaleString()
              : 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-sm text-gray-600 font-light mb-2">Revenue Per Client</h3>
          <p className="text-3xl font-light text-black">
            ₹{data.totalClients > 0 
              ? Math.round(data.totalRevenue / data.totalClients).toLocaleString()
              : 0}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-sm text-gray-600 font-light mb-2">Projects Per Client</h3>
          <p className="text-3xl font-light text-black">
            {data.totalClients > 0 
              ? (data.activeProjects / data.totalClients).toFixed(1)
              : 0}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
