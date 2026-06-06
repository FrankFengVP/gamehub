export const ADSENSE_CLIENT_ID = 'ca-pub-7089048762846337';

/** 在 AdSenseUnit 挂载后调用，请求填充广告位 */
export function pushAdSense(): void {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // AdSense 脚本未加载或重复 push 时忽略
  }
}
