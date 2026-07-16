import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMAudio = VNodeView<HTMLAudioElement> & {
  t: "audio";
  setSrc(v: string): void;
  render(): HTMLAudioElement;
  hydrate(elm: TimelessElement, $dom: HTMLAudioElement): void;
};

export function DOMAudio(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}): DOMAudio {
  const t = "audio";
  const box$ = HostElement({ $elm: null, t, build: props.build });
  const setupAudioEventListener = (
    $elm: HTMLAudioElement,
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
      const $elm = document.createElement("audio");
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
      setupAudioEventListener($elm, props.elm.events as Record<string, any>);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLAudioElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      setupAudioEventListener($elm, elm.events as Record<string, any>);
    },
    setSrc(v: string) {
      const $elm = box$.methods.get$elm();
      if ($elm) {
        $elm.src = v;
      }
    },
  };
}

export function isDOMAudio(value: any): value is DOMAudio {
  return value.t === "audio";
}
