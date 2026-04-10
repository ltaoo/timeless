import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMFragment = VNodeView<Text> & {
  t: "fragment";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: Text): void;
};

export function DOMFragment(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMFragment {
  const t = "fragment";
  let $anchor: Text;
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
    addEventListener: common$.methods.addEventListener,
    removeEventListener: common$.methods.removeEventListener,
    getBoundingClientRect: common$.methods.getBoundingClientRect,
    render(elm: TimelessElement) {
      $anchor = document.createTextNode("");
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      if ($elm instanceof Text) {
        return;
      }
      if (!elm.children) {
        return;
      }
      const $children = Array.from($elm.childNodes);
      common$.methods.set$elm($elm);
      for (let i = 0; i < elm.children.length; i += 1) {
        const child = elm.children[i];
        if (child) {
          hydrate_node(child, $children[i] as HTMLElement | Text);
        }
      }
      const $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
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

export function isDOMFragment(value: any): value is DOMFragment {
  return value.t === "fragment";
}
