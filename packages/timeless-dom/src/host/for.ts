import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMFor = VNodeView<Text> & {
  t: "for";
  insert(idx: number, element: (TimelessElement | null)[]): void;
  remove(idx: number, count: number): void;
  refresh(data: {
    children: (TimelessElement | null)[];
    added: { idx: number; element: TimelessElement | null }[];
    removed: { idx: number }[];
    moved: { from: number; to: number }[];
  }): void;
  move(from: number, to: number): void;
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMFor(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMFor {
  // const $fragment = document.createDocumentFragment();
  const t = "for";
  const $anchor = document.createTextNode("");
  const common$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    t,
    getType() {
      return "reactive";
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
    insert: common$.methods.insert,
    remove: common$.methods.remove,
    refresh: common$.methods.refresh,
    move: common$.methods.move,
    render(elm: TimelessElement) {
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      // common$.methods.handleElementsMounted();
      return $fragment;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      if ($elm instanceof Text) {
        return;
      }
      const $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
      if (elm.children) {
        const count = elm.children.length;
        const $parent = $elm.parentElement;
        console.log("[]for check has $parent", $parent, count);
        if ($parent) {
          const $children = Array.from($parent.childNodes);
          const idx = $children.indexOf($elm);
          const $children_belong_me = $children.slice(idx, idx + count + 1);
          console.log("[]for $children belong me", idx, $children_belong_me);
          common$.methods.set$childrne($children_belong_me);
          const $last = $children_belong_me[$children_belong_me.length];
          if ($last) {
            $parent.insertBefore($anchor, $last);
          } else {
            $parent.appendChild($anchor);
          }
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            if (child) {
              hydrate_node(child, $children_belong_me[i] as HTMLElement | Text);
            }
          }
        }
      }
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

export function isDOMFor(value: any): value is DOMFor {
  return value.t === "for";
}
