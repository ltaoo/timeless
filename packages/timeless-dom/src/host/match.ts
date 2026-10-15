import { TimelessElement, VNodeView } from "@timeless/timeless";

import { hydrate_children } from "@/renderer/hydrate";
import { Logger } from "@/util/logger";

import { HostElement } from "./box";

const logger = Logger({
  prefix: "dom",
  scope: "match",
  prefixColor: "#ff6b6b",
});

export type DOMMatch = VNodeView<Text> & {
  t: "match";
  render(): DocumentFragment;
  // hydrate(elm: TimelessElement, $elm: Text): void;
};

export function DOMMatch(props: {
  build: (elm: TimelessElement) => VNodeView<Text>;
  elm: TimelessElement;
}): DOMMatch {
  const t = "match";
  const $anchor = document.createTextNode("");
  const box$ = HostElement({ $elm: $anchor, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "reactive";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
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
    getChildren: box$.methods.getChildren,
    buildChildren: box$.methods.buildChildren,
    insertChildren(children: TimelessElement[]) {
      logger.log("before insert children", children);
      // box$.methods.removeChildren();
      box$.methods.insertChildren(children);
    },
    removeChildren() {
      // console.log("[]match remove children");
      box$.methods.removeChildren();
    },
    getParent() {
      return $anchor.parentElement;
    },
  };
}

export function isDOMMatch(value: any): value is DOMMatch {
  return value.t === "match";
}
