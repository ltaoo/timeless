export function throttle<T extends (...args: any[]) => any>(
  delay: number,
  func: T,
) {
  let lastTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  function invoke(args: Parameters<T>) {
    lastTime = Date.now();
    lastArgs = null;
    return func(...args);
  }

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const elapsed = now - lastTime;
    lastArgs = args;

    if (elapsed >= delay || lastTime === 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      return invoke(args);
    }

    if (!timeoutId) {
      const wait = Math.max(0, delay - elapsed);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (!lastArgs) return;
        invoke(lastArgs);
      }, wait);
    }
  };
}
