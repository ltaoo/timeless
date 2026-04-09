import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMPortal = VNodeView<Text> & {
  t: "portal";
  render(elm: TimelessElement): DocumentFragment;
};

export function DOMPortal(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMPortal {
  const t = "portal";
  const $anchor = document.createTextNode("");
  const common$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    t,
    getType() {
      return "view";
    },
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
      common$.methods.applyState(elm.state);
      common$.methods.setupEventListener(elm.events);
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      document.body.appendChild($fragment);
      return $fragment;
    },
    getChildren: common$.methods.getChildren,
    appendChildren: common$.methods.appendChildren,
    insertChildren: common$.methods.insertChildren,
    removeChildren: common$.methods.removeChildren,
    getParent() {
      return $anchor.parentElement;
    },
  };
}

export function isDOMPortal(value: any): value is DOMPortal {
  return value.t === "portal";
}
