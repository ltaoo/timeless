import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMScrollView = VNodeView<HTMLDivElement> & {
  t: "scroll-view";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMScrollView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMScrollView {
  const box$ = HostElement({
    $elm: null,
    t: "scroll-view",
    build: props.build,
  });

  return {
    ...box$.methods,
    t: "scroll-view",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      $elm.setAttribute("data-scroll-view", "");
      // $elm.style.cssText = "overflow-y: auto; max-height: 100%;";
      Object.assign(elm.state.style, {
        "overflow-y": "auto",
        "max-height": "100%",
      });

      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });

      // const s = elm.state ?? {};
      // const horizontal = s.horizontal ?? "auto";
      // const vertical = s.vertical ?? "auto";

      // $elm.style.display = "flex";
      // $elm.style.flexDirection = "column";
      // $elm.style.overflow = "auto";

      // if (horizontal === "hidden") {
      //   $elm.style.overflowX = "hidden";
      // } else if (horizontal === "visible") {
      //   $elm.style.overflowX = "visible";
      // }
      // if (vertical === "hidden") {
      //   $elm.style.overflowY = "hidden";
      // } else if (vertical === "visible") {
      //   $elm.style.overflowY = "visible";
      // }

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

export function isDOMScrollView(value: any): value is DOMScrollView {
  return value?.t === "scroll-view";
}
