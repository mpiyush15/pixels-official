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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {clientName || 'Client'}! 👋
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Manage your projects and track progress
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{formatDate(currentTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
