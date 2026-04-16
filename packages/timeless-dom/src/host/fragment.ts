import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";
import { hydrate_node } from "@/renderer/hydrate";

export type DOMFragment = VNodeView<Text> & {
  t: "fragment";
  render(elm: TimelessElement): DocumentFragment;
  hydrate(elm: TimelessElement, $dom: Text): void;
};

export function DOMFragment(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
}): DOMFragment {
  const t = "fragment";
  let $anchor: Text;
  const common$ = HostElement({ $elm: null, t, build: props.build });

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
      $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
      const $fragment = common$.methods.render(elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement | Text) {
      const $anchor = document.createTextNode("");
      common$.methods.set$elm($anchor);
      if (elm.children) {
        const $children = Array.from($elm.childNodes);
        for (let i = 0; i < elm.children.length; i += 1) {
          const child = elm.children[i];
          if (child) {
            hydrate_node(child, $children[i] as HTMLElement | Text);
          }
        }
      }
    },
  };
}

export function isDOMFragment(value: any): value is DOMFragment {
  return value.t === "fragment";
}
