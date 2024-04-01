/**
 * 函数防抖
 * @param fun 函数
 * @param delaySecond 延迟执行的秒数
 * @returns 防抖函数
 */
export function debounce<A extends any[], R>(
  fun: (...args: A) => R,
  delaySecond = 1,
): (...args: A) => void {
  let timeoutId: NodeJS.Timeout;
  return function (...args: A) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fun(...args);
    }, delaySecond * 1000);
  };
}
