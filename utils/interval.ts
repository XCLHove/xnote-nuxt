/**
 * 函数间隔执行
 * @param fun 函数
 * @param onWaiting 在等待时执行的函数
 * @param intervalSecond 间隔执行的秒数
 * @returns 间隔执行函数
 */
export default function interval<A extends any[], R>(
  fun: (...args: A) => R,
  intervalSecond = 1,
  onWaiting?: (...args: A) => void,
): (...args: A) => void {
  let isWaiting = false;
  let timeoutId: NodeJS.Timeout;

  return (...args: A) => {
    if (isWaiting) {
      onWaiting?.(...args);
      return;
    }

    isWaiting = true;
    fun(...args);

    timeoutId = setTimeout(
      () => {
        isWaiting = false;
        clearTimeout(timeoutId);
      },
      Math.max(0, Math.floor(intervalSecond * 1000)),
    );
  };
}
