import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMView = VNodeView<HTMLDivElement> & {
  t: "view";
  render(elm: TimelessElement): HTMLDivElement;
};

export function CommonFragment() {}

export function DOMView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMView {
  const t = "view";
  const $elm = document.createElement("div");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    t,
    getType() {
      return "view";
    },
    // get $elm() {
    //   return $elm;
    // },
    isDocumentFragment() {
      return true;
    },
    setStyle: common$.methods.setStyle,
    setStyleValue: common$.methods.setStyleValue,
    setStyleSet: common$.methods.setStyleSet,
    setAttribute: common$.methods.setAttribute,
    removeAttribute: common$.methods.removeAttribute,
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    render(elm: TimelessElement) {
      common$.methods.applyState(elm.state);
      const $fragment = common$.methods.render(elm.children);
      common$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
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

export function isDOMView(value: any): value is DOMView {
  return value.t === "view";
}
