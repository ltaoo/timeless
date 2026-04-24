/**
 * LazyView - A component for lazy-loading other components.
 *
 * LazyView enables code-splitting by accepting a component factory
 * that returns a Promise. The actual component is only loaded when
 * needed (when mounted).
 *
 * Supports:
 * - Dynamic imports for code splitting
 * - Error boundaries with custom fallback views
 * - HMR (Hot Module Replacement) for development
 *
 * @example
 * ```tsx
 * const HeavyComponent = () => import('./HeavyComponent');
 *
 * <LazyView view={HeavyComponent} />
 * ```
 */
import { MountedEvent } from "@/event";
import { get_owner, run_with_owner } from "@/context/context";

import { ViewProps } from "./view";
import { useErrorBoundary } from "./error-boundary-context";
import {
  isElement,
  TimelessElement,
  ViewChildren,
  TimelessComponent,
} from "./type";

/** Default error view shown when lazy loading fails */
function defaultErrorView(error: Error, viewName: string): TimelessElement {
  return {
    t: "error-view",
    $elm: null as any,
    state: {
      error,
      viewName,
    },
    children: [],
    onMounted() {},
    onUnmounted() {},
  };
}

/** Type guard for Promise objects */
function isPromise<T>(v: any): v is Promise<T> {
  return v instanceof Promise || typeof v.then === "function";
}

/** Props for LazyView component */
type LazyViewProps = ViewProps & { placeholder?: ViewChildren } & Record<
    string,
    any
  >;

/** Internal state for LazyView */
type LazyViewState = {
  children: (TimelessElement | null)[];
};

/**
 * Creates a LazyView component that loads content dynamically.
 *
 * @param props - View props including the component factory
 * @param children - Component factory (can be async/ES module)
 * @returns A TimelessElement with lazy-loaded content
 */
export function LazyView(
  props: LazyViewProps,
  children: TimelessComponent,
): TimelessElement {
  const owner = get_owner();
  let $elm: any = null;

  const state: LazyViewState = {
    children: [],
  };

  const methods = {
    refreshChildren() {
      if ($elm && typeof $elm.replaceChildren === "function") {
        $elm.replaceChildren(state.children);
        return;
      }
      if ($elm && typeof $elm.refresh === "function") {
        $elm.refresh(state.children);
      }
    },
    handleError(err: unknown) {
      const evaluate = () => {
        const boundary = useErrorBoundary();
        if (boundary) {
          state.children = boundary.handle(err);
          return;
        }
        const error = err instanceof Error ? err : new Error(String(err));
        const ErrorView = props.ErrorFallback || defaultErrorView;
        state.children = [ErrorView(error, props.view?.name || "unknown")];
      };
      if (owner) {
        run_with_owner(owner, evaluate);
      } else {
        evaluate();
      }
      methods.refreshChildren();
    },
    setup_children(children: TimelessComponent) {
      if (!children) {
        return;
      }
      const result = owner
        ? run_with_owner(owner, () => children(props))
        : children(props);
      if (isElement(result)) {
        state.children = [result];
      } else if (isPromise(result)) {
        result
          .then((m) => {
            const evaluate = () => {
              const Factory = m.default || m;
              if (typeof Factory !== "function") {
                return;
              }
              const hmr_path = (children as any).__hmr_path;
              if (
                hmr_path &&
                // @ts-ignore
                typeof globalThis.__TIMELESS_HMR__ !== "undefined"
              ) {
                // @ts-ignore
                globalThis.__TIMELESS_HMR__.beginRecord?.(hmr_path);
              }
              try {
                const element = Factory(props);
                if (!element) {
                  return;
                }
                if (isElement(element)) {
                  state.children = [element];
                  methods.refreshChildren();
                  if (
                    hmr_path &&
                    // @ts-ignore
                    typeof globalThis.__TIMELESS_HMR__ !== "undefined"
                  ) {
                    // @ts-ignore
                    globalThis.__TIMELESS_HMR__.register(hmr_path, {
                      element,
                      get $elm() {
                        return $elm;
                      },
                      props,
                    });
                  }
                }
              } finally {
                if (
                  hmr_path &&
                  // @ts-ignore
                  typeof globalThis.__TIMELESS_HMR__ !== "undefined"
                ) {
                  // @ts-ignore
                  globalThis.__TIMELESS_HMR__.endRecord?.();
                }
              }
            };
            if (owner) {
              run_with_owner(owner, evaluate);
            } else {
              evaluate();
            }
          })
          .catch((err) => {
            methods.handleError(err);
          });
      }
    },
  };

  try {
    methods.setup_children(children);
  } catch (err) {
    methods.handleError(err);
  }

  return {
    t: "lazy-view",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      $elm = v;
    },
    state: {},
    children: state.children,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
      for (const child of state.children) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({
            target: child.$elm,
          });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}

export type TimelessLazyComponent = () => Promise<{
  default: TimelessComponent;
}>;

export function isLazyElement(v: unknown): v is TimelessLazyComponent {
  if (v === null || v === undefined) {
    return false;
  }
  if (
    v instanceof Promise ||
    (v && typeof (v as Promise<unknown>).then === "function")
  ) {
    return true;
  }
  return false;
}
