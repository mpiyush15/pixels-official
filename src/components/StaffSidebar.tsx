'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, BarChart3, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StaffSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      href: '/staff-portal/dashboard',
      description: 'Overview and tasks'
    },
    { 
      name: 'My Tasks', 
      icon: FileText, 
      href: '/staff-portal/tasks',
      description: 'View and manage tasks'
    },
    { 
      name: 'Work Summary', 
      icon: BarChart3, 
      href: '/staff-portal/work-summary',
      description: 'Weekly & monthly reports'
    },
    { 
      name: 'Payments', 
      icon: Wallet, 
      href: '/staff-portal/payments',
      description: 'Payment history & bank'
    },
  ];

  const isActive = (href: string) => {
    if (href === '/staff-portal/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-purple-900 to-indigo-900 min-h-screen text-white flex flex-col">
      <div className="p-6">
        <Link href="/staff-portal/dashboard">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Pixels Digital
            </h1>
            <p className="text-purple-200 text-sm mt-1">Staff Portal</p>
          </motion.div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-white/20 shadow-lg border-l-4 border-purple-300'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-purple-200' : 'text-purple-300'}`} />
                <div className="flex-1">
                  <div className={`font-medium ${active ? 'text-white' : 'text-purple-100'}`}>
                    {item.name}
                  </div>
                  <div className="text-xs text-purple-300">{item.description}</div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-700">
        <div className="text-xs text-purple-300 text-center">
          © 2025 Pixels Digital
        </div>
      </div>
    </div>
  );
}
