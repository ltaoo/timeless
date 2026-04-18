import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";

import {
  countRenderedNodes,
  HostElement,
  insertedAnchor,
  isEmptyNode,
  isFragment,
} from "./box";
import { Logger } from "@/util/logger";

const logger = Logger({ prefix: "dom", scope: "for", prefixColor: "#ff6b6b" });

export type DOMFor = VNodeView<Text> & {
  t: "for";
  insert(idx: number, element: (TimelessElement | null)[]): void;
  remove(idx: number, count: number): void;
  refresh(data: {
    children: (TimelessElement | null)[];
    added: { idx: number; elements: (TimelessElement | null)[] }[];
    removed: { idx: number }[];
    moved: { from: number; to: number }[];
  }): void;
  move(from: number, to: number): void;
  swap(from: number, to: number): void;
  render(elm: TimelessElement): DocumentFragment;
};

export function DOMFor(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMFor {
  // const $fragment = document.createDocumentFragment();
  const t = "for";
  const $anchor = document.createTextNode("");
  const box$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "reactive";
    },
    get$elm: box$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    insert(idx: number, children: (TimelessElement<any, any> | null)[]) {
      logger.log("insert", idx, children);
      return box$.methods.insert(idx, children);
    },
    remove(idx: number, count: number) {
      box$.methods.remove(idx, count);
    },
    refresh: box$.methods.refresh,
    move: box$.methods.move,
    swap: box$.methods.move,
    render(elm: TimelessElement) {
      const $fragment = box$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      // common$.methods.handleElementsMounted();
      return $fragment;
    },
    hydrate(
      elm: TimelessElement,
      $elm: HTMLElement | Text,
      opt: { $parent: any; offset: number; idx: number },
    ) {
      logger.log("hydrate", elm, $elm, opt.$parent, opt.offset, opt.idx);
      const $anchor = document.createTextNode("");
      box$.methods.set$elm($anchor);

      const $v = opt.$parent || $elm;
      const idx = opt.offset;
      // const hydrated_elements: (TimelessElement | null)[] = [];
      // const hydrated_child_nodes: VNodeView[] = [];
      if ($v && $v instanceof HTMLElement) {
        if (elm.children) {
          // common$.methods.setchildrenelement([...elm.children]);
          // const count = elm.children.length;
          // const $parent = $elm.parentElement;
          const total_nodes = countRenderedNodes(elm);
          // console.log("[]for check has $parent", $parent, count);
          const $children = Array.from($v.childNodes) as (HTMLElement | Text)[];
          // const idx = $children.indexOf($elm);
          const $children_belong_me = $children.slice(idx, idx + total_nodes);
          box$.methods.set$childrne($children_belong_me);
          const $last = $children[idx + total_nodes];
          logger.log("$children belong me", idx, $children_belong_me, $last);
          const child_nodes: VNodeView[] = [];
          let offset = idx;
          let $child_offset = 0;
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            const prev_child = elm.children[i - 1];
            const $child = $children_belong_me[$child_offset] as
              | HTMLElement
              | Text;

            logger.log("each child", i, child, $child, offset, prev_child);

            if (child) {
              const child$ = hydrate_node(child, $child, {
                $parent: $v as HTMLElement,
                offset,
                idx: i,
              });
              if (child$) {
                if (isEmptyNode(child)) {
                } else if (isFragment(child)) {
                  const count_$children = child$.get$children().length;
                  offset += count_$children;
                  offset += insertedAnchor(child) ? 1 : 0;
                  $child_offset += count_$children;
                } else {
                  offset += 1;
                  $child_offset += 1;
                }
              }
            }
          }
          box$.methods.setchildnode(child_nodes);

          if ($last) {
            $v.insertBefore($anchor, $last);
          } else {
            $v.appendChild($anchor);
          }
        }
      }
    },
  };
}

export function isDOMFor(value: any): value is DOMFor {
  return value.t === "for";
}
