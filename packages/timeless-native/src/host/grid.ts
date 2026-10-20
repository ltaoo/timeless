import { TimelessElement, VNodeView } from "@timeless/timeless";

import { NativeView } from "./view";
import { setNativeDefaultStyle } from "../stylesheet";

export type NativeGrid = VNodeView<any> & {
  t: "grid";
  render(): any;
};

export function NativeGrid(props: {
  build: (elm: TimelessElement) => VNodeView<any>;
  elm: TimelessElement;
}): NativeGrid {
  const view$ = NativeView(props);

  return {
    ...view$,
    t: "grid",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    setStyle: view$.setStyle,
    setStyleValue: view$.setStyleValue,
    setStyleSet: view$.setStyleSet,
    setAttribute: view$.setAttribute,
    removeAttribute: view$.removeAttribute,
    addEventListener: view$.addEventListener,
    removeEventListener: view$.removeEventListener,
    getBoundingClientRect: view$.getBoundingClientRect,
    render() {
      const $elm = view$.render();

      if (props.elm.state) {
        const cols = props.elm.state.columns ?? 4;
        const gap = props.elm.state.gap ?? 16;
        setNativeDefaultStyle($elm, {
          display: "grid",
          "grid-template-columns": `repeat(${cols}, 1fr)`,
          gap: `${gap}px`,
        });
      }

      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any, opt: any) {
      view$.hydrate(elm, $dom, opt);
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
