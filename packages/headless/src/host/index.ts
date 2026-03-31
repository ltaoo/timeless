import { createStubHost } from "./stub";

export type HostNode = any;

export type BoundingRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
};

export type GlobalStylePatch = Partial<{
  cursor: string;
  userSelect: string;
}>;

export type StylePatch = Record<string, string>;

export interface HeadlessHost {
  kind: string;
  createElement(tag: string): HostNode;
  createElementNS?(namespace: string, tag: string): HostNode;
  createTextNode(text: string): HostNode;
  createDocumentFragment(): HostNode;

  appendChild(parent: HostNode, child: HostNode): void;
  removeChild(parent: HostNode, child: HostNode): void;
  insertBefore(parent: HostNode, child: HostNode, before: HostNode | null): void;
  replaceChild(parent: HostNode, newChild: HostNode, oldChild: HostNode): void;
  clearChildren(parent: HostNode): void;

  setAttribute(el: HostNode, name: string, value: string): void;
  removeAttribute(el: HostNode, name: string): void;
  setClassName(el: HostNode, className: string): void;
  setStyleText(el: HostNode, cssText: string): void;
  patchStyle?(el: HostNode, patch: StylePatch): void;
  setTextContent(node: HostNode, text: string): void;
  setInnerHTML?(el: HostNode, html: string): void;
  setProperty?(el: HostNode, key: string, value: any): void;

  addEventListener(
    target: HostNode,
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  removeEventListener(
    target: HostNode,
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;

  addDocumentEventListener?(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  removeDocumentEventListener?(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  patchBodyStyle?(patch: GlobalStylePatch): void;

  setTimeout(handler: () => void, ms: number): any;
  clearTimeout(id: any): void;

  setPointerCapture?(target: HostNode, pointerId: number): void;
  releasePointerCapture?(target: HostNode, pointerId: number): void;
  focus?(target: HostNode): void;
  blur?(target: HostNode): void;

  querySelector?(root: HostNode, selector: string): HostNode | null;
  getBoundingClientRect?(el: HostNode): BoundingRect;
  getViewportSize?(): { width: number; height: number };
  getBody?(): HostNode | null;

  isDocumentFragment(node: HostNode): boolean;
  getChildNodes(node: HostNode): HostNode[];
  getParentNode(node: HostNode): HostNode | null;
  getNextSibling(node: HostNode): HostNode | null;
  getFirstChild(node: HostNode): HostNode | null;
}

let _host: HeadlessHost = createStubHost();
export let isBrowser = _host.kind === "dom";

export function setHost(host: HeadlessHost) {
  _host = host;
  isBrowser = _host.kind === "dom";
}

export function getHost() {
  return _host;
}
