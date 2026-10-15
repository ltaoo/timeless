import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_children } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import { HostElement } from "./box";

const logger = Logger({ prefix: "dom", scope: "for", prefixColor: "#ff6b6b" });

export type DOMFor = VNodeView<Text> & {
  t: "for";
  insert(idx: number, element: (TimelessElement | null)[]): void;
  remove(idx: number, count: number): void;
  refresh(data: {
    children: (TimelessElement | null)[];
    added: { idx: number; elements: (TimelessElement | null)[] }[];
    removed: { idx: number }[];
    moved: { from: number; to: number }[];
  }): void;
  move(from: number, to: number): void;
  swap(from: number, to: number): void;
  render(): DocumentFragment;
};

export function DOMFor(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
  elm: TimelessElement;
}): DOMFor {
  // const $fragment = document.createDocumentFragment();
  const t = "for";
  const $anchor = document.createTextNode("");
  const box$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "reactive";
    },
    get$elm: box$.methods.get$elm,
    isDocumentFragment() {
      return true;
    },
    insert(idx: number, children: (TimelessElement<any, any> | null)[]) {
      logger.log("insert", idx, children);
      return box$.methods.insert(idx, children);
    },
    remove(idx: number, count: number) {
      box$.methods.remove(idx, count);
    },
    refresh: box$.methods.refresh,
    move: box$.methods.move,
    swap: box$.methods.move,
    render() {
      const $fragment = box$.methods.render(props.elm.children);
      $fragment.appendChild($anchor);
      // common$.methods.handleElementsMounted();
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

export function isDOMFor(value: any): value is DOMFor {
  return value.t === "for";
}
