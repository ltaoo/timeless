/**
 * Per-instance HMR state preservation.
 *
 * Call this INSIDE the component function to get-or-create state that survives
 * HMR reloads. Works correctly when multiple instances of the same component
 * exist — each instance keeps its own state.
 *
 * Typical usage:
 *
 *   export default function Page() {
 *     const { visible_, count_ } = hmrState(import.meta.hot, () => ({
 *       visible_: ref(false),
 *       count_: ref(0),
 *     }));
 *
 *     const element = View({}, [...]);
 *
 *     // Attach state to the element so HMR can inject it back next reload
 *     if (import.meta.hot) {
 *       element._hmr_state = { visible_, count_ };
 *       if (!import.meta.hot.data.elements) import.meta.hot.data.elements = [];
 *       import.meta.hot.data.elements.push(element);
 *     }
 *     return element;
 *   }
 *
 *   if (import.meta.hot) {
 *     import.meta.hot.accept((new_mod) => {
 *       const elements = import.meta.hot.data.elements ?? [];
 *       if (!new_mod || !elements.length) return;
 *       import.meta.hot.data.elements = [];
 *       elements.forEach((old_element) => {
 *         // Inject this instance's state before calling the new factory
 *         import.meta.hot.data._hmr_inject = old_element._hmr_state;
 *         const new_element = new_mod.default();
 *         import.meta.hot.data._hmr_inject = null;
 *         patch(old_element, new_element);
 *       });
 *       import.meta.hot.data.elements = elements;
 *     });
 *   }
 *
 * How it works:
 *   - On the very first render: factory() runs, fresh refs are created.
 *   - On HMR reload: the accept handler sets hot.data._hmr_inject to the
 *     old element's saved state, then calls new_mod.default(). hmrState()
 *     detects the injection and returns the existing refs instead of
 *     creating new ones. The factory is never called again for that instance.
 *   - After new_mod.default() returns, _hmr_inject is cleared so the next
 *     instance gets a clean slate.
 */
export function hmrState<T extends Record<string, any>>(
  hot: { data: Record<string, any> } | undefined | null,
  factory: () => T,
): T {
  if (hot?.data?._hmr_inject != null) {
    return hot.data._hmr_inject as T;
  }
  return factory();
}
