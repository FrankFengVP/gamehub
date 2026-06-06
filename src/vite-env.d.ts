/// <reference types="vite/client" />

interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
  adsbygoogle: Record<string, unknown>[];
}
