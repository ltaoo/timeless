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
    get$elm: common$.methods.get$elm,
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
    setupEventListener() {},
    teardownEventListener() {},
    trackChild: common$.methods.trackChild,
    untrackChild: common$.methods.untrackChild,
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
      const r = common$.methods.buildChildren(children);
      common$.methods.setchildnode(r.child_nodes);
      common$.methods.set$childrne(r.child_host_nodes);
      common$.methods.setchildrenelement(r.child_elements);
      r.$fragment.appendChild($anchor);
      if ($parent) {
        $parent.appendChild(r.$fragment);
      }
      console.log(
        "[timeless-dom]replaceChildren - before handleElementsMounted",
      );
      setTimeout(() => {
        common$.methods.handleElementsMounted();
      }, 0);
    },
    getChildren: common$.methods.getChildren,
    buildChildren: common$.methods.buildChildren,
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
