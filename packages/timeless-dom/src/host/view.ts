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

const logger = Logger({ prefix: "dom", scope: "view" });

export type DOMView = VNodeView<HTMLDivElement> & {
  t: "view";
  render(): HTMLDivElement;
  hydrate(elm: TimelessElement, $e: HTMLDivElement): void;
};

export function DOMView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
  elm: TimelessElement;
}): DOMView {
  const t = "view";
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
    render() {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
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

export function isDOMView(
  value: { t?: string } & VNodeView<any>,
): value is DOMView {
  return value.t === "view" || value.getType() === "view";
}
