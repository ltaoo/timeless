import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMPopper = VNodeView<HTMLDivElement> & {
  t: "popper";
  $elm: HTMLDivElement;
  render(): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMPopper(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
  elm: TimelessElement;
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
    render() {
      if (props.elm.state) {
        common$.methods.setStyle({
          "z-index": props.elm.state.zIndex,
          position: "fixed",
          left: 0,
          top: 0,
          opacity: props.elm.state.placed ? 1 : 0,
          "pointer-events": props.elm.state.placed ? "initial" : "none",
          transform: props.elm.state.placed
            ? `translate3d(${Math.round(props.elm.state.x)}px, ${Math.round(props.elm.state.y)}px, 0)`
            : "translate3d(0, 0, 0)",
        });
      }
      const $fragments = common$.methods.render(props.elm.children);
      $elm.appendChild($fragments);
      common$.methods.setupEventListener(props.elm.events);
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
