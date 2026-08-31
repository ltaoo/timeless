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
  const setupImgEventListener = (
    $elm: HTMLImageElement,
    events: Record<string, any>,
  ) => {
    if (!events) return;
    if (events.onLoad) $elm.addEventListener("load", events.onLoad);
    if (events.onError) $elm.addEventListener("error", events.onError);
  };

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
      setupImgEventListener($elm, props.elm.events as Record<string, any>);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLImageElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      setupImgEventListener($elm, elm.events as Record<string, any>);
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
