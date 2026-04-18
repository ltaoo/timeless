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

const logger = Logger({ prefix: "dom", scope: "portal" });

export type DOMPortal = VNodeView<Text> & {
  t: "portal";
  render(elm: TimelessElement): DocumentFragment;
};

let _hydratePortalCounter = 0;

export function resetPortalCounter() {
  _hydratePortalCounter = 0;
}

export function DOMPortal(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMPortal {
  const t = "portal";
  const $anchor = document.createTextNode("");
  const box$ = HostElement({ $elm: $anchor, t, build: props.build });

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
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      const $fragment = box$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      console.log(
        "[DOMPortal.render] appending to body, children count=",
        $fragment.childNodes.length,
      );
      document.body.appendChild($fragment);
      return $fragment;
    },
    hydrate(
      elm: TimelessElement,
      $dom: any,
      opt: { $parent: HTMLElement; offset: number },
    ) {
      // common$.methods.set$elm($anchor);

      const $v = $dom;
      const idx = 0;

      // Hydrate children against the portal container's child nodes
      const child_nodes: VNodeView<any>[] = [];
      const child_host_nodes: Node[] = [];
      const child_elements: (TimelessElement | null)[] = [];

      if (elm.children) {
        const $children = [
          ...(Array.from(document.body.childNodes) as (HTMLElement | Text)[]),
          // 从 1 开始是为了剔除掉 #root
        ].slice(1);
        const total_nodes = countRenderedNodes(elm);
        const $children_belong_me = $children.slice(idx, idx + total_nodes);
        logger.log(
          "[]children belong me",
          $children,
          $children_belong_me,
          idx,
          total_nodes,
        );
        box$.methods.set$childrne($children_belong_me);
        // const $last = $children[idx + total_nodes];
        // logger.log("find my $children", idx, $children_belong_me, $last);
        // if ($last) {
        //   $v.insertBefore($anchor, $last);
        // } else {
        //   $v.appendChild($anchor);
        // }
        // const child_nodes: VNodeView[] = [];
        let offset = idx;
        let $child_offset = 0;
        for (let i = 0; i < elm.children.length; i += 1) {
          const child = elm.children[i];
          const $child = $children_belong_me[$child_offset] as
            | HTMLElement
            | Text;

          logger.log("each child", i, child, $child, offset);
          if (child) {
            child_elements.push(child);
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
          }
        }
        // box$.methods.setchildnode(child_nodes);
      }
      box$.methods.setchildnode(child_nodes);
      box$.methods.setchildrenelement(child_elements);
      // Append the anchor text node to the container
      // $container.appendChild($anchor);
    },
    removeChildren() {
      const child_nodes = box$.methods.getChildren();
      for (const child of child_nodes) {
        if (child) {
          child.removeChildren();
        }
      }
      const $children = box$.methods.get$children();
      if ($children.length) {
        const $parent = $children[0].parentElement;
        logger.log("remove children", $children, $parent);
        if ($parent) {
          for (let i = 0; i < $children.length; i += 1) {
            const $child = $children[i];
            if ($child && $child.parentElement === $parent) {
              $parent.removeChild($child);
            }
          }
        }
      }
    },
  };
}

export function isDOMPortal(value: any): value is DOMPortal {
  return value.t === "portal";
}
