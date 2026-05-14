import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import {
  HostElement,
  countRenderedNodes,
  insertedAnchor,
  isEmptyNode,
  isFragment,
} from "./box";

const logger = Logger({ prefix: "dom", scope: "show", prefixColor: "#ff6b6b" });

export type DOMShow = VNodeView<Text> & {
  t: "show";
  render(elm: TimelessElement): DocumentFragment;
  // hydrate(elm: TimelessElement, $elm: Text): void;
};

export function DOMShow(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMShow {
  const t = "show";
  const $anchor = document.createTextNode("");
  const box$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "reactive";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $fragment = box$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(
      elm: TimelessElement,
      $elm: HTMLElement | Text,
      opt: { $parent: HTMLElement; offset: number; idx: number },
    ) {
      logger.log("hydrate", elm, opt.$parent, opt.offset, opt.idx);
      const $anchor = document.createTextNode("");
      box$.methods.set$elm($anchor);

      const $v = opt.$parent || $elm;
      const idx = opt.offset;

      const hydrated_child_nodes: (VNodeView | null)[] = [];
      const hydrated_child_elements: (TimelessElement | null)[] = [];

      if ($v && $v instanceof HTMLElement && idx !== undefined) {
        if (elm.children) {
          const total_nodes = countRenderedNodes(elm);
          // console.log("[]show totalNodes", total_nodes);
          const $children = Array.from($v.childNodes) as (HTMLElement | Text)[];

          // const idx = $children.indexOf($elm);
          const $children_belong_me = $children.slice(idx, idx + total_nodes);
          box$.methods.set$childrne($children_belong_me);

          const $last = $children[idx + total_nodes];
          logger.log("find my $children", idx, $children_belong_me, $last);
          if ($last) {
            $v.insertBefore($anchor, $last);
          } else {
            $v.appendChild($anchor);
          }
          let offset = idx;
          let $child_offset = 0;
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            const $child = $children_belong_me[$child_offset] as
              | HTMLElement
              | Text;
            logger.log("each child", i, child, $child, offset);
            if (child) {
              hydrated_child_elements.push(child);
              const child$ = hydrate_node(child, $child, {
                $parent: $v,
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
                hydrated_child_nodes.push(child$);
              }
            }
          }
          box$.methods.setchildnode(hydrated_child_nodes);
          box$.methods.setchildrenelement(hydrated_child_elements);
        }
      }
    },
    getChildren: box$.methods.getChildren,
    buildChildren: box$.methods.buildChildren,
    insertChildren(children: TimelessElement[]) {
      box$.methods.removeChildren();
      box$.methods.insertChildren(children);
    },
    removeChildren() {
      // console.log("[]show remove children");
      box$.methods.removeChildren();
    },
    getParent() {
      return $anchor.parentElement;
    },
  };
}

export function isDOMShow(value: any): value is DOMShow {
  return value.t === "show";
}
