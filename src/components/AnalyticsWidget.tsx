'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Users,
  TrendingUp,
  Globe,
  Activity,
  BarChart3,
} from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  pageViews: Array<{ page: string; views: number }>;
  trafficSources: Array<{ source: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  realtimeVisitors: number;
}

interface AnalyticsWidgetProps {
  days?: number;
}

export default function AnalyticsWidget({ days = 7 }: AnalyticsWidgetProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(days);

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds for real-time data
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?days=${selectedPeriod}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxViews = Math.max(...data.dailyViews.map(d => d.views), 1);

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-black" />
          <h2 className="text-2xl font-light text-black">Website Analytics</h2>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl font-light text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period} Days
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-8 h-8 text-blue-600" />
            <span className="flex items-center gap-1 text-xs text-green-600 font-light">
              <Activity className="w-3 h-3" />
              Live: {data.realtimeVisitors}
            </span>
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {data.totalViews.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 font-light">Total Page Views</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {data.uniqueVisitors.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 font-light">Unique Visitors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {data.totalViews > 0
              ? (data.totalViews / data.uniqueVisitors).toFixed(1)
              : '0'}
          </p>
          <p className="text-sm text-gray-600 font-light">Avg. Pages/Visitor</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-light text-black mb-1">
            {data.trafficSources.length}
          </p>
          <p className="text-sm text-gray-600 font-light">Traffic Sources</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Views Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-light text-black mb-4">Daily Traffic</h3>
          <div className="space-y-2">
            {data.dailyViews.map((day, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-light">
                    {new Date(day.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <span className="text-black font-light">{day.views}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(day.views / maxViews) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="h-full bg-blue-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-light text-black mb-4">Top Pages</h3>
          <div className="space-y-3">
            {data.pageViews.slice(0, 8).map((page, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light text-black truncate">
                    {page.page === '/' ? 'Home' : page.page}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-light">
                    {page.views} views
                  </span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-light text-black mb-4">Traffic Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.trafficSources.map((source, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-light text-black">
                  {source.count}
                </span>
              </div>
              <p className="text-sm font-light text-gray-600 truncate">
                {source.source === 'direct' ? 'Direct Traffic' : source.source}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
