import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_children } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import { HostElement } from "./box";

const logger = Logger({ prefix: "dom", scope: "view" });

export type DOMView = VNodeView<HTMLDivElement> & {
  t: "view";
  render(): HTMLDivElement;
  hydrate(elm: TimelessElement, $e: HTMLDivElement): void;
};

export function DOMView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
  elm: TimelessElement;
}): DOMView {
  const t = "view";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return true;
    },
    render() {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      hydrate_children(elm, $elm, box$.methods);
    },
  };
}

export function isDOMView(
  value: { t?: string } & VNodeView<any>,
): value is DOMView {
  return value.t === "view" || value.getType() === "view";
}
