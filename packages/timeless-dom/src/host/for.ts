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
  swap(from: number, to: number): void;
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
    ...common$.methods,
    t,
    getType() {
      return "reactive";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    insert: common$.methods.insert,
    remove(idx: number, count: number) {
      common$.methods.remove(idx, count);
    },
    refresh: common$.methods.refresh,
    move: common$.methods.move,
    swap: common$.methods.move,
    render(elm: TimelessElement) {
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      // common$.methods.handleElementsMounted();
      return $fragment;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      // console.log("[dom]for hydrate", elm.children);
      const $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
      // const hydrated_elements: (TimelessElement | null)[] = [];
      // const hydrated_child_nodes: VNodeView[] = [];
      if (elm.children) {
        common$.methods.setchildrenelement([...elm.children]);
        const count = elm.children.length;
        const $parent = $elm.parentElement;
        // console.log("[]for check has $parent", $parent, count);
        if ($parent) {
          const $children = Array.from($parent.childNodes);
          const idx = $children.indexOf($elm);
          const $children_belong_me = $children.slice(idx, idx + count + 1);
          // console.log("[]for $children belong me", idx, $children_belong_me);
          common$.methods.set$childrne($children_belong_me);
          const $last = $children_belong_me[$children_belong_me.length];
          if ($last) {
            $parent.insertBefore($anchor, $last);
          } else {
            $parent.appendChild($anchor);
          }
          const child_nodes: VNodeView[] = [];
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
  };
}

export function isDOMFor(value: any): value is DOMFor {
  return value.t === "for";
}
