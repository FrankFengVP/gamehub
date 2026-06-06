import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT_ID, pushAdSense } from '@/lib/adsense';

interface AdSenseUnitProps {
  /** AdSense 后台创建的广告单元 ID */
  slot: string;
  /** 如 horizontal / rectangle / auto */
  format?: string;
  className?: string;
}

/**
 * 手动广告位。在 AdSense 后台创建单元后，将 slot ID 传入即可。
 * 全局 loader 脚本已在 index.html 中加载。
 */
export function AdSenseUnit({
  slot,
  format = 'auto',
  className = 'adsense-unit',
}: AdSenseUnitProps) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;
    pushAdSense();
  }, [slot]);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
