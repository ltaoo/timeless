import {
  isElement,
  isRef,
  TimelessElement,
  ViewStyleProperties,
  VNodeView,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";
import { DOMHostNode } from "./type";
import { HostElement } from "./box";

export type DOMPopper = VNodeView<HTMLDivElement> & {
  t: "popper";
  $elm: HTMLDivElement;
  render(elm: TimelessElement): HTMLDivElement;
};

export function DOMPopper(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMPopper {
  const t = "popper";
  const $elm = document.createElement("div");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    t,
    getType() {
      return "view";
    },
    get $elm() {
      return $elm;
    },
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
      if (elm.state) {
        common$.methods.setStyle({
          "z-index": elm.state.zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: elm.state.placed ? 1 : 0,
          "pointer-event": elm.state.placed ? "initial" : "none",
          transform: elm.state.placed
            ? `translate3d(${Math.round(elm.state.x)}px, ${Math.round(elm.state.y)}px, 0)`
            : "translate3d(0, 0, 0)",
        });
      }
      const $fragments = common$.methods.render(elm.children);
      $elm.appendChild($fragments);
      common$.methods.setupEventListener(elm.events);
      return $elm;
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

export function isDOMPopper(value: any): value is DOMPopper {
  return value.t === "popper";
}
