import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_children } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import { HostElement } from "./box";

const logger = Logger({ prefix: "dom", scope: "fragment" });

export type DOMFragment = VNodeView<Text> & {
  t: "fragment";
  render(): DocumentFragment;
  hydrate(
    elm: TimelessElement,
    $dom: Text,
    opt: { $parent: HTMLElement; offset: number; idx: number },
  ): void;
};

export function DOMFragment(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
  elm: TimelessElement;
}): DOMFragment {
  const t = "fragment";
  let $anchor: Text;
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    get$elm: box$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    render() {
      $anchor = document.createTextNode("");
      box$.methods.set$elm($anchor);
      const $fragment = box$.methods.render(props.elm.children);
      $fragment.appendChild($anchor);
      return $fragment;
    },
    hydrate(
      elm: TimelessElement,
      $elm: HTMLElement | Text,
      opt: { $parent: HTMLElement; offset: number; idx: number },
    ) {
      const parent = opt.$parent;
      const offset = hydrate_children(elm, parent, box$.methods, opt.offset);
      const anchor = document.createTextNode("");
      box$.methods.set$elm(anchor);
      parent.insertBefore(anchor, parent.childNodes[offset] || null);
    },
  };
}

export function isDOMFragment(value: any): value is DOMFragment {
  return value.t === "fragment";
}
