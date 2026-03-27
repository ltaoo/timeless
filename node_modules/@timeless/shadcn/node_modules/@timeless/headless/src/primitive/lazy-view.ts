import {
  View,
  TimelessElement,
  isElement,
  ViewProps,
  ViewChildren,
  TimelessComponent,
} from "./view";

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

  // let view$: TimelessElement;
  // if (isLazy && props.placeholder) {
  //   view$ = View(props, props.placeholder);
  // } else {
  //   view$ = View(props);
  // }
  const view$ = View(props, props.placeholder);

  return {
    t: "view",
    $elm: view$.$elm,
    render() {
      if (isLazy) {
        (result as Promise<any>).then((m) => {
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
            if (!r) {
              return;
            }
            if (props.onMounted) {
              props.onMounted(elm_.$elm);
            }
          }
        });
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
}
