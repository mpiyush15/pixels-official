'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface ClientTopBarProps {
  clientName?: string;
}

export default function ClientTopBar({ clientName }: ClientTopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-b border-blue-700/50 px-4 py-3 md:px-6 md:py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight">
            Welcome back, {clientName || 'Client'}! 👋
          </h1>
          <p className="text-blue-100 text-xs md:text-sm mt-0.5 font-light">
            Manage your projects, billing & deliverables
          </p>
        </div>
        
        <div className="hidden sm:flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5 text-white text-xs md:text-sm font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-100 text-xs font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
