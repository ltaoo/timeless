import {
  TimelessElement,
  ViewStyleProperties,
  VNodeView,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";
import { HostElement } from "./box";

export type DOMLabel = VNodeView<HTMLLabelElement> & {
  t: "label";
  render(elm: TimelessElement): HTMLLabelElement;
  hydrate(elm: TimelessElement, $dom: HTMLLabelElement): void;
};

export function DOMLabel(props: {
  build: (elm: TimelessElement) => VNodeView;
}): DOMLabel {
  const t = "label";
  const $elm = document.createElement("label");
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
    render(elm: TimelessElement) {
      if (elm.state.for) {
        common$.methods.setAttribute("for", elm.state.for);
      }
      common$.methods.setupEventListener(elm.events);
      const $fragment = common$.methods.render(elm.children);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: HTMLLabelElement) {
      common$.methods.set$elm($dom);
      common$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMLabel(value: any): value is DOMLabel {
  return value.t === "label";
}
