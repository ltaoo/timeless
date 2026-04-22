export function debounce<T extends (...args: any[]) => any>(
  wait: number,
  func: T,
) {
  let timer_id: ReturnType<typeof setTimeout> | null;
  return function debounced(...args: Parameters<T>) {
    if (timer_id) {
      clearTimeout(timer_id);
    }
    timer_id = setTimeout(() => {
      func(...args);
      timer_id = null;
    }, wait);
  };
}
