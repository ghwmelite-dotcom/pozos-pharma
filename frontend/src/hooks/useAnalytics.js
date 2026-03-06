import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useChatStore from '../store/chatStore';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useAnalytics() {
  const token = useChatStore((s) => s.token);

  const track = useCallback(async (event_type, event_data = {}, page = '') => {
    try {
      await fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ event_type, event_data: JSON.stringify(event_data), page }),
      });
    } catch (e) {
      // Silent fail - analytics should never break the app
    }
  }, [token]);

  return { track };
}

export function usePageView() {
  const location = useLocation();
  const { track } = useAnalytics();

  useEffect(() => {
    track('page_view', { path: location.pathname }, location.pathname);
  }, [location.pathname, track]);
}
