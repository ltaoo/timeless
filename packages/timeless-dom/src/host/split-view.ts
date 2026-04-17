import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

let _splitSeq = 0;

export type DOMSplitView = VNodeView<HTMLDivElement> & {
  t: "split-view";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMSplitView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMSplitView {
  const box$ = HostElement({ $elm: null, t: "split-view", build: props.build });

  return {
    ...box$.methods,
    t: "split-view",
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

      const s = elm.state ?? {};
      const direction = s.direction ?? "horizontal";
      const sizes = s.sizes ?? [50, 50];

      $elm.style.display = "flex";
      $elm.style.flexDirection = direction === "horizontal" ? "row" : "column";

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

export type DOMSplitPane = VNodeView<HTMLDivElement> & {
  t: "split-pane";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMSplitPane(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMSplitPane {
  const box$ = HostElement({ $elm: null, t: "split-pane", build: props.build });

  return {
    ...box$.methods,
    t: "split-pane",
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

      const s = elm.state ?? {};
      const size = s.size ?? 50;

      $elm.style.flex = `${size / 100}`;
      $elm.style.flexShrink = "0";

      if (s.minSize) {
        $elm.style.minWidth = `${s.minSize}px`;
        $elm.style.minHeight = `${s.minSize}px`;
      }
      if (s.maxSize) {
        $elm.style.maxWidth = `${s.maxSize}px`;
        $elm.style.maxHeight = `${s.maxSize}px`;
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

export function isDOMSplitView(value: any): value is DOMSplitView {
  return value?.t === "split-view";
}

export function isDOMSplitPane(value: any): value is DOMSplitPane {
  return value?.t === "split-pane";
}
