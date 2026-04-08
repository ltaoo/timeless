import { defaultErrorView } from "@/modules/error-boundary";
import { MountedEvent } from "@/event";

import { View, ViewProps } from "./view";
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

  // const view$ = View(props, props.placeholder);

  // const self: TimelessElement = {
  //   t: "view",
  //   $elm: view$.$elm,
  //   render() {
  //     if (is_lazy_component) {
  //       const replaceWithError = (err: unknown) => {
  //         const error = err instanceof Error ? err : new Error(String(err));
  //         console.error("[LazyView] Error loading async component:", error);
  //         const renderError = props.ErrorFallback || defaultErrorView;
  //         const errorView = renderError(error, props.view?.name || "unknown");
  //         errorView.render();
  //         if (self.$elm.parentNode) {
  //           self.$elm.parentNode.replaceChild(errorView.$elm, self.$elm);
  //         }
  //         self.$elm = errorView.$elm;
  //       };
  //       (result as Promise<any>)
  //         .then((m) => {
  //           try {
  //             const Factory = m.default || m;
  //             if (typeof Factory === "function") {
  //               const elm_ = Factory(props);
  //               if (!elm_) {
  //                 return;
  //               }
  //               loaded_element = elm_;
  //               const r = elm_.render();
  //               view$.$elm.parentNode?.replaceChild(elm_.$elm, view$.$elm);
  //               view$.$elm = elm_.$elm;
  //               self.$elm = elm_.$elm;
  //               if (!r) {
  //                 return;
  //               }
  //               if (props.onMounted) {
  //                 props.onMounted({ target: elm_.$elm });
  //               }
  //             }
  //           } catch (err) {
  //             replaceWithError(err);
  //           }
  //         })
  //         .catch(replaceWithError);
  //     }
  //     view$.render();
  //     return view$.$elm;
  //   },
  //   beforeUnmounted() {
  //     if (loaded_element && loaded_element.beforeUnmounted) {
  //       loaded_element.beforeUnmounted();
  //     }
  //   },
  //   onUnmounted() {
  //     if (loaded_element && loaded_element.onUnmounted) {
  //       loaded_element.onUnmounted();
  //     }
  //     loaded_element = undefined;
  //   },
  // };
  // return self;
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
  };

  // let loaded_element: TimelessElement | undefined;
  const result = children(props);
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
            if ($elm && typeof $elm.refresh === "function") {
              $elm.refresh(state.children);
            }
          }
        } catch (err) {
          methods.handleError(err);
          throw err;
        }
      }
    });
  }
  // const is_lazy_component =
  //   result instanceof Promise ||
  //   (result && typeof (result as any).then === "function");

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
    render() {
      return $elm;
    },
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
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
