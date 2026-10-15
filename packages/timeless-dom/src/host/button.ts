import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_children } from "@/renderer/hydrate";

import { HostElement } from "./box";

export type DOMButton = VNodeView<HTMLButtonElement> & {
  t: "button";
  render(): HTMLButtonElement;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMButton(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLButtonElement>;
  elm: TimelessElement;
}): DOMButton {
  const t = "button" as const;
  const $elm = document.createElement("button");
  const common$ = HostElement({ $elm, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "view";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    render() {
      common$.methods.applyState(props.elm.state, { initial: true });
      const $fragment = common$.methods.render(props.elm.children);
      common$.methods.setupEventListener(props.elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement) {
      common$.methods.set$elm($elm);
      common$.methods.setupEventListener(elm.events);
      hydrate_children(elm, $elm, common$.methods);
    },
  };
}

export function isDOMButton(value: any): value is DOMButton {
  return value.t === "button";
}
