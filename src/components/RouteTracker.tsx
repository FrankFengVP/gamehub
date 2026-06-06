import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageview } from '@/lib/analytics';

/** SPA 路由切换时上报 page_view */
export function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    pageview(`${location.pathname}${location.search}`);
  }, [location]);

  return null;
}
