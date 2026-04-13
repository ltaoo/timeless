import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMView = VNodeView<HTMLDivElement> & {
  t: "view";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $e: HTMLDivElement): void;
};

export function DOMView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
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
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      console.log("[dom]host/view - hydrate", $elm, elm.state);
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      if (elm.children) {
        const child_nodes: VNodeView[] = [];
        const child_elements: (TimelessElement | null)[] = [];
        const $children = Array.from($elm.childNodes);
        for (let i = 0; i < elm.children.length; i += 1) {
          const child = elm.children[i];
          child_elements.push(child);
          if (child) {
            const child$ = hydrate_node(
              child,
              $children[i] as HTMLElement | Text,
            );
            if (child$) {
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
