import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMSelect = VNodeView<HTMLDivElement> & {
  t: "select";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $elm: HTMLElement): void;
};

export function DOMSelect(props: {
  // canvas: Document;
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMSelect {
  // const canvas = props.canvas;
  // const $elm = canvas.createElement("div");
  const t = "select";
  // const $elm = document.createElement("div");
  const common$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...common$.methods,
    t,
    getType() {
      return "input";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      $elm.className = "t-select";
      $elm.style.cssText = `
        display: inline-block;
        border: 1px solid #ccc;
        border-radius: 8px;
        margin: 12px;
        padding: 4px 8px;
        color: #fff;
      `;
      common$.methods.applyState(elm.state, { initial: true });
      const r = common$.methods.buildChildren(elm.children);
      $elm.appendChild(r.$fragment);
      common$.methods.setupEventListener(elm.events);
      const r2 = common$.methods.buildChildren(elm.state.option_elements);
      const $popper_content = document.createElement("div");
      // $popper_content.style.cssText = "padding: 0 8px; background-color: #fff;";
      $popper_content.appendChild(r2.$fragment);
      $elm.addEventListener("click", () => {
        document.body.appendChild($popper_content);
        setTimeout(() => {
          const reference_rect = $elm.getBoundingClientRect();
          // console.log(
          //   "[dom]select place floating - reference_rect",
          //   reference_rect,
          // );
          const popper_content_rect = $popper_content.getBoundingClientRect();
          $popper_content.style.cssText = `
            display: block;
            position: absolute;
            top: ${reference_rect.top + reference_rect.height}px;
            left: ${reference_rect.left}px;
            background-color: #fff;
            border-radius: 8px;
          `;
        }, 0);
      });
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLElement) {
      common$.methods.set$elm($elm);
      common$.methods.applyState(elm.state, { initial: true });
      common$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMSelect(value: any): value is DOMSelect {
  return value.t === "select";
}
