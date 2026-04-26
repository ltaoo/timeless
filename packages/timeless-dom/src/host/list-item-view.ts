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

const logger = Logger({ prefix: "dom", scope: "list-item-view" });

export type DOMListItemView = VNodeView<HTMLDivElement> & {
  t: "list-item-view";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $e: HTMLDivElement): void;
};

export function DOMListItemView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMListItemView {
  const t = "list-item-view";
  let $elm: any = null;
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return true;
    },
    insertChildren(children: TimelessElement[]) {
      logger.log("insertChildren", children);
      const r = box$.methods.insertChildren(children, { $parent: $elm });
    },
    removeChildren() {
      const r = box$.methods.removeChildren({ $parent: $elm });
    },
    render(elm: TimelessElement) {
      // console.log("[dom]list-item-view - render", elm.state);
      $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });
      $elm.setAttribute("data-list-view-item", "");
      if (elm.state.bound) {
        $elm.style.position = "absolute";
        if (elm.state.top !== undefined) {
          $elm.style.top = `${elm.state.top}px`;
        }
      } else {
        $elm.style.display = "none";
      }
      $elm.style.width = "100%";
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      console.log("[dom]host/view - hydrate", $elm, elm.state);
      box$.methods.set$elm($elm);
      // box$.methods.applyState(elm.state);
      box$.methods.setupEventListener(elm.events);

      const child_nodes: VNodeView[] = [];
      const child_elements: (TimelessElement | null)[] = [];

      if ($elm && elm.children) {
        // const total_nodes = countRenderedNodes(elm);
        const $children = Array.from($elm.childNodes) as (HTMLElement | Text)[];
        let offset = 0;
        for (let i = 0; i < elm.children.length; i += 1) {
          const child = elm.children[i];
          const $child = $children[offset] as HTMLElement | Text;
          child_elements.push(child);

          logger.log("each child", i, child, $child, offset);

          if (child) {
            const child$ = hydrate_node(child, $child, {
              $parent: $elm as HTMLElement,
              offset,
              idx: i,
            });
            // cursor += total_nodes;
            if (child$) {
              if (isEmptyNode(child)) {
              } else if (isFragment(child)) {
                const count_$children = child$.get$children().length;
                offset += count_$children;
                offset += insertedAnchor(child) ? 1 : 0;
                // $child_offset += count_$children;
              } else {
                offset += 1;
                // $child_offset += 1;
              }
              child_nodes.push(child$);
            }
          }
        }
        box$.methods.setchildrenelement(child_elements);
        box$.methods.setchildnode(child_nodes);
      }
    },
  };
}

export function isDOMListItemView(
  value: { t?: string } & VNodeView<any>,
): value is DOMListItemView {
  return value.t === "list-item-view";
}
