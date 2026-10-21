import {
  TimelessElement,
  VNodeView,
  parseRichText,
  type RichTextDocument,
} from "@timeless/timeless";

import { HostElement } from "./box";

export type DOMRichText = VNodeView<HTMLDivElement> & {
  t: "rich-text";
  setContent(content: string): void;
  setDocument(document: RichTextDocument): void;
  render(): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMRichText(props: {
  build: (elm: TimelessElement) => VNodeView;
  elm: TimelessElement;
}): DOMRichText {
  const t = "rich-text";
  const box$ = HostElement({ $elm: null, t, build: props.build });
  let link_handler = (props.elm.events as any)?.onLinkPress;
  const link_press = (event: Event) => {
    const $elm = box$.methods.get$elm();
    const link = (event.target as Element)?.closest?.("a");
    if (link && $elm?.contains(link) && link_handler) {
      event.preventDefault();
      link_handler(link.getAttribute("href") ?? "");
    }
  };

  const methods = {
    set_document(document: RichTextDocument) {
      const $elm = box$.methods.get$elm();
      if ($elm) {
        $elm.innerHTML = document.html;
      }
    },
  };

  return {
    ...box$.methods,
    setupEventListener(events: any) {
      link_handler = events?.onLinkPress;
      box$.methods.setupEventListener(events);
    },
    t,
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    setContent(content: string) {
      methods.set_document(parseRichText(content, props.elm.state.format));
    },
    setDocument(document: RichTextDocument) {
      methods.set_document(document);
    },
    render() {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });
      methods.set_document(
        props.elm.state.document ??
          parseRichText(props.elm.state.content || "", props.elm.state.format),
      );
      box$.methods.setupEventListener(props.elm.events);
      $elm.addEventListener("click", link_press);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
      link_handler = (elm.events as any)?.onLinkPress;
      $elm.addEventListener("click", link_press);
    },
  };
}

export function isDOMRichText(value: any): value is DOMRichText {
  return value.t === "rich-text";
}
