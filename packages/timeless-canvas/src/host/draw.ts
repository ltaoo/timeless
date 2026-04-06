/**
 * @file canvas 模拟 DOM 实现
 */
import { isRef } from "@timeless/timeless";
import * as ASN from "@timeless/svg/asn";

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

export type _CanvasHostElement = {
  kind: string;
  createElement(tag: string): any;
  createElementNS?(namespace: string, tag: string): any;
  createTextNode(text: string): any;
  createDocumentFragment(): any;
  appendChild(parent: any, child: any): void;
  removeChild(parent: any, child: any): void;
  insertBefore(parent: any, child: any, before: any): void;
  replaceChild(parent: any, newChild: any, oldChild: any): void;
  clearChildren(parent: any): void;
  setAttribute(el: any, name: string, value: string): void;
  removeAttribute(el: any, name: string): void;
  setClassName(el: any, className: string): void;
  setStyleText(el: any, cssText: string): void;
  patchStyle?(el: any, patch: Record<string, string>): void;
  setTextContent(node: any, text: string): void;
  setInnerHTML?(el: any, html: string): void;
  setProperty?(el: any, key: string, value: any): void;
  addEventListener(
    target: any,
    type: string,
    handler: any,
    options?: any,
  ): void;
  removeEventListener(
    target: any,
    type: string,
    handler: any,
    options?: any,
  ): void;
  addDocumentEventListener?(type: string, handler: any, options?: any): void;
  removeDocumentEventListener?(type: string, handler: any, options?: any): void;
  patchBodyStyle?(patch: { cursor?: string; userSelect?: string }): void;
  setTimeout(handler: () => void, ms: number): any;
  clearTimeout(id: any): void;
  setPointerCapture?(target: any, pointerId: number): void;
  releasePointerCapture?(target: any, pointerId: number): void;
  focus?(target: any): void;
  blur?(target: any): void;
  querySelector?(root: any, selector: string): any;
  getBoundingClientRect?(el: any): BoundingRect;
  getViewportSize?(): { width: number; height: number };
  getBody?(): any;
  isDocumentFragment(node: any): boolean;
  getChildNodes(node: any): any[];
  getParentNode(node: any): any;
  getNextSibling(node: any): any;
  getFirstChild(node: any): any;
};

// export type TimelessElement = any;

// const setHost: (host: any) => void = (Timeless as any).setHost;
// const isElement: (v: any) => boolean = (Timeless as any).isElement;
// const isRef: (v: any) => boolean = (Timeless as any).isRef;

export const CANVAS_NODE = Symbol("canvas-node");

export type CanvasNodeKind = "element" | "text" | "fragment";

export type CanvasNode = CanvasElement | CanvasText | CanvasFragment;

export interface BaseCanvasNode<K extends CanvasNodeKind> {
  [CANVAS_NODE]: true;
  kind: K;
  parentNode: CanvasNode | null;
  nextSibling: CanvasNode | null;
  childNodes: CanvasNode[];
  textContent: string;
  appendChild(child: CanvasNode): CanvasNode;
  removeChild(child: CanvasNode): CanvasNode;
  insertBefore(newNode: CanvasNode, refNode: CanvasNode | null): CanvasNode;
  replaceChild(newChild: CanvasNode, oldChild: CanvasNode): void;
  get firstChild(): CanvasNode | null;
}

export interface CanvasAttributes {
  get(name: string): string | null;
  set(name: string, value: string): void;
  delete(name: string): void;
  has(name: string): boolean;
  entries(): IterableIterator<[string, string]>;
}

export interface CanvasElement extends BaseCanvasNode<"element"> {
  tag: string;
  attrs: CanvasAttributes;
  className: string;
  innerHTML: string;
  style: Record<string, any>;
  rect?: BoundingRect;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  addEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  removeEventListener(
    type: string,
    handler: (event: any) => void,
    options?: any,
  ): void;
  clearChildren(): void;
  setStyleSet(value: any): void;
  setStyleValue(styleObj: Record<string, any>): void;
  setTextContent(text: string): void;
  getFirstChild(): CanvasNode | null;
  getNextSibling(): CanvasNode | null;
  getParentNode(): CanvasNode | null;
  clear(
    ctx: CanvasRenderingContext2D,
    options?: {
      dpr?: number;
      clearColor?: string | null | undefined;
      rectCache?: WeakMap<CanvasNode, BoundingRect>;
    },
  ): void;
  draw(
    ctx: CanvasRenderingContext2D,
    options?: {
      dpr?: number;
      rectCache?: WeakMap<CanvasNode, BoundingRect>;
      clearColor?: string | null | undefined;
      clearBeforeDraw?: boolean;
      style?: Record<string, any>;
      text?: string;
    },
  ): void;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  removeAttribute(name: string): void;
}

export interface CanvasText extends BaseCanvasNode<"text"> {}

export interface CanvasFragment extends BaseCanvasNode<"fragment"> {}

export type CreateCanvasHostOptions = {
  canvas?: HTMLCanvasElement | null;
  context?: CanvasRenderingContext2D | null;
  window?: Window;
  dpr?: number;
  clearColor?: string | null;
};

export type CanvasDocument = _CanvasHostElement & {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  body: CanvasElement;
  draw(): void;
  destroy(): void;
  enableDebug(enabled: boolean): void;
  createIcon(
    iconName: string,
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string,
  ): void;
};

export type RenderOptions = Omit<CreateCanvasHostOptions, "canvas"> & {
  onVNodeTreeCreated?: (vnode: any, host: CanvasDocument) => void;
};

export function isCanvasNode(node: any): node is CanvasNode {
  return !!node && node[CANVAS_NODE] === true;
}

export function isCanvasElement(node: any): node is CanvasElement {
  return isCanvasNode(node) && node.kind === "element";
}

function updateSiblings(children: CanvasNode[]) {
  for (let i = 0; i < children.length; i++) {
    children[i].nextSibling = children[i + 1] || null;
  }
}

function createAttributes(): CanvasAttributes {
  const map = new Map<string, string>();
  return {
    get: (name) => map.get(name) ?? null,
    set: (name, value) => map.set(name, value),
    delete: (name) => map.delete(name),
    has: (name) => map.has(name),
    entries: () => map.entries(),
  };
}

export function createCanvasElement(tag: string): CanvasElement {
  const children: CanvasNode[] = [];
  const attrs = createAttributes();

  const node: CanvasElement = {
    [CANVAS_NODE]: true,
    kind: "element",
    tag,
    attrs,
    className: "",
    innerHTML: "",
    style: {},
    rect: undefined,
    get x() {
      return node.rect?.x ?? 0;
    },
    get y() {
      return node.rect?.y ?? 0;
    },
    get width() {
      return node.rect?.width ?? 0;
    },
    get height() {
      return node.rect?.height ?? 0;
    },
    parentNode: null,
    nextSibling: null,
    textContent: "",
    get childNodes() {
      return children;
    },
    get firstChild() {
      return children[0] || null;
    },
    appendChild(child: CanvasNode) {
      if (child.parentNode && child.parentNode !== node) {
        child.parentNode.removeChild(child);
      }
      child.parentNode = node;
      children.push(child);
      updateSiblings(children);
      return child;
    },
    removeChild(child: CanvasNode) {
      const idx = children.indexOf(child);
      if (idx !== -1) {
        children.splice(idx, 1);
        child.parentNode = null;
        updateSiblings(children);
      }
      return child;
    },
    insertBefore(newNode: CanvasNode, refNode: CanvasNode | null) {
      if (!refNode) return node.appendChild(newNode);
      const idx = children.indexOf(refNode);
      if (idx === -1) return node.appendChild(newNode);
      if (newNode.parentNode && newNode.parentNode !== node) {
        newNode.parentNode.removeChild(newNode);
      }
      newNode.parentNode = node;
      children.splice(idx, 0, newNode);
      updateSiblings(children);
      return newNode;
    },
    replaceChild(newChild: CanvasNode, oldChild: CanvasNode) {
      const idx = children.indexOf(oldChild);
      if (idx !== -1) {
        newChild.parentNode = node;
        oldChild.parentNode = null;
        children[idx] = newChild;
        updateSiblings(children);
      }
    },
    addEventListener() {},
    removeEventListener() {},
    clearChildren() {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    },
    setStyleSet(value: any) {
      if (typeof value === "string") {
        node.className = value;
        return;
      }
      if (Array.isArray(value)) {
        node.className = value.join(" ");
        return;
      }
      if (value && typeof value === "object") {
        node.style = { ...value };
      } else {
        node.style = {};
      }
    },
    setStyleValue(styleObj: Record<string, any>) {
      Object.keys(styleObj).forEach((key) => {
        (node.style as any)[key] = styleObj[key];
      });
    },
    setTextContent(text: string) {
      node.textContent = text;
    },
    getFirstChild() {
      return node.firstChild;
    },
    getNextSibling() {
      return node.nextSibling;
    },
    getParentNode() {
      return node.parentNode;
    },
    clear(
      ctx: CanvasRenderingContext2D,
      options?: {
        dpr?: number;
        clearColor?: string | null | undefined;
        rectCache?: WeakMap<CanvasNode, BoundingRect>;
      },
    ) {
      const rect = getComputedRect(node, options?.rectCache);
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      const dpr = options?.dpr ?? inferCanvasDpr(ctx);
      clearRectRegion(ctx, rect, options?.clearColor, dpr);
    },
    draw(
      ctx: CanvasRenderingContext2D,
      options?: {
        dpr?: number;
        rectCache?: WeakMap<CanvasNode, BoundingRect>;
        clearColor?: string | null | undefined;
        clearBeforeDraw?: boolean;
        style?: Record<string, any>;
        text?: string;
      },
    ) {
      const rectCache = options?.rectCache;
      const rect = getComputedRect(node, rectCache);
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      const dpr = options?.dpr ?? inferCanvasDpr(ctx);

      if (options?.clearBeforeDraw) {
        clearRectRegion(ctx, rect, options?.clearColor, dpr);
      }

      const prevStyle = node.style;
      const prevText = node.textContent;
      if (options?.style) node.style = { ...node.style, ...options.style };
      if (options?.text !== undefined) node.textContent = options.text;
      try {
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.beginPath();
        ctx.rect(rect.left, rect.top, rect.width, rect.height);
        ctx.clip();
        const displayList: DrawCommand[] = [];
        recordNodeToDisplayList(node, rectCache, 1, displayList);
        executeDisplayList(ctx, displayList);
        ctx.restore();
      } finally {
        node.style = prevStyle;
        node.textContent = prevText;
      }
    },
    setAttribute(name: string, value: string) {
      attrs.set(name, value);
    },
    getAttribute(name: string) {
      return attrs.get(name);
    },
    removeAttribute(name: string) {
      attrs.delete(name);
    },
  };

  return node;
}

