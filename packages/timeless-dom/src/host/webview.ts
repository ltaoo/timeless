import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMWebview = VNodeView<HTMLDivElement> & {
  t: "webview";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $e: HTMLDivElement): void;
};

export function DOMWebview(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMWebview {
  const t = "webview";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("iframe");
      if (elm.state.href) {
        $elm.src = elm.state.href;
      }
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });
      box$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      console.log("[dom]host/view - hydrate", $elm, elm.state);
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMWebview(
  value: { t?: string } & VNodeView<any>,
): value is DOMWebview {
  return value.t === "view" || value.getType() === "view";
}
