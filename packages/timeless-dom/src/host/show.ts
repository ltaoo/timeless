import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";

import { HostElement } from "./box";
import { countRenderedNodes } from "./fragment";

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
    hydrate(
      elm: TimelessElement,
      $elm: HTMLElement | Text,
      opt: Partial<{ $parent: HTMLElement }> = {},
    ) {
      console.log("[timeless-dom] show hydrate", elm, $elm);
      const $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
      if (elm.children) {
        const totalNodes = countRenderedNodes(elm);
        const $parent = $elm
          ? $elm.parentElement
          : opt.$parent || null;
        console.log("[]show check has $parent", $parent, totalNodes);
        if (totalNodes === 0) {
          // All children produce 0 DOM nodes (e.g., portal only).
          // Place anchor in the parent so insertChildren/removeChildren work later.
          if ($parent) {
            $parent.appendChild($anchor);
          }
          const child_nodes: VNodeView[] = [];
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            if (child) {
              const child$ = hydrate_node(child, null as any);
              if (child$) {
                child_nodes.push(child$);
              }
            }
          }
          common$.methods.setchildnode(child_nodes);
          return;
        }
        if ($parent) {
          const child_nodes: VNodeView[] = [];
          const $children = Array.from($parent.childNodes);
          const idx = $children.indexOf($elm);
          const $children_belong_me = $children.slice(idx, idx + totalNodes);
          console.log("[]show $children belong me", idx, $children_belong_me);
          common$.methods.set$childrne($children_belong_me);
          const $last = $children[idx + totalNodes];
          console.log("[]show $children belong me", idx + totalNodes, $last);
          if ($last) {
            console.log("[]show insert before ");
            $parent.insertBefore($anchor, $last);
          } else {
            console.log("[]show append child");
            $parent.appendChild($anchor);
          }
          let cursor = 0;
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            if (child) {
              const childNodeCount = countRenderedNodes(child);
              if (childNodeCount === 0) {
                // Child produces 0 DOM nodes (portal, etc.)
                const child$ = hydrate_node(child, null as any);
                if (child$) {
                  child_nodes.push(child$);
                }
              } else {
                const child$ = hydrate_node(
                  child,
                  $children_belong_me[cursor] as HTMLElement | Text,
                );
                cursor += childNodeCount;
                if (child$) {
                  child_nodes.push(child$);
                }
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
      console.log(
        "[DOMShow.insertChildren] called",
        children.length,
        "anchor in DOM=",
        document.contains($anchor),
        "parentElement=",
        $anchor.parentElement,
      );
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
