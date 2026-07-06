import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_node } from "@/renderer/hydrate";

import { HostElement } from "./box";

export type DOMButton = VNodeView<HTMLButtonElement> & {
  t: "button";
  render(elm: TimelessElement): HTMLButtonElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMButton(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLButtonElement>;
}): DOMButton {
  const t = "button" as const;
  const $elm = document.createElement("button");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "view";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      common$.methods.applyState(elm.state, { initial: true });
      const $fragment = common$.methods.render(elm.children);
      common$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLButtonElement) {
      // console.log("hydrate button element", $elm, elm.events);
      if ($elm.nodeType === 3) {
        return;
      }
      common$.methods.set$elm($elm);
      common$.methods.setupEventListener(elm.events);
      if (elm.children) {
        const child_nodes: VNodeView[] = [];
        const $children = Array.from($elm.childNodes);
        for (let i = 0; i < elm.children.length; i += 1) {
          const child = elm.children[i];
          if (child) {
            const child$ = hydrate_node(
              child,
              $children[i] as HTMLElement | Text,
              {
                $parent: $elm as HTMLElement,
                offset: 0,
                idx: i,
              },
            );
            if (child$) {
              child_nodes.push(child$);
            }
          }
        }
        common$.methods.setchildnode(child_nodes);
      }
    },
  };
}

export function isDOMButton(value: any): value is DOMButton {
  return value.t === "button";
}
