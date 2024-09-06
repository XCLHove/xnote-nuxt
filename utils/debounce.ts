/**
 * 函数防抖
 */
export function debounce<A extends any[], R>(
  fun: (...args: A) => R,
  delayMillisecond = 0,
  onWait?: () => void,
): (...args: A) => void {
  let timeoutId: NodeJS.Timeout
  return function (...args: A) {
    clearTimeout(timeoutId)
    onWait?.()
    timeoutId = setTimeout(() => {
      fun(...args)
    }, delayMillisecond)
  }
}
