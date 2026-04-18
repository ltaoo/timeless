import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";

import {
  HostElement,
  countRenderedNodes,
  insertedAnchor,
  isEmptyNode,
  isFragment,
} from "./box";
import { Logger } from "@/util/logger";

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
      if ($v && $v instanceof HTMLElement && idx !== undefined) {
        if (elm.children) {
          const total_nodes = countRenderedNodes(elm);
          // console.log("[]show totalNodes", total_nodes);
          const $children = Array.from($v.childNodes) as (HTMLElement | Text)[];
          const is_container = total_nodes > $children.length;

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
          const child_nodes: VNodeView[] = [];
          let offset = idx;
          let $child_offset = 0;
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            const $child = $children_belong_me[$child_offset] as
              | HTMLElement
              | Text;

            logger.log("each child", i, child, $child, offset);
            if (child) {
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
                child_nodes.push(child$);
              }
              // const childNodeCount = countRenderedNodes(child);
              // if (childNodeCount === 0) {
              //   // Child produces 0 DOM nodes (portal, etc.)
              //   const child$ = hydrate_node(child, null as any);
              //   if (child$) {
              //     child_nodes.push(child$);
              //   }
              // } else {
              //   const child$ = hydrate_node(
              //     child,
              //     $children_belong_me[cursor] as HTMLElement | Text,
              //     { $parent },
              //   );
              //   cursor += childNodeCount;
              //   if (child$) {
              //     child_nodes.push(child$);
              //   }
              // }
            }
          }
          box$.methods.setchildnode(child_nodes);

          // if (total_nodes === 0) {
          //   // All children produce 0 DOM nodes (e.g., portal only).
          //   const $parent = $elm ? $elm.parentElement : opt.$parent || null;
          //   if ($parent) {
          //     $parent.appendChild($anchor);
          //   }
          //   const child_nodes: VNodeView[] = [];
          //   for (let i = 0; i < elm.children.length; i += 1) {
          //     const child = elm.children[i];
          //     if (child) {
          //       const child$ = hydrate_node(child, null as any);
          //       if (child$) {
          //         child_nodes.push(child$);
          //       }
          //     }
          //   }
          //   common$.methods.setchildnode(child_nodes);
          //   return;
          // }

          // // Determine if $elm is a container or the actual child element
          // const isContainer =
          //   $elm &&
          //   !($elm instanceof Text) &&
          //   $elm.childNodes.length >= total_nodes;

          // // Check if this show wraps exactly 1 child that produces 1 DOM node
          // if (total_nodes === 1 && elm.children.length === 1) {
          //   const child = elm.children[0];
          //   if (child) {
          //     // If $elm is a container, take its first child; otherwise $elm IS the child element
          //     const $childElm = isContainer
          //       ? ($elm.firstChild as HTMLElement)
          //       : $elm;
          //     const $parent = isContainer ? ($elm as HTMLElement) : opt.$parent;
          //     const child$ = hydrate_node(child, $childElm, { $parent });
          //     if (child$) {
          //       common$.methods.setchildnode([child$]);
          //     }
          //     // Place anchor after the element
          //     const $actualParent = $childElm ? $childElm.parentElement : null;
          //     if ($actualParent && $childElm.nextSibling) {
          //       $actualParent.insertBefore($anchor, $childElm.nextSibling);
          //     } else if ($actualParent) {
          //       $actualParent.appendChild($anchor);
          //     }
          //   }
          //   return;
          // }

          // Multiple children - need to find which DOM nodes belong to this Show
          // const $parent = $elm ? $elm.parentElement : opt.$parent || null;
          // console.log("[]show check has $parent", $parent, total_nodes);
          // if ($parent) {

          // }
        }
      }
    },
    getChildren: box$.methods.getChildren,
    buildChildren: box$.methods.buildChildren,
    insertChildren(children: TimelessElement[]) {
      console.log(
        "[DOMShow.insertChildren] called",
        children.length,
        "anchor in DOM=",
        document.contains($anchor),
        "parentElement=",
        $anchor.parentElement,
      );
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
