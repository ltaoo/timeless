import { defaultErrorView } from "@/modules/error-boundary";
import { MountedEvent } from "@/event";

import { ViewProps } from "./view";
import {
  TimelessNormalComponent,
  isElement,
  TimelessElement,
  ViewChildren,
  TimelessComponent,
} from "./type";

function isPromise<T>(v: any): v is Promise<T> {
  return v instanceof Promise || typeof v.then === "function";
}

type LazyViewProps = ViewProps & { placeholder?: ViewChildren } & Record<
    string,
    any
  >;
type LazyViewState = {
  children: TimelessElement[];
};

export function LazyView(
  props: LazyViewProps,
  children: TimelessComponent,
): TimelessElement {
  let $elm: any = null;

  const state: LazyViewState = {
    children: [],
  };

  const methods = {
    handleError(err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      // console.error("[LazyView] Error loading async component:", error);
      const ErrorView = props.ErrorFallback || defaultErrorView;
      const error_element = ErrorView(error, props.view?.name || "unknown");
      state.children = [error_element];
      if ($elm && typeof $elm.refresh === "function") {
        $elm.refresh(state.children);
      }
    },
    setup_children(children: TimelessComponent) {
      // let loaded_element: TimelessElement | undefined;
      const result = children(props);
      console.log("[]LazyView - result", result);
      if (isElement(result)) {
        state.children = [result];
      } else if (isPromise(result)) {
        result.then((m) => {
          const Factory = m.default || m;
          if (typeof Factory === "function") {
            try {
              const element = Factory(props);
              if (!element) {
                return;
              }
              if (isElement(element)) {
                state.children = [element];
                if ($elm && typeof $elm.replaceChildren === "function") {
                  $elm.replaceChildren(state.children);
                }
              }
            } catch (err) {
              methods.handleError(err);
              throw err;
            }
          }
        });
      }
    },
  };

  methods.setup_children(children);

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
      // for (const child of state.children) {
      //   if (isElement(child) && child.onMounted) {
      //     child.onMounted({
      //       target: child.$elm,
      //     });
      //   }
      // }
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
  default: TimelessNormalComponent;
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
