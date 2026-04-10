import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMImg = VNodeView<HTMLImageElement> & {
  t: "img";
  setSrc(v: string): void;
  render(elm: TimelessElement): HTMLImageElement;
  hydrate(elm: TimelessElement, $dom: HTMLImageElement): void;
};

export function DOMImg(props: {
  build: (elm: TimelessElement) => VNodeView;
}): DOMImg {
  const t = "img";
  const $elm = document.createElement("img");
  const common$ = HostElement({ $elm, t, build: props.build });

  const methods = {
    setSrc(v: string) {
      $elm.src = v;
    },
  };

  return {
    t,
    getType() {
      return "view";
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
        methods.setSrc(elm.state.src);
      }
      common$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: HTMLImageElement) {
      // common$.methods.hydrate(elm, $dom);
    },
    getChildren: common$.methods.getChildren,
    appendChildren: common$.methods.appendChildren,
    insertChildren: common$.methods.insertChildren,
    removeChildren: common$.methods.removeChildren,
    getParent() {
      return $elm.parentElement;
    },
    setSrc: methods.setSrc,
  };
}

export function isDOMImg(value: any): value is DOMImg {
  return value.t === "img";
}
