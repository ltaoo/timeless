import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMVideo = VNodeView<HTMLVideoElement> & {
  t: "video";
  setSrc(v: string): void;
  render(): HTMLVideoElement;
  hydrate(elm: TimelessElement, $dom: HTMLVideoElement): void;
};

export function DOMVideo(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}): DOMVideo {
  const t = "video";
  const box$ = HostElement({ $elm: null, t, build: props.build });
  const setupVideoEventListener = (
    $elm: HTMLVideoElement,
    events: Record<string, any>,
  ) => {
    if (!events) {
      return;
    }
    const eventMap: [string, string][] = [
      ["onLoad", "load"],
      ["onError", "error"],
      ["onPlay", "play"],
      ["onPause", "pause"],
      ["onEnded", "ended"],
      ["onTimeUpdate", "timeupdate"],
      ["onLoadedMetadata", "loadedmetadata"],
    ];
    for (const [key, type] of eventMap) {
      if (events[key]) {
        $elm.addEventListener(type, events[key]);
      }
    }
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
      const $elm = document.createElement("video");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      if (props.elm.state.src) {
        $elm.src = props.elm.state.src;
      }
      const $children = box$.methods.render(props.elm.children);
      if ($children) {
        $elm.appendChild($children);
      }
      box$.methods.setupEventListener(props.elm.events);
      setupVideoEventListener($elm, props.elm.events as Record<string, any>);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLVideoElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      setupVideoEventListener($elm, elm.events as Record<string, any>);
    },
    setSrc(v: string) {
      const $elm = box$.methods.get$elm();
      if ($elm) {
        $elm.src = v;
      }
    },
  };
}

export function isDOMVideo(value: any): value is DOMVideo {
  return value.t === "video";
}
