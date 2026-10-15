import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_children } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import { HostElement } from "./box";

const logger = Logger({ prefix: "dom", scope: "view" });

export type DOMForm = VNodeView<HTMLFormElement> & {
  t: "form";
  render(): HTMLFormElement;
  hydrate(elm: TimelessElement, $e: HTMLFormElement): void;
};

export function DOMForm(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLFormElement>;
  elm: TimelessElement;
}): DOMForm {
  const t = "form";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "form";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
      const $elm = document.createElement("form") as HTMLFormElement;
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

export function isDOMForm(
  value: { t?: string } & VNodeView<any>,
): value is DOMForm {
  return value.t === "form" || value.getType() === "form";
}
