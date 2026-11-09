'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut,
  Menu,
  X,
  FolderKanban,
  Receipt,
  MessageCircle,
  Upload,
  User,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/client-portal/dashboard' },
  { icon: FolderKanban, label: 'Projects', path: '/client-portal/projects' },
  { icon: Upload, label: 'Submit Work', path: '/client-portal/submit-work' },
  { icon: MessageCircle, label: 'Chats', path: '/client-portal/chats' },
  { icon: FileText, label: 'Invoices', path: '/client-portal/invoices' },
  { icon: Receipt, label: 'Payments', path: '/client-portal/payments' },
  { icon: User, label: 'Profile', path: '/client-portal/profile' },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Auto-close drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/chat/unread-count');
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/client-auth/logout', { method: 'POST' });
    router.push('/client-portal/login');
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10 px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        <div className="text-center flex-1">
          <h1 className="text-base font-medium text-white tracking-wide">Pixels Digital</h1>
          <p className="text-gray-400 text-[11px] font-light">Client Portal</p>
        </div>

        <div className="w-8" /> {/* Placeholder for balance */}
      </div>

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-black border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 pt-[60px] lg:pt-0`}
      >
        {/* Desktop Logo */}
        <div className="hidden lg:block p-8 border-b border-white/10 flex-shrink-0">
          <h1 className="text-2xl font-light text-white tracking-wide">Pixels Digital</h1>
          <p className="text-gray-400 text-sm font-light mt-1">Client Portal</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const isChatsPage = item.path === '/client-portal/chats';
            const showBadge = isChatsPage && unreadCount > 0;

            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-light ${
                  isActive
                    ? 'bg-white text-black font-normal shadow-sm'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {showBadge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-light"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
