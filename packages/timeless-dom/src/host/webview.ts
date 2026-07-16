import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMWebview = VNodeView<HTMLDivElement> & {
  t: "webview";
  render(): HTMLDivElement;
  hydrate(elm: TimelessElement, $e: HTMLDivElement): void;
};

export function DOMWebview(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
  elm: TimelessElement;
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
    render() {
      const $elm = document.createElement("iframe");
      if (props.elm.state.href) {
        $elm.src = props.elm.state.href;
      }
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      box$.methods.setupEventListener(props.elm.events);
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
