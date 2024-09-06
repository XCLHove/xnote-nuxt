const isMobile = (() => {
  const userAgent = window.navigator.userAgent
  const mobileKeywords = [
    'Android',
    'iPhone',
    'iPad',
    'Windows Phone',
    'Mobile',
  ]

  // 判断是否包含手机关键词
  const _isMobile = mobileKeywords.some((keyword) =>
    userAgent.includes(keyword),
  )
  return () => _isMobile
})()

export default {
  isMobile,
}
