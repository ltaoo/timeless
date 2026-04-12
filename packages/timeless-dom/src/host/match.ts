import { isElement, TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMMatch = VNodeView<Text> & {
  t: "match";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: Text): void;
};

export function DOMMatch(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMMatch {
  // const $fragment = document.createDocumentFragment();
  const t = "match";
  const $anchor = document.createTextNode("");
  const common$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "reactive";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(elm: TimelessElement, $dom: Text) {
      // common$.methods.hydrate(elm, $dom);
    },
  };
}

export function isDOMMatch(value: any): value is DOMMatch {
  return value.t === "match";
}
