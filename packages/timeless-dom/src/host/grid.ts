import { TimelessElement, VNodeView } from "@timeless/timeless";

import { DOMView } from "./view";

export type DOMGrid = VNodeView<HTMLDivElement> & {
  t: "grid";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMGrid(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMGrid {
  const view$ = DOMView(props);

  return {
    t: "grid",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    setStyle: view$.setStyle,
    setStyleValue: view$.setStyleValue,
    setStyleSet: view$.setStyleSet,
    setAttribute: view$.setAttribute,
    removeAttribute: view$.removeAttribute,
    addEventListener: view$.addEventListener,
    removeEventListener: view$.removeEventListener,
    getBoundingClientRect: view$.getBoundingClientRect,
    render(elm: TimelessElement) {
      const $elm = view$.render(elm);
      if (elm.state) {
        const cols = elm.state.columns ?? 4;
        const gap = elm.state.gap ?? 16;
        $elm.style.display = "grid";
        $elm.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        $elm.style.gap = `${gap}px`;
      }
      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: HTMLDivElement) {
      // view$.hydrate(elm, $dom);
    },
    getChildren: view$.getChildren,
    appendChildren: view$.appendChildren,
    insertChildren: view$.insertChildren,
    removeChildren: view$.removeChildren,
    getParent: view$.getParent,
  };
}

export function isDOMGrid(value: any): value is DOMGrid {
  return value.t === "grid";
}
