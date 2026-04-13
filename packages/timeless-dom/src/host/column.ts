import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMColumn = VNodeView<HTMLDivElement> & {
  t: "column";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMColumn(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMColumn {
  const box$ = HostElement({ $elm: null, t: "column", build: props.build });

  return {
    ...box$.methods,
    t: "column",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });
      $elm.style.display = "flex";
      $elm.style.flexDirection = "column";
      if (elm.state.gap) {
        $elm.style.gap = `${elm.state.gap}px`;
      }
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMColumn(value: any): value is DOMColumn {
  return value.t === "column";
}
