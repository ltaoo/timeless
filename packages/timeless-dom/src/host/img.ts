import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMImg = VNodeView<HTMLImageElement> & {
  t: "img";
  setSrc(v: string): void;
  render(): HTMLImageElement;
  hydrate(elm: TimelessElement, $dom: HTMLImageElement): void;
};

export function DOMImg(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}): DOMImg {
  const t = "img";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
      const $elm = document.createElement("img");
      if (props.elm.state.src) {
        $elm.src = props.elm.state.src;
      }
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state);
      box$.methods.setupEventListener(props.elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLImageElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
    setSrc(v: string) {
      const $elm = box$.methods.get$elm();
      if ($elm) {
        $elm.src = v;
      }
    },
  };
}

export function isDOMImg(value: any): value is DOMImg {
  return value.t === "img";
}
