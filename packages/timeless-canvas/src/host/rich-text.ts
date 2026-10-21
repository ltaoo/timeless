import {
  parseRichText,
  type RichTextDocument,
  type TimelessElement,
  type VNodeView,
} from "@timeless/timeless";
import { CanvasView } from "./view";
import type { CanvasDocument, CanvasElement } from "./draw";

export function CanvasRichText(props: {
  canvas: CanvasDocument;
  elm: TimelessElement;
  build: (elm: TimelessElement, canvas: CanvasDocument) => VNodeView<any>;
}) {
  const view = CanvasView(props);
  const node = view.$elm as CanvasElement;
  let link_handler = (props.elm.events as any)?.onLinkPress;
  node.tag = "rich-text";
  function set_document(document: RichTextDocument) {
    node.richText = document;
    props.canvas.setTextContent(node, document.text);
  }
  function no_children(): never {
    throw new Error("RichText content is managed by its document");
  }
  return {
    ...view,
    t: "rich-text",
    get$elm() {
      return node;
    },
    getType() {
      return "view" as const;
    },
    getChildren() {
      return [];
    },
    get$children() {
      return [];
    },
    getParent() {
      return node.parentNode;
    },
    setStyleSet(names: string[]) {
      props.canvas.setClassName(node, names.join(" "));
    },
    setAttribute(key: string, value: string) {
      props.canvas.setAttribute(node, key === "n" ? "data-n" : key, value);
    },
    removeAttribute(key: string) {
      props.canvas.removeAttribute(node, key === "n" ? "data-n" : key);
    },
    getBoundingClientRect() {
      return {
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        ...node.rect,
      };
    },
    addEventListener(type: string, handler: any, options?: any) {
      props.canvas.addEventListener(node, type, handler, options);
    },
    removeEventListener(type: string, handler: any, options?: any) {
      props.canvas.removeEventListener(node, type, handler, options);
    },
    hydrate() {
      throw new Error("Canvas RichText cannot hydrate DOM nodes");
    },
    buildChildren: no_children,
    insertChildren: no_children,
    trackChild: no_children,
    removeChildren() {},
    untrackChild() {},
    teardownEventListener(events: any) {
      for (const [key, handler] of Object.entries(events ?? {}))
        if (key !== "onLinkPress" && typeof handler === "function")
          props.canvas.removeEventListener(
            node,
            key === "onDoubleClick" ? "dblclick" : key.slice(2).toLowerCase(),
            handler,
          );
    },
    setupEventListener(events: any) {
      link_handler = events?.onLinkPress;
      for (const [key, handler] of Object.entries(events ?? {}))
        if (key !== "onLinkPress" && typeof handler === "function")
          props.canvas.addEventListener(
            node,
            key === "onDoubleClick" ? "dblclick" : key.slice(2).toLowerCase(),
            handler,
          );
    },
    setDocument: set_document,
    setContent(content: string) {
      set_document(parseRichText(content, props.elm.state.format));
    },
    render() {
      view.render();
      for (const [key, value] of Object.entries(
        props.elm.state.attributes ?? {},
      ))
        props.canvas.setAttribute(
          node,
          key === "n" ? "data-n" : key,
          String(value),
        );
      set_document(
        props.elm.state.document ??
          parseRichText(props.elm.state.content ?? "", props.elm.state.format),
      );
      props.canvas.addEventListener(node, "click", (event: any) => {
        const rect = props.canvas.getBoundingClientRect?.(node) ?? node.rect;
        if (!rect) return;
        const bounds = props.canvas.canvas?.getBoundingClientRect();
        const x =
          (event.offsetX ?? event.clientX - (bounds?.left ?? 0)) - rect.left;
        const y =
          (event.offsetY ?? event.clientY - (bounds?.top ?? 0)) - rect.top;
        const hit = node.richTextLayout?.fragments.find(
          (fragment) =>
            x >= fragment.x &&
            x < fragment.x + fragment.width &&
            y >= fragment.y &&
            y < fragment.y + fragment.height,
        );
        if (hit?.href) link_handler?.(hit.href);
      });
      return node;
    },
  };
}
