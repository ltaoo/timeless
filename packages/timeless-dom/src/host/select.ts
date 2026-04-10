import {
  TimelessElement,
  ViewStyleProperties,
  VNodeView,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";
import { HostElement } from "./box";

export type DOMSelect = VNodeView<HTMLDivElement> & {
  t: "select";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMSelect(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMSelect {
  // const canvas = props.canvas;
  // const $elm = canvas.createElement("div");
  const t = "select";
  const $elm = document.createElement("div");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    t,
    getType() {
      return "input";
    },
    // get $elm() {
    //   return $elm;
    // },
    isDocumentFragment() {
      return false;
    },
    setStyle: common$.methods.setStyle,
    setStyleValue: common$.methods.setStyleValue,
    setStyleSet: common$.methods.setStyleSet,
    setAttribute: common$.methods.setAttribute,
    removeAttribute: common$.methods.removeAttribute,
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    render(elm: TimelessElement) {
      $elm.style.backgroundColor = "transparent";
      // $elm.style.outline = "none";
      // $elm.style.border = "none";
      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      // common$.methods.hydrate(elm, $dom);
    },
    getChildren: common$.methods.getChildren,
    appendChildren: common$.methods.appendChildren,
    insertChildren: common$.methods.insertChildren,
    removeChildren: common$.methods.removeChildren,
    getParent() {
      return $elm.parentElement;
    },
  };
}

export function isDOMSelect(value: any): value is DOMSelect {
  return value.t === "select";
}
