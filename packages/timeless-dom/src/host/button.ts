import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMButton = VNodeView<HTMLButtonElement> & {
  t: "button";
  render(elm: TimelessElement): HTMLButtonElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMButton(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLButtonElement>;
}): DOMButton {
  const t = "button" as const;
  const $elm = document.createElement("button");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    t,
    getType() {
      return "button";
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
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    render(elm: TimelessElement) {
      common$.methods.applyState(elm.state, { initial: true });
      const $fragment = common$.methods.render(elm.children);
      common$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
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

export function isDOMButton(value: any): value is DOMButton {
  return value.t === "button";
}
