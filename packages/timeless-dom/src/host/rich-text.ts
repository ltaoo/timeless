import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMRichText = VNodeView<HTMLDivElement> & {
  t: "rich-text";
  setContent(content: string): void;
  render(): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMRichText(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}): DOMRichText {
  const t = "rich-text";
  const box$ = HostElement({ $elm: null, t, build: props.build });

  const methods = {
    set_content(content: string) {
      const $elm = box$.methods.get$elm();
      if ($elm) {
        $elm.innerHTML = content;
      }
    },
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
    setContent(content: string) {
      methods.set_content(content);
    },
    render() {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      methods.set_content(props.elm.state.content || "");
      box$.methods.setupEventListener(props.elm.events);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMRichText(value: any): value is DOMRichText {
  return value.t === "rich-text";
}
