import { TimelessElement, VNodeView } from "@timeless/timeless";

import { NativeView } from "./view";
import { HostElement, BoxMethods } from "./box";

export type NativeGrid = VNodeView<any> & {
  t: "grid";
  render(): any;
};

export function NativeGrid(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeGrid {
  const view$ = NativeView(props);
  const box$ = HostElement({ t: "grid", $elm: null, build: props.build });

  const $elm = {
    type: "grid",
    children: [] as any[],
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    listeners: {} as Record<string, any>,
  };

  const methods: BoxMethods = box$.methods;

  return {
    ...view$,
    t: "grid",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    get$elm: () => $elm,
    setStyle: view$.setStyle,
    setStyleValue: view$.setStyleValue,
    setStyleSet: view$.setStyleSet,
    setAttribute: view$.setAttribute,
    removeAttribute: view$.removeAttribute,
    addEventListener: view$.addEventListener,
    removeEventListener: view$.removeEventListener,
    getBoundingClientRect: view$.getBoundingClientRect,
    render() {
      view$.render();

      if (props.elm.state) {
        const cols = props.elm.state.columns ?? 4;
        const gap = props.elm.state.gap ?? 16;
        $elm.style["display"] = "grid";
        $elm.style["grid-template-columns"] = `repeat(${cols}, 1fr)`;
        $elm.style["gap"] = `${gap}px`;
      }

      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      view$.hydrate(elm, $dom);
    },
    getChildren: view$.getChildren,
    buildChildren: view$.buildChildren,
    insertChildren: view$.insertChildren,
    removeChildren: view$.removeChildren,
    getParent: view$.getParent,
  };
}

export function isNativeGrid(value: any): value is NativeGrid {
  return value.t === "grid";
}
