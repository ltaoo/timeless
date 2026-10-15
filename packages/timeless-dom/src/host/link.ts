import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_children } from "@/renderer/hydrate";

import { HostElement } from "./box";

export type DOMLink = VNodeView<HTMLAnchorElement> & {
  t: "link";
  render(): HTMLAnchorElement;
  // hydrate(elm: TimelessElement, $e: HTMLAnchorElement): void;
};

export function DOMLink(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLAnchorElement>;
  elm: TimelessElement;
}): DOMLink {
  const t = "link";
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
      const $elm = document.createElement("a");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      if (props.elm.state.href && !props.elm.state.disabled) {
        $elm.href = props.elm.state.href;
      }
      if (props.elm.state.target) {
        $elm.target = props.elm.state.target;
      }
      if (props.elm.state.rel) {
        $elm.rel = props.elm.state.rel;
      }
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

export function isDOMLink(
  value: { t?: string } & VNodeView<any>,
): value is DOMLink {
  return value.t === "link";
}
