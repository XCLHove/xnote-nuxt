export default function isMobile() {
  const userAgent = window.navigator.userAgent;
  const mobileKeywords = [
    "Android",
    "iPhone",
    "iPad",
    "Windows Phone",
    "Mobile",
  ];

  // 判断是否包含手机关键词
  return mobileKeywords.some((keyword) => userAgent.includes(keyword));
}
