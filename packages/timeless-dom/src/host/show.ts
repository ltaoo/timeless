import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";

import { HostElement } from "./box";

export type DOMShow = VNodeView<Text> & {
  t: "show";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $elm: Text): void;
};

export function DOMShow(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMShow {
  const t = "show";
  const $anchor = document.createTextNode("");
  const common$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    t,
    getType() {
      return "reactive";
    },
    get$elm: common$.methods.get$elm,
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
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      console.log("[timeless-dom] show hydrate", elm, $elm);
      const $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
      if (elm.children) {
        const count = elm.children.length;
        const $parent = $elm.parentElement;
        console.log("[]show check has $parent", $parent, count);
        if ($parent) {
          const child_nodes: VNodeView[] = [];
          const $children = Array.from($parent.childNodes);
          const idx = $children.indexOf($elm);
          const $children_belong_me = $children.slice(idx, idx + count);
          console.log("[]show $children belong me", idx, $children_belong_me);
          common$.methods.set$childrne($children_belong_me);
          const $last = $children[idx + count];
          console.log("[]show $children belong me", idx + count, $last);
          if ($last) {
            console.log("[]show insert before ");
            $parent.insertBefore($anchor, $last);
          } else {
            console.log("[]show append child");
            $parent.appendChild($anchor);
          }
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            if (child) {
              const child$ = hydrate_node(
                child,
                $children_belong_me[i] as HTMLElement | Text,
              );
              if (child$) {
                child_nodes.push(child$);
              }
            }
          }
          common$.methods.setchildnode(child_nodes);
        }
      }
    },
    getChildren: common$.methods.getChildren,
    buildChildren: common$.methods.buildChildren,
    insertChildren(children: TimelessElement[]) {
      common$.methods.removeChildren();
      common$.methods.insertChildren(children);
    },
    removeChildren() {
      // console.log("[]show remove children");
      common$.methods.removeChildren();
    },
    getParent() {
      return $anchor.parentElement;
    },
  };
}

export function isDOMShow(value: any): value is DOMShow {
  return value.t === "show";
}
