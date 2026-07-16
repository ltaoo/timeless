import {
  TimelessElement,
  ViewStyleProperties,
  VNodeView,
} from "@timeless/timeless";

import { viewStyleToCssText } from "./style";
import { HostElement } from "./box";

export type DOMLabel = VNodeView<HTMLLabelElement> & {
  t: "label";
  render(): HTMLLabelElement;
  hydrate(elm: TimelessElement, $dom: HTMLLabelElement): void;
};

export function DOMLabel(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
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
    render() {
      if (props.elm.state.for) {
        common$.methods.setAttribute("for", props.elm.state.for);
      }
      common$.methods.setupEventListener(props.elm.events);
      const $fragment = common$.methods.render(props.elm.children);
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
