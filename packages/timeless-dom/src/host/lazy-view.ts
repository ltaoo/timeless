import { isElement, TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMLazyView = VNodeView<Text> & {
  t: "lazy-view";
  replaceChildren(children: (TimelessElement | null)[]): void;
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: Text): void;
};

export function DOMLazyView(props: {
  build: (elm: TimelessElement) => VNodeView;
}): DOMLazyView {
  const t = "lazy-view";
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
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(elm: TimelessElement, $dom: Text) {
      // common$.methods.hydrate(elm, $dom);
    },
    replaceChildren(children: (TimelessElement | null)[]) {
      this.removeChildren();
      const $parent = $anchor.parentElement;
      if (!$parent) {
        console.warn("[]-view parent is null");
        return;
      }
      const $fragment = common$.methods.appendChildren(children);
      $fragment.appendChild($anchor);
      if ($parent) {
        $parent.appendChild($fragment);
      }
      console.log(
        "[timeless-dom]replaceChildren - before handleElementsMounted",
      );
      setTimeout(() => {
        common$.methods.handleElementsMounted();
      }, 0);
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

export function isDOMLazyView(value: any): value is DOMLazyView {
  return value.t === "lazy-view";
}
