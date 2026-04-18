import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import {
  countRenderedNodes,
  HostElement,
  insertedAnchor,
  isEmptyNode,
  isFragment,
} from "./box";

const logger = Logger({ prefix: "dom", scope: "fragment" });

export type DOMFragment = VNodeView<Text> & {
  t: "fragment";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(
    elm: TimelessElement,
    $dom: Text,
    opt: { $parent: HTMLElement; offset: number; idx: number },
  ): void;
};

export function DOMFragment(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMFragment {
  const t = "fragment";
  let $anchor: Text;
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    get$elm: box$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      $anchor = document.createTextNode("");
      box$.methods.set$elm($anchor);
      const $fragment = box$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(
      elm: TimelessElement,
      $elm: HTMLElement | Text,
      opt: { $parent: HTMLElement; offset: number; idx: number },
    ) {
      logger.log("[hydrate]0", elm, $elm, opt.$parent, opt.offset);
      const $anchor = document.createTextNode("");
      box$.methods.set$elm($anchor);
      const $v = opt.$parent || $elm;
      const idx = opt.offset;

      if ($v && $v instanceof HTMLElement && idx !== undefined) {
        const $children = Array.from($v.childNodes) as (HTMLElement | Text)[];
        const total_nodes = countRenderedNodes(elm);
        const $children_belong_me = $children.slice(idx, idx + total_nodes);
        logger.log("[hydrate]$children", $children_belong_me);

        box$.methods.set$childrne($children_belong_me);
        const child_nodes: (VNodeView<any> | null)[] = [];
        const child_elements: (TimelessElement | null)[] = [];

        if (elm.children) {
          let offset = idx;
          let $child_offset = 0;
          for (let i = 0; i < elm.children.length; i += 1) {
            const child = elm.children[i];
            // const prev_child = elm.children[i - 1];
            const $child = $children_belong_me[$child_offset] as
              | HTMLElement
              | Text;
            logger.log(
              "[hydrate]each child",
              i,
              child,
              $child,
              offset,
              $child_offset,
            );
            child_elements[i] = child;
            if (child) {
              const child$ = hydrate_node(child, $child, {
                $parent: $v as any,
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
              child_nodes[i] = child$;
            }
          }
        }

        box$.methods.setchildnode(child_nodes);
        box$.methods.setchildrenelement(child_elements);
      }

      // // Determine if $elm is a container or the actual child element
      // // If $elm has childNodes matching our totalNodes, it's a container

      // if (totalNodes === 1 && elm.children.length === 1) {
      //   // Single child producing 1 DOM node
      //   const child = elm.children[0];
      //   if (child) {
      //     // If $elm is a container, take its first child; otherwise $elm IS the child element
      //     const $childElm = isContainer
      //       ? ($elm.firstChild as HTMLElement)
      //       : $elm;
      //     const child$ = hydrate_node(child, $childElm, {
      //       $parent: isContainer ? ($elm as HTMLElement) : opt.$parent,
      //     });
      //     if (child$) {
      //       common$.methods.setchildnode([child$]);
      //       common$.methods.setchildrenelement([child]);
      //     }
      //   }
      //   return;
      // }

      // // Multiple children or transparent children - treat $elm as parent container
      // const $parent = $elm || opt.$parent || null;
      // if (!$parent || $parent instanceof Text) return;

      // const $children = Array.from($parent.childNodes);
      // const child_nodes: VNodeView<any>[] = [];
      // const child_elements: (TimelessElement | null)[] = [];
      // for (let i = 0; i < elm.children.length; i += 1) {
      //   const child = elm.children[i];
      //   child_elements[i] = child;
      //   if (child) {
      //     const child$ = hydrate_node(
      //       child,
      //       $children[i] as HTMLElement | Text,
      //       {
      //         $parent,
      //       },
      //     );
      //     if (child$) {
      //       child_nodes[i] = child$;
      //     }
      //   }
      // }
      // common$.methods.setchildnode(child_nodes);
      // common$.methods.setchildrenelement(child_elements);
    },
  };
}

export function isDOMFragment(value: any): value is DOMFragment {
  return value.t === "fragment";
}
