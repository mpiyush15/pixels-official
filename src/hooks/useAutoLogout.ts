'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseAutoLogoutOptions {
  timeout?: number; // in milliseconds, default 5 minutes
  logoutEndpoint: string;
  redirectPath: string;
  enabled?: boolean;
}

export function useAutoLogout({
  timeout = 5 * 60 * 1000, // 5 minutes default
  logoutEndpoint,
  redirectPath,
  enabled = true,
}: UseAutoLogoutOptions) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await fetch(logoutEndpoint, { method: 'POST' });
      router.push(redirectPath);
    } catch (error) {
      console.error('Auto-logout error:', error);
      router.push(redirectPath);
    }
  }, [logoutEndpoint, redirectPath, router]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning at 4 minutes (1 minute before logout)
    warningTimeoutRef.current = setTimeout(() => {
      console.log('⚠️ You will be logged out in 1 minute due to inactivity');
    }, timeout - 60 * 1000);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      console.log('🔒 Logged out due to inactivity');
      handleLogout();
    }, timeout);
  }, [enabled, timeout, handleLogout]);

  useEffect(() => {
    if (!enabled) return;

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Start the timer initially
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [enabled, resetTimer]);

  return { resetTimer };
}
