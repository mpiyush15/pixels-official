'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export default function AdminTopBar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          const data = await res.json();
          const newLeads = data.filter((lead: any) => lead.status === 'new');
          setNotifications(newLeads);
          setUnreadCount(newLeads.length);
        }
      } catch (err) {
        console.error('Failed to fetch leads for notifications', err);
      }
    };
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // close on click outside for notifications
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdownOpen) return;
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  return (
    <header className="sticky top-0 z-40 flex w-full bg-sidebar drop-shadow-1 border-b border-border transition-colors duration-300">
      <div className="flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-50 block rounded-sm border border-border bg-card p-1.5 shadow-sm lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-text-primary delay-[0] duration-200 ease-in-out ${
                    !sidebarOpen && '!w-full delay-300'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-text-primary delay-150 duration-200 ease-in-out ${
                    !sidebarOpen && 'delay-400 !w-full'
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-text-primary delay-200 duration-200 ease-in-out ${
                    !sidebarOpen && '!w-full delay-500'
                  }`}
                ></span>
              </span>
            </span>
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}
        </div>

        <div className="hidden sm:block">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative">
              <button className="absolute left-0 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-[var(--muted-fg)] hover:text-[var(--primary)] transition-colors" />
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-transparent pl-9 pr-4 text-text-primary focus:outline-none xl:w-125 placeholder:text-text-muted"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* <!-- Dark Mode Toggler --> */}
            <ThemeToggle />
            {/* <!-- Dark Mode Toggler --> */}

            {/* <!-- Notification Menu Area --> */}
            <li className="relative">
              <button
                ref={trigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-border bg-surface hover:text-primary text-text-secondary"
              >
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-danger">
                    <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75"></span>
                  </span>
                )}
                <Bell className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    ref={dropdown}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-border bg-card shadow-lg sm:right-0 sm:w-80"
                  >
                    <div className="px-4.5 py-3 border-b border-border">
                      <h5 className="text-sm font-medium text-[var(--muted-fg)]">Notification</h5>
                    </div>
                    <ul className="flex h-auto max-h-64 flex-col overflow-y-auto">
                      {notifications.length === 0 ? (
                        <li className="p-4 text-center text-sm text-[var(--muted-fg)]">
                          No new notifications
                        </li>
                      ) : (
                        notifications.map((notif: any, i: number) => (
                          <li key={i} className="border-b border-border last:border-b-0 hover:bg-surface transition-colors">
                            <Link href="/admin/leads" onClick={() => setDropdownOpen(false)} className="flex flex-col gap-1 p-4.5">
                              <p className="text-sm font-medium text-text-primary">New Lead: {notif.name}</p>
                              <p className="text-xs text-[var(--muted-fg)] truncate">{notif.service}</p>
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            {/* <!-- Notification Menu Area --> */}
          </ul>

          {/* <!-- User Area --> */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-4"
            >
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-text-primary">
                  Musharof
                </span>
                <span className="block text-xs font-medium text-text-muted">Admin</span>
              </span>
              <span className="h-10 w-10 rounded-full bg-surface flex items-center justify-center border border-border">
                <User className="w-5 h-5 text-text-secondary" />
              </span>
            </button>
          </div>
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
}
