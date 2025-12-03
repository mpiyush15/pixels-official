'use client';

import { useEffect } from 'react';

export function usePageTracking() {
  useEffect(() => {
    // Generate or get session ID
    let sessionId = sessionStorage.getItem('analytics-session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics-session', sessionId);
    }

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: window.location.pathname,
            referrer: document.referrer || 'direct',
            sessionId,
          }),
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, []);
}
