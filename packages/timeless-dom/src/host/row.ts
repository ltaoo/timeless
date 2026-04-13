import { TimelessElement, VNodeView } from "@timeless/timeless";

import { DOMView } from "./view";
import { HostElement } from "./box";

export type DOMRow = VNodeView<HTMLDivElement> & {
  t: "row";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMRow(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMRow {
  const box$ = HostElement({ $elm: null, t: "row", build: props.build });

  return {
    ...box$.methods,
    t: "row",
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
      $elm.style.flexDirection = "row";
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

export function isDOMRow(value: any): value is DOMRow {
  return value.t === "row";
}
