import {
  parseRichText,
  type RichTextDocument,
  type TimelessElement,
} from "@timeless/timeless";
import { HostElement } from "./box";
import { requestNativeLayout } from "../stylesheet";

export function NativeRichText(props: {
  elm: TimelessElement;
  build: (elm: TimelessElement) => any;
}) {
  const box = HostElement({ t: "rich-text", $elm: null, build: props.build });
  let link_handler = (props.elm.events as any)?.onLinkPress;
  // Native text leaves carry the same UTF-16 spans on every platform.
  const node = {
    type: "text",
    value: "",
    richText: { text: "", spans: [], html: "" } as RichTextDocument,
    style: {} as Record<string, string>,
    attrs: {} as Record<string, string>,
    children: [],
    listeners: {} as Record<string, any>,
    _onRichTextChange: undefined as
      | undefined
      | ((document: RichTextDocument) => void),
    _onLinkPress: (url: string) => link_handler?.(url),
    _requestLayout: requestNativeLayout,
  };
  function set_document(document: RichTextDocument) {
    node.value = document.text;
    node.richText = document;
    node._onRichTextChange?.(document);
    requestNativeLayout();
  }
  return {
    ...box.methods,
    t: "rich-text",
    get $elm() {
      return node;
    },
    getType() {
      return "view" as const;
    },
    isDocumentFragment() {
      return false;
    },
    setDocument: set_document,
    setupEventListener(events: any) {
      link_handler = events?.onLinkPress;
      box.methods.setupEventListener(events);
    },
    setContent(content: string) {
      set_document(parseRichText(content, props.elm.state.format));
    },
    hydrate() {
      throw new Error("Native RichText cannot hydrate DOM nodes");
    },
    render() {
      box.methods.set$elm(node);
      box.methods.applyState(props.elm.state, { initial: true });
      box.methods.setupEventListener(props.elm.events);
      set_document(
        props.elm.state.document ??
          parseRichText(props.elm.state.content ?? "", props.elm.state.format),
      );
      return node;
    },
  };
}
