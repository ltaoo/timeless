import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMPortal = VNodeView<Text> & {
  t: "portal";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function DOMPortal(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMPortal {
  const t = "portal";
  const $anchor = document.createTextNode("");
  const common$ = HostElement({ $elm: $anchor, t, build: props.build });

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
    render(elm: TimelessElement) {
      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      document.body.appendChild($fragment);
      return $fragment;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      // common$.methods.hydrate(elm, $dom);
    },
  };
}

export function isDOMPortal(value: any): value is DOMPortal {
  return value.t === "portal";
}
