export const GA_MEASUREMENT_ID = 'G-X1N74S97J0';

export function pageview(path: string) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('config', GA_MEASUREMENT_ID, { page_path: path });
}

export function trackEvent(
  action: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', action, params);
}
