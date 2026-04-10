import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMView = VNodeView<HTMLDivElement> & {
  t: "view";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $e: HTMLDivElement): void;
};

export function CommonFragment() {}

export function DOMView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMView {
  const t = "view";
  let $elm: HTMLDivElement;
  const common$ = HostElement({ $elm: null, t, build: props.build });

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
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    render(elm: TimelessElement) {
      $elm = document.createElement("div");
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
      const $fragment = common$.methods.render(elm.children);
      common$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      console.log("[DOMView] hydrate", elm.children, $elm.childNodes);
      common$.methods.set$elm($elm);
      common$.methods.setupEventListener(elm.events);
      if (!elm.children) {
        return;
      }
      const $children = Array.from($elm.childNodes);
      for (let i = 0; i < elm.children.length; i += 1) {
        const child = elm.children[i];
        if (child) {
          hydrate_node(child, $children[i] as HTMLElement | Text);
        }
      }
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
