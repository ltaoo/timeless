import {
  View,
  TimelessElement,
  isElement,
  ViewProps,
  ViewChildren,
  TimelessComponent,
} from "./view";
import { defaultErrorView } from "./error-boundary";

export function LazyView(
  props: ViewProps & { placeholder?: ViewChildren } & Record<string, any>,
  children: [TimelessComponent],
): TimelessElement {
  let loadedComponent: TimelessElement | undefined;
  const result = children[0](props);
  if (isElement(result)) {
    loadedComponent = result;
    return result;
  }
  const isLazy =
    result instanceof Promise ||
    (result && typeof (result as any).then === "function");

  const view$ = View(props, props.placeholder);

  const self: TimelessElement = {
    t: "view",
    $elm: view$.$elm,
    render() {
      if (isLazy) {
        const replaceWithError = (err: unknown) => {
          const error = err instanceof Error ? err : new Error(String(err));
          console.error("[LazyView] Error loading async component:", error);
          const renderError = props.ErrorFallback || defaultErrorView;
          const errorView = renderError(error, props.view?.name || "unknown");
          errorView.render();
          if (self.$elm.parentNode) {
            self.$elm.parentNode.replaceChild(errorView.$elm, self.$elm);
          }
          self.$elm = errorView.$elm;
        };
        (result as Promise<any>)
          .then((m) => {
            try {
              const Factory = m.default || m;
              if (typeof Factory === "function") {
                const elm_ = Factory(props);
                if (!elm_) {
                  return;
                }
                loadedComponent = elm_;
                const r = elm_.render();
                view$.$elm.parentNode?.replaceChild(elm_.$elm, view$.$elm);
                view$.$elm = elm_.$elm;
                self.$elm = elm_.$elm;
                if (!r) {
                  return;
                }
                if (props.onMounted) {
                  props.onMounted({ target: elm_.$elm });
                }
              }
            } catch (err) {
              replaceWithError(err);
            }
          })
          .catch(replaceWithError);
      }
      view$.render();
      return view$.$elm;
    },
    beforeUnmounted() {
      if (loadedComponent && loadedComponent.beforeUnmounted) {
        loadedComponent.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (loadedComponent && loadedComponent.onUnmounted) {
        loadedComponent.onUnmounted();
      }
      loadedComponent = undefined;
    },
  };
  return self;
}
