import {
  TimelessElement,
  ViewStyleProperties,
  VNodeView,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";
import { HostElement } from "./box";

export type DOMLabel = VNodeView<HTMLLabelElement> & {
  t: "label";
  render(elm: TimelessElement): HTMLLabelElement;
};

export function DOMLabel(props: {
  build: (elm: TimelessElement) => VNodeView;
}): DOMLabel {
  const t = "label";
  const $elm = document.createElement("label");
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
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    render(elm: TimelessElement) {
      if (elm.state.for) {
        common$.methods.setAttribute("for", elm.state.for);
      }
      common$.methods.setupEventListener(elm.events);
      const $fragment = common$.methods.render(elm.children);
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

export function isDOMLabel(value: any): value is DOMLabel {
  return value.t === "label";
}
