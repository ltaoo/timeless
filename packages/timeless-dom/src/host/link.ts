import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";

import { HostElement } from "./box";

export type DOMLink = VNodeView<HTMLAnchorElement> & {
  t: "link";
  render(elm: TimelessElement): HTMLAnchorElement;
  // hydrate(elm: TimelessElement, $e: HTMLAnchorElement): void;
};

export function DOMLink(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLAnchorElement>;
}): DOMLink {
  const t = "link";
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
      const $elm = document.createElement("a");
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });
      if (elm.state.href) {
        $elm.href = elm.state.href;
      }
      if (elm.state.target) {
        $elm.target = elm.state.target;
      }
      if (elm.state.rel) {
        $elm.rel = elm.state.rel;
      }
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement, opt: {}) {
      // console.log("[dom]host/view - hydrate", $elm, elm.state);
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      if (elm.children) {
        const child_nodes: VNodeView[] = [];
        const child_elements: (TimelessElement | null)[] = [];
        const $children = Array.from($elm.childNodes);
        for (let i = 0; i < elm.children.length; i += 1) {
          const child = elm.children[i];
          child_elements.push(child);
          const $child = $children[i] as HTMLElement;
          if (child) {
            const child$ = hydrate_node(child, $child, {
              initial: true,
              $parent: $elm,
              offset: 0,
              idx: i,
            });
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

export function isDOMLink(
  value: { t?: string } & VNodeView<any>,
): value is DOMLink {
  return value.t === "link";
}
