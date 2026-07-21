'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Users, Briefcase, CreditCard, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    clients: 0,
    revenue: 0,
    projectRevenue: 0,
    replysysRevenue: 0,
    bankBalance: 0,
    cashBalance: 0,
    invoices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch overview stats
    const fetchStats = async () => {
      try {
        const [projRes, clientRes, finRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/clients'),
          fetch('/api/finance/dashboard')
        ]);
        
        const projects = await projRes.json();
        const clients = await clientRes.json();
        const finance = await finRes.json();

        setStats({
          projects: projects.length || 0,
          clients: clients.length || 0,
          revenue: (finance.totalRevenue || 0),
          projectRevenue: finance.projectRevenue || 0,
          replysysRevenue: finance.replysysRevenue || 0,
          bankBalance: finance.bankBalance || 0,
          cashBalance: finance.cashBalance || 0,
          invoices: finance.accountsReceivable || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // ApexCharts Configuration
  const chartOptions: any = {
    chart: {
      type: 'area',
      height: 350,
      fontFamily: 'inherit',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#3C50E0', '#80CAEE'],
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: '#8A99AF', fontSize: '12px' }
      }
    },
    yaxis: {
      labels: {
        style: { colors: '#8A99AF', fontSize: '12px' },
        formatter: (val: number) => `₹${val / 1000}k`
      }
    },
    grid: {
      borderColor: '#313d4a',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } }
    },
    theme: { mode: 'dark' }, // Force dark mode for chart to match our UI
    legend: { position: 'top', horizontalAlign: 'left' }
  };

  const chartSeries = [
    { name: 'Total Revenue', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, stats.revenue] },
    { name: 'Total Sales', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
  ];

  // Render removed for smooth framer motion loading

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        
        {/* KPI Card 1 */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="ta-card flex flex-col justify-between">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-[#f3f4f6] dark:bg-[#333a48]">
            <TrendingUp className="w-6 h-6 text-[#3c50e0]" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-text-primary text-3xl mb-1">
                ₹{stats.revenue.toLocaleString('en-IN')}
              </h4>
              <span className="text-sm font-medium text-[var(--muted-fg)]">Total Revenue</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
              0.43%
            </span>
          </div>
        </motion.div>

        {/* KPI Card 2: Bank Balance */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="ta-card flex flex-col justify-between">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-[#f3f4f6] dark:bg-[#333a48]">
            <Briefcase className="w-6 h-6 text-[#10b981]" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-text-primary text-3xl mb-1">
                ₹{stats.bankBalance.toLocaleString('en-IN')}
              </h4>
              <span className="text-sm font-medium text-[var(--muted-fg)]">Bank Balances</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
              Active
            </span>
          </div>
        </motion.div>

        {/* KPI Card 3: Cash Balance */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="ta-card flex flex-col justify-between">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-[#f3f4f6] dark:bg-[#333a48]">
            <Users className="w-6 h-6 text-[#f59e0b]" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-text-primary text-3xl mb-1">
                ₹{stats.cashBalance.toLocaleString('en-IN')}
              </h4>
              <span className="text-sm font-medium text-[var(--muted-fg)]">Cash in Hand</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
              Active
            </span>
          </div>
        </motion.div>

        {/* KPI Card 4: Accounts Receivable */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="ta-card flex flex-col justify-between">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-[#f3f4f6] dark:bg-[#333a48]">
            <CreditCard className="w-6 h-6 text-[#ef4444]" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-text-primary text-3xl mb-1">
                ₹{stats.invoices.toLocaleString('en-IN')}
              </h4>
              <span className="text-sm font-medium text-[var(--muted-fg)]">Accounts Receivable</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-red-500">
              Pending
            </span>
          </div>
        </motion.div>

      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {/* Main Chart */}
        <div className="col-span-12 xl:col-span-8">
          <div className="ta-card">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
              <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                <div className="flex min-w-47.5">
                  <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-[#3c50e0]">
                    <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-[#3c50e0]"></span>
                  </span>
                  <div className="w-full">
                    <p className="font-semibold text-[#3c50e0]">Total Revenue</p>
                    <p className="text-sm font-medium">12.04.2026 - 12.05.2026</p>
                  </div>
                </div>
                <div className="flex min-w-47.5">
                  <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-[#80caee]">
                    <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-[#80caee]"></span>
                  </span>
                  <div className="w-full">
                    <p className="font-semibold text-[#80caee]">Total Sales</p>
                    <p className="text-sm font-medium">12.04.2026 - 12.05.2026</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div id="chartOne" className="-ml-5">
                  <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="area"
                    height={350}
                  />
              </div>
            </div>
          </div>
        </div>

        {/* Top Channels / Activity Feed */}
        <div className="col-span-12 xl:col-span-4">
          <div className="ta-card h-full">
            <h4 className="mb-6 text-xl font-semibold text-text-primary">
              Recent Activity
            </h4>

            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-muted py-4 text-center">No recent activity.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
