import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMPopper = VNodeView<HTMLDivElement> & {
  t: "popper";
  $elm: HTMLDivElement;
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMPopper(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMPopper {
  const t = "popper";
  const $elm = document.createElement("div");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "view";
    },
    get$elm: common$.methods.get$elm,
    get $elm() {
      return $elm;
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      if (elm.state) {
        common$.methods.setStyle({
          "z-index": elm.state.zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: elm.state.placed ? 1 : 0,
          "pointer-event": elm.state.placed ? "initial" : "none",
          transform: elm.state.placed
            ? `translate3d(${Math.round(elm.state.x)}px, ${Math.round(elm.state.y)}px, 0)`
            : "translate3d(0, 0, 0)",
        });
      }
      const $fragments = common$.methods.render(elm.children);
      $elm.appendChild($fragments);
      common$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: HTMLDivElement) {
      // common$.methods.hydrate(elm, $dom);
    },
  };
}

export function isDOMPopper(value: any): value is DOMPopper {
  return value.t === "popper";
}
