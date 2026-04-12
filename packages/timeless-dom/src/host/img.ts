import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMImg = VNodeView<HTMLImageElement> & {
  t: "img";
  setSrc(v: string): void;
  render(elm: TimelessElement): HTMLImageElement;
  hydrate(elm: TimelessElement, $dom: HTMLImageElement): void;
};

export function DOMImg(props: {
  build: (elm: TimelessElement) => VNodeView;
}): DOMImg {
  const t = "img";
  const $elm = document.createElement("img");
  const common$ = HostElement({ $elm, t, build: props.build });

  const methods = {
    setSrc(v: string) {
      $elm.src = v;
    },
  };

  return {
    ...common$.methods,
    t,
    getType() {
      return "view";
    },
    get$elm: common$.methods.get$elm,
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      if (elm.state) {
        methods.setSrc(elm.state.src);
      }
      common$.methods.setupEventListener(elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLImageElement) {
      common$.methods.set$elm($elm);
      common$.methods.setupEventListener(elm.events);
    },
    setSrc: methods.setSrc,
  };
}

export function isDOMImg(value: any): value is DOMImg {
  return value.t === "img";
}
