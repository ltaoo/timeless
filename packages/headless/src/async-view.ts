import {
  View,
  TimelessElement,
  isComponent,
  ViewProps,
  TimelessComponent,
} from "./view";

export function AsyncView(
  component: TimelessComponent,
  props: ViewProps & Record<string, any>,
): TimelessElement {
  const result = component(props);
  if (isComponent(result)) {
    return result;
  }
  const view$ = View(props);
  return {
    t: "view",
    $elm: view$.$elm,
    render() {
      if (
        result instanceof Promise ||
        (result && typeof (result as any).then === "function")
      ) {
        (result as Promise<any>).then((m) => {
          const Factory = m.default || m;
          if (typeof Factory === "function") {
            const elm_ = Factory(props);
            if (!elm_) {
              return;
            }
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
      return view$.$elm;
    },
  };
}