export function createCanvasText(text: string): CanvasText {
  const node: CanvasText & {
    setTextContent?: (text: string) => void;
    getFirstChild?: () => CanvasNode | null;
    getNextSibling?: () => CanvasNode | null;
    getParentNode?: () => CanvasNode | null;
    addContent?: (
      newTargetChildren: any[],
      onMounted: any,
      updateState: (newNodes: any[], newInstances: any[]) => void,
    ) => void;
    buildInitialContent?: (
      targetChildren: any[],
      onMounted: any,
      updateState: (newNodes: any[], newInstances: any[]) => void,
    ) => any;
    removeContent?: (
      oldChildren: any[],
      oldNodes: any[],
      updateState: () => void,
    ) => void;
  } = {
    [CANVAS_NODE]: true,
    kind: "text",
    parentNode: null,
    nextSibling: null,
    childNodes: [],
    textContent: text,
    get firstChild() {
      return null;
    },
    appendChild() {
      return node;
    },
    removeChild() {
      return node;
    },
    insertBefore() {
      return node;
    },
    replaceChild() {},
    setTextContent(text: string) {
      node.textContent = text;
    },
    getFirstChild() {
      return null;
    },
    getNextSibling() {
      return node.nextSibling;
    },
    getParentNode() {
      return node.parentNode;
    },
    addContent(
      newTargetChildren: any[],
      onMounted: any,
      updateState: (newNodes: any[], newInstances: any[]) => void,
    ) {
      const parent = node.parentNode;
      if (!parent) return;

      // 1. 准备新内容
      const newNodes: any[] = [];
      const newInstances: any[] = [];

      for (let item of newTargetChildren) {
        if (item === null || item === undefined) continue;
        if (typeof item === "function") {
          item = item();
        }

        if (item && typeof item.render === "function") {
          const result = item.render();
          newInstances.push(item);
          if (result) {
            if (result.kind === "fragment") {
              newNodes.push(...result.childNodes);
            } else {
              newNodes.push(result);
            }
          }
        } else if (typeof item === "string" || typeof item === "number") {
          const textNode = createCanvasText(String(item));
          newNodes.push(textNode);
        }
      }

      // 2. 插入新内容到 anchor 之前
      for (let i = newNodes.length - 1; i >= 0; i--) {
        parent.insertBefore(newNodes[i], node);
      }

      // 3. 更新状态
      updateState(newNodes, newInstances);

      // 4. 调用新内容的 onMounted
      if (onMounted) {
        onMounted({ target: node });
      }
      for (const child of newInstances) {
        if (child && typeof child.onMounted === "function") {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    buildInitialContent(
      targetChildren: any[],
      onMounted: any,
      updateState: (newNodes: any[], newInstances: any[]) => void,
    ) {
      // 1. 准备新内容
      const fragment = createCanvasFragment();
      const newNodes: any[] = [];
      const newInstances: any[] = [];

      for (let item of targetChildren) {
        if (item === null || item === undefined) continue;
        if (typeof item === "function") {
          item = item();
        }

        if (item && typeof item.render === "function") {
          const result = item.render();
          newInstances.push(item);
          if (result) {
            if (result.kind === "fragment") {
              newNodes.push(...result.childNodes);
              for (const child of result.childNodes) {
                fragment.appendChild(child);
              }
            } else {
              newNodes.push(result);
              fragment.appendChild(result);
            }
          }
        } else if (typeof item === "string" || typeof item === "number") {
          const textNode = createCanvasText(String(item));
          fragment.appendChild(textNode);
          newNodes.push(textNode);
        }
      }

      // 2. 将 anchor 添加到 fragment
      fragment.appendChild(node);

      // 3. 更新状态
      updateState(newNodes, newInstances);

      // 4. 调用新内容的 onMounted
      if (onMounted) {
        onMounted({ target: node });
      }
      for (const child of newInstances) {
        if (child && typeof child.onMounted === "function") {
          child.onMounted({ target: child.$elm });
        }
      }

      return fragment;
    },
    removeContent(
      oldChildren: any[],
      oldNodes: any[],
      updateState: () => void,
    ) {
      // 1. 调用旧内容的 beforeUnmounted
      for (const child of oldChildren) {
        if (child && typeof child.beforeUnmounted === "function") {
          child.beforeUnmounted();
        }
      }

      // 2. 移除旧内容的 DOM
      for (const oldNode of oldNodes) {
        if (oldNode && oldNode.parentNode) {
          oldNode.parentNode.removeChild(oldNode);
        }
      }

      // 3. 调用旧内容的 onUnmounted
      for (const child of oldChildren) {
        if (child) {
          if (child.t === "portal" && typeof child.cleanup === "function") {
            child.cleanup();
          } else if (typeof child.onUnmounted === "function") {
            child.onUnmounted();
          }
        }
      }

      // 4. 更新状态
      updateState();
    },
  };
  return node;
}

export function createCanvasFragment(): CanvasFragment {
  const children: CanvasNode[] = [];

  const node: CanvasFragment & {
    clearChildren?: () => void;
    getFirstChild?: () => CanvasNode | null;
    getNextSibling?: () => CanvasNode | null;
    getParentNode?: () => CanvasNode | null;
    addContent?: (
      newTargetChildren: any[],
      onMounted: any,
      updateState: (newNodes: any[], newInstances: any[]) => void,
    ) => void;
    buildInitialContent?: (
      targetChildren: any[],
      onMounted: any,
      updateState: (newNodes: any[], newInstances: any[]) => void,
    ) => any;
    removeContent?: (
      oldChildren: any[],
      oldNodes: any[],
      updateState: () => void,
    ) => void;
  } = {
    [CANVAS_NODE]: true,
    kind: "fragment",
    parentNode: null,
    nextSibling: null,
    textContent: "",
    get childNodes() {
      return children;
    },
    get firstChild() {
      return children[0] || null;
    },
    appendChild(child: CanvasNode) {
      if (child.parentNode && child.parentNode !== node) {
        child.parentNode.removeChild(child);
      }
      child.parentNode = node;
      children.push(child);
      updateSiblings(children);
      return child;
    },
    removeChild(child: CanvasNode) {
      const idx = children.indexOf(child);
      if (idx !== -1) {
        children.splice(idx, 1);
        child.parentNode = null;
        updateSiblings(children);
      }
      return child;
    },
    insertBefore(newNode: CanvasNode, refNode: CanvasNode | null) {
      if (!refNode) return node.appendChild(newNode);
      const idx = children.indexOf(refNode);
      if (idx === -1) return node.appendChild(newNode);
      if (newNode.parentNode && newNode.parentNode !== node) {
        newNode.parentNode.removeChild(newNode);
      }
      newNode.parentNode = node;
      children.splice(idx, 0, newNode);
      updateSiblings(children);
      return newNode;
    },
    replaceChild(newChild: CanvasNode, oldChild: CanvasNode) {
      const idx = children.indexOf(oldChild);
      if (idx !== -1) {
        newChild.parentNode = node;
        oldChild.parentNode = null;
        children[idx] = newChild;
        updateSiblings(children);
      }
    },
    clearChildren() {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    },
    getFirstChild() {
      return node.firstChild;
    },
    getNextSibling() {
      return node.nextSibling;
    },
    getParentNode() {
      return node.parentNode;
    },
    addContent(
      newTargetChildren: any[],
      onMounted: any,
      updateState: (newNodes: any[], newInstances: any[]) => void,
    ) {
      const parent = node.parentNode;
      if (!parent) return;

      // 1. 准备新内容
      const newNodes: any[] = [];
      const newInstances: any[] = [];

      for (let item of newTargetChildren) {
        if (item === null || item === undefined) continue;
        if (typeof item === "function") {
          item = item();
        }

        if (item && typeof item.render === "function") {
          const result = item.render();
          newInstances.push(item);
          if (result) {
            if (result.kind === "fragment") {
              newNodes.push(...result.childNodes);
            } else {
              newNodes.push(result);
            }
          }
        } else if (typeof item === "string" || typeof item === "number") {
          const textNode = createCanvasText(String(item));
          newNodes.push(textNode);
        }
      }

      // 2. 插入新内容到 fragment 之前
      for (let i = newNodes.length - 1; i >= 0; i--) {
        parent.insertBefore(newNodes[i], node);
      }

      // 3. 更新状态
      updateState(newNodes, newInstances);

      // 4. 调用新内容的 onMounted
      if (onMounted) {
        onMounted({ target: node });
      }
      for (const child of newInstances) {
        if (child && typeof child.onMounted === "function") {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    buildInitialContent(
      targetChildren: any[],
      onMounted: any,
      updateState: (newNodes: any[], newInstances: any[]) => void,
    ) {
      // 1. 准备新内容
      const resultFragment = createCanvasFragment();
      const newNodes: any[] = [];
      const newInstances: any[] = [];

      for (let item of targetChildren) {
        if (item === null || item === undefined) continue;
        if (typeof item === "function") {
          item = item();
        }

        if (item && typeof item.render === "function") {
          const result = item.render();
          newInstances.push(item);
          if (result) {
            if (result.kind === "fragment") {
              newNodes.push(...result.childNodes);
              for (const child of result.childNodes) {
                resultFragment.appendChild(child);
              }
            } else {
              newNodes.push(result);
              resultFragment.appendChild(result);
            }
          }
        } else if (typeof item === "string" || typeof item === "number") {
          const textNode = createCanvasText(String(item));
          resultFragment.appendChild(textNode);
          newNodes.push(textNode);
        }
      }

      // 2. 将 anchor (fragment) 添加到结果
      resultFragment.appendChild(node);

      // 3. 更新状态
      updateState(newNodes, newInstances);

      // 4. 调用新内容的 onMounted
      if (onMounted) {
        onMounted({ target: node });
      }
      for (const child of newInstances) {
        if (child && typeof child.onMounted === "function") {
          child.onMounted({ target: child.$elm });
        }
      }

      return resultFragment;
    },
    removeContent(
      oldChildren: any[],
      oldNodes: any[],
      updateState: () => void,
    ) {
      // 1. 调用旧内容的 beforeUnmounted
      for (const child of oldChildren) {
        if (child && typeof child.beforeUnmounted === "function") {
          child.beforeUnmounted();
        }
      }

      // 2. 移除旧内容的 DOM
      for (const oldNode of oldNodes) {
        if (oldNode && oldNode.parentNode) {
          oldNode.parentNode.removeChild(oldNode);
        }
      }

      // 3. 调用旧内容的 onUnmounted
      for (const child of oldChildren) {
        if (child) {
          if (child.t === "portal" && typeof child.cleanup === "function") {
            child.cleanup();
          } else if (typeof child.onUnmounted === "function") {
            child.onUnmounted();
          }
        }
      }

      // 4. 更新状态
      updateState();
    },
  };

  return node;
}

type Point = { x: number; y: number };

function parseNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  const num = Number.parseFloat(v);
  return Number.isFinite(num) ? num : null;
}

function parseLength(value: any, parentSize: number | null): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v) return null;
  if (v.endsWith("px")) {
    const n = Number.parseFloat(v.slice(0, -2));
    return Number.isFinite(n) ? n : null;
  }
  if (v.endsWith("%") && parentSize !== null) {
    const n = Number.parseFloat(v.slice(0, -1));
    if (!Number.isFinite(n)) return null;
    return (parentSize * n) / 100;
  }
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function cssKeyToCamel(key: string) {
  return key
    .trim()
    .toLowerCase()
    .replace(/-([a-z])/g, (_, c) => String(c).toUpperCase());
}

function parseCssText(cssText: string): Record<string, any> {
  const out: Record<string, any> = { cssText };
  const parts = cssText.split(";");
  for (const part of parts) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const rawKey = part.slice(0, idx).trim();
    if (!rawKey) continue;
    const rawValue = part.slice(idx + 1).trim();
    if (!rawValue) continue;
    const key = cssKeyToCamel(rawKey);
    out[key] = rawValue;
  }
  return out;
}

function styleGet(el: CanvasElement, key: string): any {
  return (el.style as any)?.[key];
}

function styleGetFirst(el: CanvasElement, keys: string[]): any {
  for (const k of keys) {
    const v = styleGet(el, k);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function isHiddenByOpacity(el: CanvasElement): boolean {
  const opacity = parseNumber(styleGet(el, "opacity")) ?? 1;
  return opacity <= 0;
}

function resolveGridColumns(el: CanvasElement): number {
  const raw =
    styleGetFirst(el, ["gridColumns", "columns"]) ??
    styleGet(el, "gridTemplateColumns");
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const m1 = /repeat\(\s*(\d+)/i.exec(raw);
    if (m1) {
      const n = Number.parseInt(m1[1], 10);
      if (Number.isFinite(n)) return n;
    }
    const m2 = /(\d+)/.exec(raw);
    if (m2) {
      const n = Number.parseInt(m2[1], 10);
      if (Number.isFinite(n)) return n;
    }
  }
  return 4;
}

function resolveGridGap(el: CanvasElement): number {
  const raw = styleGetFirst(el, ["gap", "gridGap", "rowGap", "columnGap"]);
  return parseLength(raw, null) ?? 0;
}

function resolveFont(el: CanvasElement): string {
  const font = styleGet(el, "font");
  if (typeof font === "string" && font.trim()) return font;

  const fontSize = parseNumber(styleGet(el, "fontSize")) ?? 16;
  const fontFamily = styleGet(el, "fontFamily") ?? "sans-serif";
  const fontWeight = styleGet(el, "fontWeight");
  const prefix =
    fontWeight === undefined || fontWeight === null || fontWeight === ""
      ? ""
      : `${String(fontWeight)} `;
  return `${prefix}${fontSize}px ${fontFamily}`;
}

function resolveFontSize(el: CanvasElement, font: string): number {
  const fontSize = parseNumber(styleGet(el, "fontSize"));
  if (fontSize !== null) return fontSize;
  const m = /(\d+(?:\.\d+)?)px/.exec(font);
  const n = m ? Number.parseFloat(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 16;
}

function resolveLineHeightPx(el: CanvasElement, fontSize: number): number {
  const raw = styleGet(el, "lineHeight");
  const n = parseNumber(raw);
  if (n === null) return fontSize * 1.4;
  if (n <= 10) return fontSize * n;
  return n;
}

function hasExplicitLengthStyle(
  el: CanvasElement,
  keys: string[],
  attrs?: string[],
) {
  if (styleGetFirst(el, keys) !== undefined) return true;
  if (attrs) {
    for (const a of attrs) {
      const v = el.getAttribute(a);
      if (v !== null && v !== "") return true;
    }
  }
  return false;
}

function resolveRect(
  node: CanvasElement,
  parentRect: BoundingRect | null,
): BoundingRect {
  const parentWidth = parentRect ? parentRect.width : null;
  const parentHeight = parentRect ? parentRect.height : null;

  const left =
    parseLength(styleGetFirst(node, ["left", "x"]), parentWidth) ?? 0;
  const top = parseLength(styleGetFirst(node, ["top", "y"]), parentHeight) ?? 0;

  const widthFromStyle =
    parseLength(styleGet(node, "width"), parentWidth) ??
    parseLength(node.getAttribute("width"), parentWidth);
  const heightFromStyle =
    parseLength(styleGet(node, "height"), parentHeight) ??
    parseLength(node.getAttribute("height"), parentHeight);

  const width = widthFromStyle ?? 0;
  const height = heightFromStyle ?? 0;

  const x = (parentRect?.left ?? 0) + left;
  const y = (parentRect?.top ?? 0) + top;

  return {
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    width,
    height,
    x,
    y,
  };
}

function getComputedRect(
  node: CanvasElement,
  rectCache?: WeakMap<CanvasNode, BoundingRect>,
): BoundingRect | null {
  if (!rectCache && node.rect) return node.rect;
  const cached = rectCache?.get(node);
  if (cached) {
    node.rect = cached;
    return cached;
  }

  const chain: CanvasElement[] = [];
  let cur: CanvasNode | null = node.parentNode;
  while (cur) {
    if (cur.kind === "element") chain.push(cur);
    cur = cur.parentNode;
  }

  let parentRect: BoundingRect | null = null;
  for (let i = chain.length - 1; i >= 0; i--) {
    const el = chain[i];
    const hit = rectCache?.get(el);
    const nextRect: BoundingRect = hit ?? resolveRect(el, parentRect);
    rectCache?.set(el, nextRect);
    el.rect = nextRect;
    parentRect = nextRect;
  }

  const nextRect: BoundingRect = resolveRect(node, parentRect);
  rectCache?.set(node, nextRect);
  node.rect = nextRect;
  return nextRect;
}

function containsPoint(rect: BoundingRect, p: Point) {
  return (
    p.x >= rect.left &&
    p.x <= rect.right &&
    p.y >= rect.top &&
    p.y <= rect.bottom
  );
}

function pickNodeAtPoint(
  root: CanvasNode,
  point: Point,
  rectCache: WeakMap<CanvasNode, BoundingRect>,
): CanvasNode | null {
  if (root.kind === "element") {
    if (isHiddenByOpacity(root)) return null;
    const children = root.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
      const hit = pickNodeAtPoint(children[i], point, rectCache);
      if (hit) return hit;
    }
    const rect = rectCache.get(root);
    if (!rect) return null;
    if (rect.width <= 0 || rect.height <= 0) return null;
    return containsPoint(rect, point) ? root : null;
  }

  if (root.kind === "fragment") {
    const children = root.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
      const hit = pickNodeAtPoint(children[i], point, rectCache);
      if (hit) return hit;
    }
    return null;
  }

  return null;
}

type AnyEventHandler = (event: any) => void;

function normalizeCapture(options?: any) {
  if (typeof options === "boolean") return options;
  return !!options?.capture;
}

function computeEventPoint(canvas: HTMLCanvasElement, event: any): Point {
  if (
    typeof event?.offsetX === "number" &&
    typeof event?.offsetY === "number"
  ) {
    return { x: event.offsetX, y: event.offsetY };
  }
  const rect = canvas.getBoundingClientRect();
  const clientX =
    typeof event?.clientX === "number" ? event.clientX : rect.left;
  const clientY = typeof event?.clientY === "number" ? event.clientY : rect.top;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function createEventProxy(event: any, currentTarget: any, target: any) {
  return new Proxy(event, {
    get(_t, prop) {
      if (prop === "currentTarget") return currentTarget;
      if (prop === "target") return target;
      if (prop === "stopPropagation") {
        return () => event.stopPropagation?.();
      }
      if (prop === "stopImmediatePropagation") {
        return () => event.stopImmediatePropagation?.();
      }
      if (prop === "preventDefault") {
        return () => event.preventDefault?.();
      }
      return Reflect.get(event, prop);
    },
  });
}

function shouldClear(
  ctx: CanvasRenderingContext2D,
  clearColor: string | null | undefined,
) {
  if (clearColor === null) return false;
  if (clearColor === undefined) return true;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = clearColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
  return false;
}

function applyCanvasSizing(
  canvas: HTMLCanvasElement,
  dpr: number,
): { width: number; height: number; resized: boolean } {
  const prevW = canvas.width;
  const prevH = canvas.height;
  const rect =
    typeof canvas.getBoundingClientRect === "function"
      ? canvas.getBoundingClientRect()
      : null;
  const cssWidth =
    canvas.clientWidth ||
    rect?.width ||
    parseNumber(canvas.getAttribute("width")) ||
    canvas.width / dpr ||
    0;
  const cssHeight =
    canvas.clientHeight ||
    rect?.height ||
    parseNumber(canvas.getAttribute("height")) ||
    canvas.height / dpr ||
    0;

  const width = Math.max(0, cssWidth);
  const height = Math.max(0, cssHeight);
  const nextW = Math.max(1, Math.round(width * dpr));
  const nextH = Math.max(1, Math.round(height * dpr));

  if (canvas.width !== nextW) canvas.width = nextW;
  if (canvas.height !== nextH) canvas.height = nextH;

  return {
    width,
    height,
    resized: canvas.width !== prevW || canvas.height !== prevH,
  };
}

function inferCanvasDpr(ctx: CanvasRenderingContext2D): number {
  const canvas = ctx.canvas;
  const rect =
    typeof canvas.getBoundingClientRect === "function"
      ? canvas.getBoundingClientRect()
      : null;
  const cssWidth = canvas.clientWidth || rect?.width || 0;
  const cssHeight = canvas.clientHeight || rect?.height || 0;
  const dprW = cssWidth > 0 ? canvas.width / cssWidth : 0;
  const dprH = cssHeight > 0 ? canvas.height / cssHeight : 0;
  const v = dprW || dprH || 1;
  return Number.isFinite(v) && v > 0 ? v : 1;
}

type DrawCommand =
  | { op: "save" }
  | { op: "restore" }
  | { op: "setGlobalAlpha"; alpha: number }
  | { op: "setFillStyle"; value: string }
  | { op: "setStrokeStyle"; value: string }
  | { op: "setLineWidth"; value: number }
  | { op: "fillRect"; x: number; y: number; w: number; h: number }
  | { op: "strokeRect"; x: number; y: number; w: number; h: number }
  | { op: "setFont"; value: string }
  | { op: "setTextAlign"; value: CanvasTextAlign }
  | { op: "setTextBaseline"; value: CanvasTextBaseline }
  | { op: "fillText"; text: string; x: number; y: number }
  | {
      op: "drawImage";
      image: HTMLImageElement;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  | {
      op: "drawIcon";
      iconName: string;
      color?: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };

function recordNodeToDisplayList(
  node: CanvasNode,
  rectCache: WeakMap<CanvasNode, BoundingRect> | undefined,
  parentAlpha: number,
  out: DrawCommand[],
) {
  if (node.kind === "element") {
    const rect = rectCache?.get(node) ?? node.rect;
    if (!rect) return;

    const opacity = parseNumber(styleGet(node, "opacity")) ?? 1;
    const alpha = parentAlpha * opacity;
    if (alpha <= 0) return;

    const background =
      styleGetFirst(node, ["backgroundColor", "background"]) ??
      node.getAttribute("fill");
    const borderColor =
      styleGetFirst(node, ["borderColor", "strokeStyle"]) ??
      node.getAttribute("stroke");
    const borderWidth =
      parseLength(styleGetFirst(node, ["borderWidth", "lineWidth"]), null) ??
      parseLength(node.getAttribute("strokeWidth"), null) ??
      0;

    if (rect.width > 0 && rect.height > 0 && (background || borderColor)) {
      out.push({ op: "save" }, { op: "setGlobalAlpha", alpha });
      if (background) {
        out.push({ op: "setFillStyle", value: background });
        out.push({
          op: "fillRect",
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
        });
      }
      if (borderColor && borderWidth > 0) {
        out.push({ op: "setStrokeStyle", value: borderColor });
        out.push({ op: "setLineWidth", value: borderWidth });
        out.push({
          op: "strokeRect",
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
        });
      }
      out.push({ op: "restore" });
    }

    if (node.tag === "text") {
      const text =
        node.textContent ||
        node.getAttribute("text") ||
        node.childNodes
          .filter((c) => c.kind === "text")
          .map((c) => c.textContent)
          .join("");
      if (text) {
        const color =
          styleGetFirst(node, ["color", "fillStyle"]) ??
          node.getAttribute("color") ??
          "rgba(255,255,255,0.92)";
        const font = resolveFont(node);
        const textAlign = (styleGet(node, "textAlign") ??
          "left") as CanvasTextAlign;
        const textBaseline = (styleGet(node, "textBaseline") ??
          "top") as CanvasTextBaseline;
        const padLeft = parseLength(styleGet(node, "paddingLeft"), null) ?? 0;
        const padTop = parseLength(styleGet(node, "paddingTop"), null) ?? 0;

        let tx = rect.left + padLeft;
        if (textAlign === "center") tx = rect.left + rect.width / 2;
        else if (textAlign === "right") tx = rect.left + rect.width - padLeft;

        out.push({ op: "save" }, { op: "setGlobalAlpha", alpha });
        out.push({ op: "setFillStyle", value: color });
        out.push({ op: "setFont", value: font });
        out.push({ op: "setTextAlign", value: textAlign });
        out.push({ op: "setTextBaseline", value: textBaseline });
        out.push({ op: "fillText", text, x: tx, y: rect.top + padTop });
        out.push({ op: "restore" });
      }
    }

    if (node.tag === "img") {
      const src = node.getAttribute("src");
      if (src && rect.width > 0 && rect.height > 0) {
        // Get the image element from the global image cache
        const imageElement = (node as any)._imageElement;
        if (
          imageElement &&
          imageElement.complete &&
          imageElement.naturalWidth > 0
        ) {
          out.push({ op: "save" }, { op: "setGlobalAlpha", alpha });
          out.push({
            op: "drawImage",
            image: imageElement,
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height,
          });
          out.push({ op: "restore" });
        }
      }
    }
    if (node.tag === "div" && (node as any)._iconName) {
      const iconName = (node as any)._iconName;
      const iconColor = (node as any)._iconColor;
      console.log("[recordNodeToDisplayList] Icon detected:", { iconName, iconColor, rect });
      if (iconName && rect.width > 0 && rect.height > 0) {
        out.push({ op: "save" }, { op: "setGlobalAlpha", alpha });
        out.push({
          op: "drawIcon",
          iconName,
          color: iconColor,
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
        });
        out.push({ op: "restore" });
        console.log("[recordNodeToDisplayList] Icon command added to display list");
      }
    }

    for (const child of node.childNodes)
      recordNodeToDisplayList(child, rectCache, alpha, out);
    return;
  }

  if (node.kind === "text") {
    const parent = node.parentNode;
    if (!parent || parent.kind !== "element") return;
    const parentRect = rectCache?.get(parent) ?? (parent as CanvasElement).rect;
    if (!parentRect) return;
    const lineRect = rectCache?.get(node) ?? null;

    const color =
      styleGetFirst(parent as CanvasElement, ["color", "fillStyle"]) ??
      (parent as CanvasElement).getAttribute("color") ??
      "rgba(255,255,255,0.92)";
    const font = resolveFont(parent as CanvasElement);
    const textAlign = (styleGet(parent as CanvasElement, "textAlign") ??
      "left") as CanvasTextAlign;
    const textBaseline = (styleGet(parent as CanvasElement, "textBaseline") ??
      "top") as CanvasTextBaseline;

    const box = lineRect ?? parentRect;
    let tx = box.left;
    if (textAlign === "center") tx = box.left + box.width / 2;
    else if (textAlign === "right") tx = box.right;

    out.push({ op: "save" }, { op: "setGlobalAlpha", alpha: parentAlpha });
    out.push({ op: "setFillStyle", value: color });
    out.push({ op: "setFont", value: font });
    out.push({ op: "setTextAlign", value: textAlign });
    out.push({ op: "setTextBaseline", value: textBaseline });
    out.push({
      op: "fillText",
      text: node.textContent,
      x: tx,
      y: box.top,
    });
    out.push({ op: "restore" });
    return;
  }

  for (const child of node.childNodes)
    recordNodeToDisplayList(child, rectCache, parentAlpha, out);
}

function executeDisplayList(
  ctx: CanvasRenderingContext2D,
  list: DrawCommand[],
) {
  for (const cmd of list) {
    switch (cmd.op) {
      case "save":
        ctx.save();
        break;
      case "restore":
        ctx.restore();
        break;
      case "setGlobalAlpha":
        ctx.globalAlpha = cmd.alpha;
        break;
      case "setFillStyle":
        ctx.fillStyle = cmd.value;
        break;
      case "setStrokeStyle":
        ctx.strokeStyle = cmd.value;
        break;
      case "setLineWidth":
        ctx.lineWidth = cmd.value;
        break;
      case "fillRect":
        ctx.fillRect(cmd.x, cmd.y, cmd.w, cmd.h);
        break;
      case "strokeRect":
        ctx.strokeRect(cmd.x, cmd.y, cmd.w, cmd.h);
        break;
      case "setFont":
        ctx.font = cmd.value;
        break;
      case "setTextAlign":
        ctx.textAlign = cmd.value;
        break;
      case "setTextBaseline":
        ctx.textBaseline = cmd.value;
        break;
      case "fillText":
        ctx.fillText(cmd.text, cmd.x, cmd.y);
        break;
      case "drawImage":
        try {
          ctx.drawImage(cmd.image, cmd.x, cmd.y, cmd.w, cmd.h);
        } catch (e) {
          // Silently ignore image drawing errors
        }
        break;
      case "drawIcon":
        try {
          console.log("[executeDisplayList] Drawing icon:", cmd);
          // Convert kebab-case to PascalCase
          const pascalName = cmd.iconName
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join("");

          console.log("[executeDisplayList] Looking for ASN:", pascalName);
          const asnNode = (ASN as any)[pascalName];
          if (asnNode) {
            console.log("[executeDisplayList] ASN found, rendering:", asnNode);
            renderIconToCanvas(
              ctx,
              asnNode,
              { color: cmd.color },
              cmd.x,
              cmd.y,
              cmd.w,
              cmd.h,
            );
          } else {
            console.warn("[executeDisplayList] ASN not found:", pascalName);
          }
        } catch (e) {
          console.error("[executeDisplayList] Icon drawing error:", e);
        }
        break;
      default:
        break;
    }
  }
}

// Helper function to render icon ASN to canvas
function renderIconToCanvas(
  ctx: CanvasRenderingContext2D,
  asn: any,
  props: any,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  console.log("[renderIconToCanvas] Start:", { asn, props, x, y, w, h });

  if (!asn || asn.tag !== "svg") {
    console.warn("[renderIconToCanvas] Invalid ASN:", asn);
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  // Parse viewBox to get original SVG dimensions
  const viewBox = asn.attrs?.viewBox || "0 0 24 24";
  const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(parseFloat);

  // Calculate scale to fit the icon into the target dimensions
  const scaleX = w / vbWidth;
  const scaleY = h / vbHeight;
  console.log("[renderIconToCanvas] ViewBox:", viewBox, "Scale:", { scaleX, scaleY });
  ctx.scale(scaleX, scaleY);

  // Render children (path elements)
  if (asn.children && asn.children.length > 0) {
    console.log("[renderIconToCanvas] Rendering", asn.children.length, "children");
    for (const child of asn.children) {
      if (child.tag === "path" && child.attrs && child.attrs.d) {
        console.log("[renderIconToCanvas] Rendering path:", child.attrs);
        // Merge parent SVG attrs with child attrs (child attrs take precedence)
        const mergedAttrs = { ...asn.attrs, ...child.attrs };
        renderSVGPath(ctx, child.attrs.d, mergedAttrs, props?.color);
      } else if (child.tag === "circle" && child.attrs) {
        console.log("[renderIconToCanvas] Rendering circle:", child.attrs);
        // Merge parent SVG attrs with child attrs
        const mergedAttrs = { ...asn.attrs, ...child.attrs };
        renderSVGCircle(ctx, child.attrs, mergedAttrs, props?.color);
      }
    }
  } else {
    console.warn("[renderIconToCanvas] No children to render");
  }

  ctx.restore();
  console.log("[renderIconToCanvas] Complete");
}

// Parse and render SVG path
function renderSVGPath(
  ctx: CanvasRenderingContext2D,
  pathData: string,
  attrs: Record<string, string>,
  color?: string,
) {
  console.log("[renderSVGPath] Start:", { pathData, attrs, color });
  const commands = parseSVGPathData(pathData);
  let currentX = 0;
  let currentY = 0;
  let startX = 0;
  let startY = 0;

  ctx.beginPath();
  console.log("[renderSVGPath] Processing", commands.length, "commands");

  for (const { cmd, values } of commands) {
    console.log("commands", cmd, values);
    switch (cmd) {
      case "M":
        currentX = values[0];
        currentY = values[1];
        startX = currentX;
        startY = currentY;
        ctx.moveTo(currentX, currentY);
        break;
      case "m":
        currentX += values[0];
        currentY += values[1];
        startX = currentX;
        startY = currentY;
        ctx.moveTo(currentX, currentY);
        break;
      case "L":
        for (let i = 0; i < values.length; i += 2) {
          currentX = values[i];
          currentY = values[i + 1];
          ctx.lineTo(currentX, currentY);
        }
        break;
      case "l":
        for (let i = 0; i < values.length; i += 2) {
          currentX += values[i];
          currentY += values[i + 1];
          ctx.lineTo(currentX, currentY);
        }
        break;
      case "H":
        currentX = values[0];
        ctx.lineTo(currentX, currentY);
        break;
      case "h":
        currentX += values[0];
        ctx.lineTo(currentX, currentY);
        break;
      case "V":
        currentY = values[0];
        ctx.lineTo(currentX, currentY);
        break;
      case "v":
        currentY += values[0];
        ctx.lineTo(currentX, currentY);
        break;
      case "C":
        for (let i = 0; i < values.length; i += 6) {
          ctx.bezierCurveTo(
            values[i],
            values[i + 1],
            values[i + 2],
            values[i + 3],
            values[i + 4],
            values[i + 5],
          );
          currentX = values[i + 4];
          currentY = values[i + 5];
        }
        break;
      case "c":
        for (let i = 0; i < values.length; i += 6) {
          ctx.bezierCurveTo(
            currentX + values[i],
            currentY + values[i + 1],
            currentX + values[i + 2],
            currentY + values[i + 3],
            currentX + values[i + 4],
            currentY + values[i + 5],
          );
          currentX += values[i + 4];
          currentY += values[i + 5];
        }
        break;
      case "Q":
        for (let i = 0; i < values.length; i += 4) {
          ctx.quadraticCurveTo(
            values[i],
            values[i + 1],
            values[i + 2],
            values[i + 3],
          );
          currentX = values[i + 2];
          currentY = values[i + 3];
        }
        break;
      case "q":
        for (let i = 0; i < values.length; i += 4) {
          ctx.quadraticCurveTo(
            currentX + values[i],
            currentY + values[i + 1],
            currentX + values[i + 2],
            currentY + values[i + 3],
          );
          currentX += values[i + 2];
          currentY += values[i + 3];
        }
        break;
      case "A":
        for (let i = 0; i < values.length; i += 7) {
          const rx = values[i];
          const ry = values[i + 1];
          const xAxisRotation = values[i + 2];
          const largeArcFlag = values[i + 3];
          const sweepFlag = values[i + 4];
          const x = values[i + 5];
          const y = values[i + 6];
          drawEllipticalArc(ctx, currentX, currentY, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y);
          currentX = x;
          currentY = y;
        }
        break;
      case "a":
        for (let i = 0; i < values.length; i += 7) {
          const rx = values[i];
          const ry = values[i + 1];
          const xAxisRotation = values[i + 2];
          const largeArcFlag = values[i + 3];
          const sweepFlag = values[i + 4];
          const dx = values[i + 5];
          const dy = values[i + 6];
          const x = currentX + dx;
          const y = currentY + dy;
          drawEllipticalArc(ctx, currentX, currentY, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y);
          currentX = x;
          currentY = y;
        }
        break;
      case "Z":
      case "z":
        ctx.closePath();
        currentX = startX;
        currentY = startY;
        break;
    }
  }

  const stroke = attrs["stroke"];
  const fill = attrs["fill"];
  const strokeWidth = attrs["stroke-width"] || "2";

  console.log("[renderSVGPath] Styling:", { stroke, fill, strokeWidth, color });

  if (stroke && stroke !== "none") {
    ctx.strokeStyle = stroke === "currentColor" ? color || "white" : stroke;
    ctx.lineWidth = parseFloat(strokeWidth);
    ctx.lineCap = (attrs["stroke-linecap"] as any) || "round";
    ctx.lineJoin = (attrs["stroke-linejoin"] as any) || "round";
    console.log("[renderSVGPath] Stroking with:", ctx.strokeStyle, ctx.lineWidth);
    ctx.stroke();
  }

  if (fill && fill !== "none") {
    ctx.fillStyle = fill === "currentColor" ? color || "white" : fill;
    console.log("[renderSVGPath] Filling with:", ctx.fillStyle);
    ctx.fill();
  }

  console.log("[renderSVGPath] Complete");
}

// Render SVG circle element
function renderSVGCircle(
  ctx: CanvasRenderingContext2D,
  circleAttrs: Record<string, string>,
  attrs: Record<string, string>,
  color?: string,
) {
  console.log("[renderSVGCircle] Start:", { circleAttrs, attrs, color });

  const cx = parseFloat(circleAttrs.cx || "0");
  const cy = parseFloat(circleAttrs.cy || "0");
  const r = parseFloat(circleAttrs.r || "0");

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);

  const stroke = attrs["stroke"];
  const fill = attrs["fill"];
  const strokeWidth = attrs["stroke-width"] || "2";

  console.log("[renderSVGCircle] Styling:", { stroke, fill, strokeWidth, color });

  if (stroke && stroke !== "none") {
    ctx.strokeStyle = stroke === "currentColor" ? color || "white" : stroke;
    ctx.lineWidth = parseFloat(strokeWidth);
    ctx.lineCap = (attrs["stroke-linecap"] as any) || "round";
    ctx.lineJoin = (attrs["stroke-linejoin"] as any) || "round";
    console.log("[renderSVGCircle] Stroking with:", ctx.strokeStyle, ctx.lineWidth);
    ctx.stroke();
  }

  if (fill && fill !== "none") {
    ctx.fillStyle = fill === "currentColor" ? color || "white" : fill;
    console.log("[renderSVGCircle] Filling with:", ctx.fillStyle);
    ctx.fill();
  }

  console.log("[renderSVGCircle] Complete");
}

function parseSVGPathData(
  pathData: string,
): Array<{ cmd: string; values: number[] }> {
  const commands: Array<{ cmd: string; values: number[] }> = [];
  const regex = /([MLHVZCSQTAmlhvzcsqta])([^MLHVZCSQTAmlhvzcsqta]*)/g;
  let match;

  while ((match = regex.exec(pathData)) !== null) {
    const cmd = match[1];
    const valueStr = match[2].trim();
    const values = valueStr
      ? valueStr
          .split(/[\s,]+/)
          .filter((v) => v)
          .map((v) => parseFloat(v))
      : [];
    commands.push({ cmd, values });
  }

  return commands;
}

// Helper function to draw elliptical arc (SVG A/a command)
function drawEllipticalArc(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  rx: number,
  ry: number,
  xAxisRotation: number,
  largeArcFlag: number,
  sweepFlag: number,
  x2: number,
  y2: number,
) {
  // Handle degenerate cases
  if (rx === 0 || ry === 0) {
    ctx.lineTo(x2, y2);
    return;
  }

  // Convert rotation angle to radians
  const phi = (xAxisRotation * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  // Compute center point
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosPhi * dx + sinPhi * dy;
  const y1p = -sinPhi * dx + cosPhi * dy;

  // Correct radii if needed
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }

  // Compute center
  const sign = largeArcFlag !== sweepFlag ? 1 : -1;
  const sq = Math.max(
    0,
    (rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p) /
      (rx * rx * y1p * y1p + ry * ry * x1p * x1p),
  );
  const coef = sign * Math.sqrt(sq);
  const cxp = coef * ((rx * y1p) / ry);
  const cyp = coef * (-(ry * x1p) / rx);

  const cx = cosPhi * cxp - sinPhi * cyp + (x1 + x2) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (y1 + y2) / 2;

  // Compute angles
  const theta1 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
  const theta2 = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx);
  let dTheta = theta2 - theta1;

  if (sweepFlag && dTheta < 0) {
    dTheta += 2 * Math.PI;
  } else if (!sweepFlag && dTheta > 0) {
    dTheta -= 2 * Math.PI;
  }

  // Draw the arc using ellipse
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(phi);
  ctx.scale(1, ry / rx);
  ctx.arc(0, 0, rx, theta1, theta1 + dTheta, !sweepFlag);
  ctx.restore();
}

function unionRects(
  a: BoundingRect | null,
  b: BoundingRect | null,
): BoundingRect | null {
  if (!a) return b;
  if (!b) return a;
  const left = Math.min(a.left, b.left);
  const top = Math.min(a.top, b.top);
  const right = Math.max(a.right, b.right);
  const bottom = Math.max(a.bottom, b.bottom);
  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
    x: left,
    y: top,
  };
}

function clearRectRegion(
  ctx: CanvasRenderingContext2D,
  rect: BoundingRect,
  clearColor: string | null | undefined,
  dpr: number,
) {
  const dx = rect.left * dpr;
  const dy = rect.top * dpr;
  const dw = rect.width * dpr;
  const dh = rect.height * dpr;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (clearColor && typeof clearColor === "string") {
    ctx.fillStyle = clearColor;
    ctx.fillRect(dx, dy, dw, dh);
  } else {
    ctx.clearRect(dx, dy, dw, dh);
  }
  ctx.restore();
}

function computeRectsForTree(
  root: CanvasNode,
  rectCache: WeakMap<CanvasNode, BoundingRect>,
  rootRect: BoundingRect,
  ctx: CanvasRenderingContext2D,
) {
  rectCache.set(root, rootRect);
  if (root.kind === "element") (root as CanvasElement).rect = rootRect;

  const computeRects = (
    node: CanvasNode,
    parentRect: BoundingRect | null,
    forced?: { rect: BoundingRect; lockSize?: boolean },
  ) => {
    if (node.kind === "element") {
      if (isHiddenByOpacity(node)) {
        const baseRect = forced?.rect
          ? { ...forced.rect }
          : resolveRect(node, parentRect);
        baseRect.width = 0;
        baseRect.height = 0;
        baseRect.right = baseRect.left;
        baseRect.bottom = baseRect.top;
        rectCache.set(node, baseRect);
        node.rect = baseRect;
        return;
      }

      const hasWidth =
        forced?.lockSize === true
          ? true
          : hasExplicitLengthStyle(node, ["width"], ["width"]);
      const hasHeight =
        forced?.lockSize === true
          ? true
          : hasExplicitLengthStyle(node, ["height"], ["height"]);

      const baseRect = forced?.rect
        ? { ...forced.rect }
        : resolveRect(node, parentRect);
      if (!forced?.rect && !hasWidth && parentRect && parentRect.width > 0) {
        baseRect.width = parentRect.width;
        baseRect.right = baseRect.left + baseRect.width;
      }

      const rect = baseRect;
      rectCache.set(node, rect);
      node.rect = rect;

      const padLeft = parseLength(styleGet(node, "paddingLeft"), null) ?? 0;
      const padRight = parseLength(styleGet(node, "paddingRight"), null) ?? 0;
      const padTop = parseLength(styleGet(node, "paddingTop"), null) ?? 0;
      const padBottom = parseLength(styleGet(node, "paddingBottom"), null) ?? 0;

      const contentLeft = rect.left + padLeft;
      const contentTop = rect.top + padTop;
      const contentWidth = Math.max(0, rect.width - padLeft - padRight);

      let cursorY = contentTop;
      let maxChildRight = contentLeft;

      const position = styleGet(node, "position");
      const isParentAbsoluteContainer =
        typeof position === "string" &&
        (position === "absolute" || position === "fixed");

      const display = styleGet(node, "display");
      const isGrid = display === "grid" && !isParentAbsoluteContainer;

      const layoutFlowChildren = (children: CanvasNode[]) => {
        for (const child of children) {
          if (child.kind === "fragment") {
            layoutFlowChildren(child.childNodes);
            continue;
          }

          if (child.kind === "text") {
            const text = child.textContent ?? "";
            if (!text) continue;

            const font = resolveFont(node);
            const fontSize = resolveFontSize(node, font);
            const lineHeightPx = resolveLineHeightPx(node, fontSize);

            ctx.save();
            ctx.font = font;
            const metrics = ctx.measureText(text);
            ctx.restore();

            const lineBoxWidth =
              contentWidth > 0 ? contentWidth : metrics.width;
            rectCache.set(child, {
              top: cursorY,
              left: contentLeft,
              right: contentLeft + lineBoxWidth,
              bottom: cursorY + lineHeightPx,
              width: lineBoxWidth,
              height: lineHeightPx,
              x: contentLeft,
              y: cursorY,
            });
            cursorY += lineHeightPx;
            maxChildRight = Math.max(
              maxChildRight,
              contentLeft + metrics.width,
            );
            continue;
          }

          if (child.kind === "element") {
            const childEl = child as CanvasElement;
            if (isHiddenByOpacity(childEl)) continue;
            const mt = parseLength(styleGet(childEl, "marginTop"), null) ?? 0;
            const mb =
              parseLength(styleGet(childEl, "marginBottom"), null) ?? 0;

            const childPosition = styleGet(childEl, "position");
            const isAbs =
              typeof childPosition === "string" &&
              (childPosition === "absolute" || childPosition === "fixed");

            const hasTop = hasExplicitLengthStyle(
              childEl,
              ["top", "y"],
              ["top", "y"],
            );

            if (!isParentAbsoluteContainer && !isAbs && !hasTop) {
              cursorY += mt;
              const availableW = contentWidth > 0 ? contentWidth : rect.width;
              const pseudoParent: BoundingRect = {
                top: cursorY,
                left: contentLeft,
                right: contentLeft + availableW,
                bottom: rect.bottom,
                width: availableW,
                height: Math.max(0, rect.height - padTop - padBottom),
                x: contentLeft,
                y: cursorY,
              };
              computeRects(childEl, pseudoParent);
              const cr = rectCache.get(childEl) ?? childEl.rect;
              if (cr) {
                cursorY = cr.bottom + mb;
                maxChildRight = Math.max(maxChildRight, cr.right);
              }
              continue;
            }

            computeRects(childEl, rect);
            const cr = rectCache.get(childEl) ?? childEl.rect;
            if (cr) {
              maxChildRight = Math.max(maxChildRight, cr.right);
            }
          }
        }
      };

      const layoutGridChildren = (children: CanvasNode[]) => {
        const colsRaw = resolveGridColumns(node);
        const cols = Math.max(1, Math.floor(colsRaw));
        const gap = resolveGridGap(node);

        const colWidth =
          cols > 0 ? Math.max(0, (contentWidth - gap * (cols - 1)) / cols) : 0;

        const flow: CanvasNode[] = [];
        const abs: CanvasElement[] = [];

        const collect = (nodes: CanvasNode[]) => {
          for (const child of nodes) {
            if (child.kind === "fragment") {
              collect(child.childNodes);
              continue;
            }
            if (child.kind === "text") {
              if (child.textContent) flow.push(child);
              continue;
            }
            if (child.kind === "element") {
              const childEl = child as CanvasElement;
              if (isHiddenByOpacity(childEl)) continue;

              const childPosition = styleGet(childEl, "position");
              const isAbs =
                typeof childPosition === "string" &&
                (childPosition === "absolute" || childPosition === "fixed");
              const hasTop = hasExplicitLengthStyle(
                childEl,
                ["top", "y"],
                ["top", "y"],
              );
              const hasLeft = hasExplicitLengthStyle(
                childEl,
                ["left", "x"],
                ["left", "x"],
              );

              if (isAbs || hasTop || hasLeft) abs.push(childEl);
              else flow.push(childEl);
            }
          }
        };

        collect(children);

        for (const childEl of abs) {
          computeRects(childEl, rect);
          const cr = rectCache.get(childEl) ?? childEl.rect;
          if (cr) maxChildRight = Math.max(maxChildRight, cr.right);
        }

        let i = 0;
        let didRow = false;
        while (i < flow.length) {
          const rowY = cursorY;
          let rowHeight = 0;
          for (let col = 0; col < cols && i < flow.length; col++) {
            const item = flow[i++];
            const cellLeft = contentLeft + col * (colWidth + gap);

            if (item.kind === "text") {
              const text = item.textContent ?? "";
              if (!text) continue;

              const font = resolveFont(node);
              const fontSize = resolveFontSize(node, font);
              const lineHeightPx = resolveLineHeightPx(node, fontSize);

              ctx.save();
              ctx.font = font;
              const metrics = ctx.measureText(text);
              ctx.restore();

              rectCache.set(item, {
                top: rowY,
                left: cellLeft,
                right: cellLeft + colWidth,
                bottom: rowY + lineHeightPx,
                width: colWidth,
                height: lineHeightPx,
                x: cellLeft,
                y: rowY,
              });

              rowHeight = Math.max(rowHeight, lineHeightPx);
              maxChildRight = Math.max(
                maxChildRight,
                cellLeft + Math.min(colWidth, metrics.width),
              );
              continue;
            }

            if (item.kind === "element") {
              const childEl = item as CanvasElement;
              const ml =
                parseLength(styleGet(childEl, "marginLeft"), null) ?? 0;
              const mr =
                parseLength(styleGet(childEl, "marginRight"), null) ?? 0;
              const mt = parseLength(styleGet(childEl, "marginTop"), null) ?? 0;
              const mb =
                parseLength(styleGet(childEl, "marginBottom"), null) ?? 0;

              const innerLeft = cellLeft + ml;
              const availableW = Math.max(0, colWidth - ml - mr);
              const pseudoParent: BoundingRect = {
                top: rowY + mt,
                left: innerLeft,
                right: innerLeft + availableW,
                bottom: rect.bottom,
                width: availableW,
                height: Math.max(0, rect.height - padTop - padBottom),
                x: innerLeft,
                y: rowY + mt,
              };
              computeRects(childEl, pseudoParent);
              const cr = rectCache.get(childEl) ?? childEl.rect;
              if (cr) {
                rowHeight = Math.max(rowHeight, cr.bottom - rowY + mb);
                maxChildRight = Math.max(maxChildRight, cr.right + mr);
              }
            }
          }

          if (rowHeight <= 0) break;
          cursorY = rowY + rowHeight + gap;
          didRow = true;
        }

        if (didRow) cursorY = Math.max(contentTop, cursorY - gap);
      };

      if (isGrid) layoutGridChildren(node.childNodes);
      else layoutFlowChildren(node.childNodes);

      if (!hasHeight) {
        const nextHeight = Math.max(0, cursorY - rect.top + padBottom);
        if (nextHeight > rect.height) {
          rect.height = nextHeight;
          rect.bottom = rect.top + rect.height;
        }
      }

      if (!hasWidth && parentRect === null) {
        const nextWidth = Math.max(0, maxChildRight - rect.left + padRight);
        if (nextWidth > rect.width) {
          rect.width = nextWidth;
          rect.right = rect.left + rect.width;
        }
      }

      rectCache.set(node, rect);
      node.rect = rect;
      return;
    }
    if (node.kind === "fragment") {
      for (const child of node.childNodes) computeRects(child, parentRect);
    }
  };

  if (root.kind === "element") {
    computeRects(root, null, { rect: rootRect, lockSize: true });
    return;
  }

  const baseParentRect = rootRect ?? null;
  for (const child of root.childNodes) computeRects(child, baseParentRect);
}

function renderTreeToCanvas(
  root: CanvasNode,
  ctx: CanvasRenderingContext2D,
  rectCache: WeakMap<CanvasNode, BoundingRect>,
  clearColor: string | null | undefined,
  dpr: number,
  debugOptions?: { enabled: boolean; hoveredNode: CanvasNode | null },
  dirty?: {
    nodes: Set<CanvasNode>;
    prevRects: WeakMap<CanvasNode, BoundingRect>;
  },
) {
  const { width, height, resized } = applyCanvasSizing(ctx.canvas, dpr);
  const rootRect: BoundingRect = {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    x: 0,
    y: 0,
  };

  computeRectsForTree(root, rectCache, rootRect, ctx);

  let dirtyRect: BoundingRect | null = null;
  if (!resized && dirty && dirty.nodes.size > 0 && !debugOptions?.enabled) {
    for (const n of dirty.nodes) {
      const el =
        n.kind === "element"
          ? n
          : n.parentNode?.kind === "element"
            ? (n.parentNode as CanvasElement)
            : null;
      if (!el) continue;
      const prev = dirty.prevRects.get(el) ?? null;
      const next = rectCache.get(el) ?? el.rect ?? null;
      dirtyRect = unionRects(dirtyRect, prev);
      dirtyRect = unionRects(dirtyRect, next);
    }
  }

  if (dirty) dirty.nodes.clear();

  if (!dirtyRect || dirtyRect.width <= 0 || dirtyRect.height <= 0) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (shouldClear(ctx, clearColor)) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
    const displayList: DrawCommand[] = [];
    recordNodeToDisplayList(root, rectCache, 1, displayList);
    executeDisplayList(ctx, displayList);
  } else {
    clearRectRegion(ctx, dirtyRect, clearColor, dpr);
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.beginPath();
    ctx.rect(dirtyRect.left, dirtyRect.top, dirtyRect.width, dirtyRect.height);
    ctx.clip();
    const displayList: DrawCommand[] = [];
    recordNodeToDisplayList(root, rectCache, 1, displayList);
    executeDisplayList(ctx, displayList);
    ctx.restore();
  }

  // Draw debug overlay
  if (debugOptions?.enabled && debugOptions.hoveredNode) {
    const hoveredRect = rectCache.get(debugOptions.hoveredNode);
    if (hoveredRect && hoveredRect.width > 0 && hoveredRect.height > 0) {
      ctx.save();

      // Draw highlight border
      ctx.strokeStyle = "rgba(255, 100, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoveredRect.left,
        hoveredRect.top,
        hoveredRect.width,
        hoveredRect.height,
      );

      // Draw semi-transparent overlay
      ctx.fillStyle = "rgba(255, 100, 0, 0.1)";
      ctx.fillRect(
        hoveredRect.left,
        hoveredRect.top,
        hoveredRect.width,
        hoveredRect.height,
      );

      // Draw size label
      const label = `${Math.round(hoveredRect.width)} × ${Math.round(hoveredRect.height)}`;
      ctx.font = "12px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const metrics = ctx.measureText(label);
      const labelWidth = metrics.width + 8;
      const labelHeight = 18;

      let labelX = hoveredRect.left;
      let labelY = hoveredRect.top - labelHeight - 4;

      // Adjust label position if it goes off-screen
      if (labelY < 0) {
        labelY = hoveredRect.top + 4;
      }

      // Draw label background
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

      // Draw label text
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
      ctx.fillText(label, labelX + 4, labelY + 3);

      ctx.restore();
    }
  }
}

export type DrawOptions = {
  dpr?: number;
  clearColor?: string | null;
  window?: Window;
  rectCache?: WeakMap<CanvasNode, BoundingRect>;
};

export function draw(
  ctx: CanvasRenderingContext2D,
  content: CanvasNode,
  options: DrawOptions = {},
) {
  if (!ctx || !content) return;
  const rectCache =
    options.rectCache ?? new WeakMap<CanvasNode, BoundingRect>();

  const win = options.window ?? (globalThis as any).window;
  const dpr =
    options.dpr ??
    (typeof win !== "undefined" && win?.devicePixelRatio
      ? win.devicePixelRatio
      : inferCanvasDpr(ctx));

  renderTreeToCanvas(content, ctx, rectCache, options.clearColor, dpr);
}

export function createCanvasDocument(
  $canvas: HTMLCanvasElement,
  options: CreateCanvasHostOptions = {},
): CanvasDocument {
  const canvas = $canvas ?? null;
  const win = options.window ?? (globalThis as any).window;
  const dpr =
    options.dpr ??
    (typeof win !== "undefined" && win?.devicePixelRatio
      ? win.devicePixelRatio
      : 1);

  const ctx = options.context ?? (canvas ? canvas.getContext("2d") : null);

  const body = createCanvasElement("body");
  // 设置 body 默认样式，使其填充整个 canvas
  body.style = {
    width: "100%",
    height: "100%",
  };

  const handlerStore = new WeakMap<
    any,
    Map<string, { capture: Set<AnyEventHandler>; bubble: Set<AnyEventHandler> }>
  >();

  const dispatcherState = new Map<
    string,
    {
      captureCount: number;
      bubbleCount: number;
      captureListener: (event: Event) => void;
      bubbleListener: (event: Event) => void;
    }
  >();

  const rectCache = new WeakMap<CanvasNode, BoundingRect>();
  const clearColor = options.clearColor;
  let destroyed = false;
  let hovered: CanvasNode | null = null;
  let debugEnabled = false;
  let debugHoveredNode: CanvasNode | null = null;
  const dirtyNodes = new Set<CanvasNode>();
  const dirtyPrevRects = new WeakMap<CanvasNode, BoundingRect>();
  let drawScheduled = false;

  const scheduleDraw = () => {
    if (drawScheduled) return;
    drawScheduled = true;
    queueMicrotask(() => {
      drawScheduled = false;
      host.draw();
    });
  };

  const markDirty = (node: CanvasNode | null) => {
    if (!node) return;
    let target: CanvasNode | null = node;
    if (target.kind === "text") target = target.parentNode;
    if (target && target.kind === "fragment") target = target.parentNode;
    if (!target || target.kind !== "element") {
      dirtyNodes.add(body);
      scheduleDraw();
      return;
    }

    const prev = rectCache.get(target) ?? (target as CanvasElement).rect;
    if (prev) dirtyPrevRects.set(target, prev);
    dirtyNodes.add(target);
    scheduleDraw();
  };

  const getHandlerBucket = (target: any, type: string) => {
    let perTarget = handlerStore.get(target);
    if (!perTarget) {
      perTarget = new Map();
      handlerStore.set(target, perTarget);
    }
    let bucket = perTarget.get(type);
    if (!bucket) {
      bucket = { capture: new Set(), bubble: new Set() };
      perTarget.set(type, bucket);
    }
    return bucket;
  };

  const addNodeEventListener = (
    target: CanvasNode,
    type: string,
    handler: any,
    options?: any,
  ) => {
    const capture = normalizeCapture(options);
    const bucket = getHandlerBucket(target, type);
    const state = ensureDispatcher(type);
    const set = capture ? bucket.capture : bucket.bubble;
    if (set.has(handler)) return;
    set.add(handler);

    if (!canvas) return;
    if (capture) {
      if (state.captureCount === 0) {
        canvas.addEventListener(type, state.captureListener, true);
      }
      state.captureCount += 1;
    } else {
      if (state.bubbleCount === 0) {
        canvas.addEventListener(type, state.bubbleListener, false);
      }
      state.bubbleCount += 1;
    }
  };

  const removeNodeEventListener = (
    target: CanvasNode,
    type: string,
    handler: any,
    options?: any,
  ) => {
    const capture = normalizeCapture(options);
    const perTarget = handlerStore.get(target);
    const bucket = perTarget?.get(type);
    const state = dispatcherState.get(type);
    if (!bucket || !state) return;

    const set = capture ? bucket.capture : bucket.bubble;
    if (!set.has(handler)) return;
    set.delete(handler);

    if (!canvas) return;
    if (capture) {
      state.captureCount = Math.max(0, state.captureCount - 1);
      if (state.captureCount === 0) {
        canvas.removeEventListener(type, state.captureListener, true);
      }
    } else {
      state.bubbleCount = Math.max(0, state.bubbleCount - 1);
      if (state.bubbleCount === 0) {
        canvas.removeEventListener(type, state.bubbleListener, false);
      }
    }
  };

  const enhanceNode = (node: CanvasNode) => {
    (node as any).getFirstChild = () => (node as any).firstChild ?? null;
    (node as any).getNextSibling = () => node.nextSibling ?? null;
    (node as any).getParentNode = () => node.parentNode ?? null;

    if (node.kind === "text") {
      (node as any).setTextContent = (text: string) => {
        node.textContent = text;
        markDirty(node);
      };
      return node;
    }

    if (node.kind === "fragment") {
      (node as any).clearChildren = () => {
        while ((node as any).firstChild) {
          node.removeChild((node as any).firstChild);
        }
        markDirty(node);
      };
      return node;
    }

    const el = node as CanvasElement;
    el.addEventListener = (type: string, handler: any, options?: any) => {
      addNodeEventListener(el, type, handler, options);
    };
    el.removeEventListener = (type: string, handler: any, options?: any) => {
      removeNodeEventListener(el, type, handler, options);
    };
    el.clearChildren = () => {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      markDirty(el);
    };
    el.setStyleSet = (value: any) => {
      const prevOpacity = parseNumber(styleGet(el, "opacity")) ?? 1;
      if (typeof value === "string") {
        el.className = value;
        markDirty(el);
        return;
      }
      if (Array.isArray(value)) {
        el.className = value.join(" ");
        markDirty(el);
        return;
      }
      if (value && typeof value === "object") {
        if (typeof (value as any).cssText === "string") {
          el.style = parseCssText(String((value as any).cssText));
        } else {
          el.style = toPlainStyle(value);
        }
      } else {
        el.style = {};
      }
      markDirty(el);
      const nextOpacity = parseNumber(styleGet(el, "opacity")) ?? 1;
      if (prevOpacity <= 0 || nextOpacity <= 0) {
        markDirty(el.parentNode);
      }
    };
    el.setTextContent = (text: string) => {
      el.textContent = text;
      markDirty(el);
    };
    el.setStyleValue = (styleObj: Record<string, any>) => {
      // 更新样式对象并标记为脏，触发重绘
      Object.keys(styleObj).forEach((key) => {
        (el.style as any)[key] = styleObj[key];
      });
      markDirty(el);
    };
    return node;
  };

  const buildPath = (start: any) => {
    const path: any[] = [];
    let cur = start;
    while (cur) {
      path.push(cur);
      cur = cur.parentNode ?? null;
    }
    return path;
  };

  const dispatchMouseEnterLeave = (nextTarget: CanvasNode | null, e: any) => {
    if (hovered === nextTarget) return;
    const prev = hovered;
    hovered = nextTarget;
    if (prev) {
      const perTarget = handlerStore.get(prev);
      const bucket = perTarget?.get("mouseleave");
      if (bucket?.bubble?.size) {
        for (const handler of Array.from(bucket.bubble)) {
          handler(createEventProxy(e, prev, prev));
        }
      }
    }
    if (nextTarget) {
      const perTarget = handlerStore.get(nextTarget);
      const bucket = perTarget?.get("mouseenter");
      if (bucket?.bubble?.size) {
        for (const handler of Array.from(bucket.bubble)) {
          handler(createEventProxy(e, nextTarget, nextTarget));
        }
      }
    }
  };

  const makeDispatcher = (type: string, phase: "capture" | "bubble") => {
    return (event: Event) => {
      if (destroyed) return;
      if (!canvas) return;

      let stopped = false;
      let immediateStopped = false;
      const originalStopPropagation = (event as any).stopPropagation?.bind(
        event,
      );
      const originalStopImmediatePropagation = (
        event as any
      ).stopImmediatePropagation?.bind(event);

      if (originalStopPropagation) {
        (event as any).stopPropagation = () => {
          stopped = true;
          originalStopPropagation();
        };
      }

      if (originalStopImmediatePropagation) {
        (event as any).stopImmediatePropagation = () => {
          immediateStopped = true;
          stopped = true;
          originalStopImmediatePropagation();
        };
      }

      try {
        const point = computeEventPoint(canvas, event);
        const hit = pickNodeAtPoint(body, point, rectCache);
        if (type === "mousemove" || type === "pointermove") {
          dispatchMouseEnterLeave(hit, event);
        }
        const target = hit ?? body;
        const path = buildPath(target);
        const iter = phase === "capture" ? [...path].reverse() : path;

        for (let i = 0; i < iter.length; i++) {
          const node = iter[i];
          const perTarget = handlerStore.get(node);
          const bucket = perTarget?.get(type);
          const set = phase === "capture" ? bucket?.capture : bucket?.bubble;
          if (!set || set.size === 0) {
            if (stopped) break;
            continue;
          }

          const e2 = createEventProxy(event, node, target);
          for (const handler of Array.from(set)) {
            handler(e2);
            if (immediateStopped) break;
          }

          if (stopped) break;
        }
      } finally {
        if (originalStopPropagation) {
          (event as any).stopPropagation = originalStopPropagation;
        }
        if (originalStopImmediatePropagation) {
          (event as any).stopImmediatePropagation =
            originalStopImmediatePropagation;
        }
      }
    };
  };

  const ensureDispatcher = (type: string) => {
    let state = dispatcherState.get(type);
    if (!state) {
      state = {
        captureCount: 0,
        bubbleCount: 0,
        captureListener: makeDispatcher(type, "capture"),
        bubbleListener: makeDispatcher(type, "bubble"),
      };
      dispatcherState.set(type, state);
    }
    return state;
  };

  const host: CanvasDocument = {
    kind: "canvas",
    canvas,
    ctx,
    body,
    draw() {
      if (destroyed) return;
      if (!ctx) return;
      renderTreeToCanvas(
        body,
        ctx,
        rectCache,
        clearColor,
        dpr,
        {
          enabled: debugEnabled,
          hoveredNode: debugHoveredNode,
        },
        { nodes: dirtyNodes, prevRects: dirtyPrevRects },
      );
    },
    enableDebug(enabled: boolean) {
      debugEnabled = enabled;
      if (enabled && canvas) {
        const debugMouseMoveHandler = (event: MouseEvent) => {
          if (!debugEnabled) return;
          const point = computeEventPoint(canvas, event);
          const hit = pickNodeAtPoint(body, point, rectCache);
          if (hit !== debugHoveredNode) {
            debugHoveredNode = hit;
            host.draw();
          }
        };
        canvas.addEventListener("mousemove", debugMouseMoveHandler);
        (host as any)._debugMouseMoveHandler = debugMouseMoveHandler;
      } else if (!enabled && canvas && (host as any)._debugMouseMoveHandler) {
        canvas.removeEventListener(
          "mousemove",
          (host as any)._debugMouseMoveHandler,
        );
        debugHoveredNode = null;
        host.draw();
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (canvas) {
        for (const [type, state] of dispatcherState.entries()) {
          if (state.captureCount > 0) {
            canvas.removeEventListener(type, state.captureListener, true);
          }
          if (state.bubbleCount > 0) {
            canvas.removeEventListener(type, state.bubbleListener, false);
          }
        }
      }
      dispatcherState.clear();
    },
    createElement(tag: string) {
      return enhanceNode(createCanvasElement(tag)) as any;
    },
    createElementNS(_namespace: string, tag: string) {
      return enhanceNode(createCanvasElement(tag)) as any;
    },
    createTextNode(text: string) {
      return enhanceNode(createCanvasText(text)) as any;
    },
    createDocumentFragment() {
      return enhanceNode(createCanvasFragment()) as any;
    },
    appendChild(parent: any, child: any) {
      if (!isCanvasNode(parent) || !isCanvasNode(child)) return;
      if (child.kind === "fragment") {
        const nodes = [...child.childNodes];
        for (const n of nodes) {
          child.removeChild(n);
          parent.appendChild(n);
        }
        markDirty(parent);
        return;
      }
      parent.appendChild(child);
      markDirty(parent);
    },
    removeChild(parent: any, child: any) {
      if (!isCanvasNode(parent) || !isCanvasNode(child)) return;
      parent.removeChild(child);
      markDirty(parent);
    },
    insertBefore(parent: any, child: any, before: any) {
      if (!isCanvasNode(parent) || !isCanvasNode(child)) return;
      const ref = isCanvasNode(before) ? before : null;
      if (child.kind === "fragment") {
        const nodes = [...child.childNodes];
        for (const n of nodes) {
          child.removeChild(n);
          parent.insertBefore(n, ref);
        }
        markDirty(parent);
        return;
      }
      parent.insertBefore(child, ref);
      markDirty(parent);
    },
    replaceChild(parent: any, newChild: any, oldChild: any) {
      if (
        !isCanvasNode(parent) ||
        !isCanvasNode(newChild) ||
        !isCanvasNode(oldChild)
      )
        return;
      if (newChild.kind === "fragment") {
        const nodes = [...newChild.childNodes];
        for (const n of nodes) {
          newChild.removeChild(n);
          parent.insertBefore(n, oldChild);
        }
        parent.removeChild(oldChild);
        markDirty(parent);
        return;
      }
      parent.replaceChild(newChild, oldChild);
      markDirty(parent);
    },
    clearChildren(parent: any) {
      if (!isCanvasNode(parent)) return;
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
      markDirty(parent);
    },
    setAttribute(el: any, name: string, value: string) {
      if (!isCanvasElement(el)) return;
      el.setAttribute(name, value);
      markDirty(el);
    },
    removeAttribute(el: any, name: string) {
      if (!isCanvasElement(el)) return;
      el.removeAttribute(name);
      markDirty(el);
    },
    setClassName(el: any, className: string) {
      if (!isCanvasElement(el)) return;
      el.className = className;
      markDirty(el);
    },
    setStyleText(el: any, cssText: string) {
      if (!isCanvasElement(el)) return;
      (el as any).style = parseCssText(cssText) as any;
      markDirty(el);
    },
    patchStyle(el: any, patch: Record<string, string>) {
      if (!isCanvasElement(el)) return;
      for (const k of Object.keys(patch)) {
        (el.style as any)[k] = patch[k];
      }
      markDirty(el);
    },
    setTextContent(node: any, text: string) {
      if (!isCanvasNode(node)) return;
      node.textContent = text;
      markDirty(node);
    },
    setInnerHTML(el: any, html: string) {
      if (!isCanvasElement(el)) return;
      el.innerHTML = html;
      el.textContent = html;
      markDirty(el);
    },
    setProperty(el: any, key: string, value: any) {
      if (!isCanvasNode(el)) return;
      (el as any)[key] = value;
      markDirty(el);
    },
    addEventListener(target: any, type: string, handler: any, options?: any) {
      if (!isCanvasNode(target)) {
        target?.addEventListener?.(type, handler, options);
        return;
      }
      addNodeEventListener(target, type, handler, options);
    },
    removeEventListener(
      target: any,
      type: string,
      handler: any,
      options?: any,
    ) {
      if (!isCanvasNode(target)) {
        target?.removeEventListener?.(type, handler, options);
        return;
      }
      removeNodeEventListener(target, type, handler, options);
    },
    addDocumentEventListener(type: string, handler: any, options?: any) {
      canvas?.addEventListener(type, handler, options);
    },
    removeDocumentEventListener(type: string, handler: any, options?: any) {
      canvas?.removeEventListener(type, handler, options);
    },
    patchBodyStyle(_patch: { cursor?: string; userSelect?: string }) {},
    setTimeout(handler: () => void, ms: number) {
      return win?.setTimeout
        ? win.setTimeout(handler, ms)
        : setTimeout(handler, ms);
    },
    clearTimeout(id: any) {
      if (win?.clearTimeout) return win.clearTimeout(id);
      clearTimeout(id);
    },
    setPointerCapture(_target: any, _pointerId: number) {
      canvas?.setPointerCapture?.(_pointerId);
    },
    releasePointerCapture(_target: any, _pointerId: number) {
      canvas?.releasePointerCapture?.(_pointerId);
    },
    focus() {
      canvas?.focus?.();
    },
    blur() {
      canvas?.blur?.();
    },
    querySelector(_root: any, _selector: string) {
      return null;
    },
    getBoundingClientRect(el: any) {
      if (!isCanvasNode(el) || el.kind !== "element") {
        return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
      }
      return (
        rectCache.get(el) ?? {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
        }
      );
    },
    getViewportSize() {
      if (!canvas) return { width: 0, height: 0 };
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      return {
        width: Number.isFinite(w) ? w : 0,
        height: Number.isFinite(h) ? h : 0,
      };
    },
    getBody() {
      return body;
    },
    isDocumentFragment(node: any) {
      return isCanvasNode(node) && node.kind === "fragment";
    },
    getChildNodes(node: any) {
      if (!isCanvasNode(node)) return [];
      return node.childNodes;
    },
    getParentNode(node: any) {
      if (!isCanvasNode(node)) return null;
      return node.parentNode;
    },
    getNextSibling(node: any) {
      if (!isCanvasNode(node)) return null;
      return node.nextSibling;
    },
    getFirstChild(node: any) {
      if (!isCanvasNode(node)) return null;
      return node.firstChild;
    },
    createIcon(
      iconName: string,
      x: number,
      y: number,
      width: number,
      height: number,
      color?: string,
    ) {
      if (!ctx) return;

      // Convert kebab-case to PascalCase (e.g., "check" -> "Check", "chevron-down" -> "ChevronDown")
      const pascalName = iconName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      // Get ASN node from @timeless/svg/asn
      const asnNode = (ASN as any)[pascalName];
      if (!asnNode) {
        console.warn(`Icon "${iconName}" not found in @timeless/svg/asn`);
        return;
      }

      // Render the icon directly to the canvas context
      renderIconToCanvas(ctx, asnNode, { color }, x, y, width, height);
    },
  };

  return host;
}

let currentHost: CanvasDocument | null = null;

export function getCurrentHost(): CanvasDocument | null {
  return currentHost;
}

// export function installCanvasHost(options?: CreateCanvasHostOptions) {
//   const host = createCanvasHost(options);
//   currentHost = host;
//   setHost(host);
//   return host;
// }

function registerCanvasComponents() {
  // registerComponent(Grid, CanvasGrid);
  // registerComponent(View, CanvasView);
  // registerComponent(Txt, CanvasTxt);
}

function toPlainStyle(style: any): Record<string, any> {
  if (!style) return {};
  if (typeof style === "string") return parseCssText(style);
  if (isRef(style)) return toPlainStyle((style as any).value);
  if (typeof style !== "object") return {};

  const out: Record<string, any> = {};
  for (const k of Object.keys(style)) {
    const vv = (style as any)[k];
    const v = isRef(vv) ? (vv as any).value : vv;
    if (v === undefined || v === null || v === false) continue;
    out[k] = v;
  }
  return out;
}
