/**
 * Disposal tracking for owner-based cleanup.
 *
 * When a computed/derive ref is created while _current_disposables is set,
 * it registers its destroy function. The owner system (in primitive) uses
 * this to auto-cleanup refs created during render callbacks.
 */

export let _current_disposables: (() => void)[] | null = null;

export function start_tracking(disposables: (() => void)[]): void {
  _current_disposables = disposables;
}

export function stop_tracking(): void {
  _current_disposables = null;
}
