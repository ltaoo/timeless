import * as Timeless from "@timeless/timeless";

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

export type TimelessHost = {
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
  addEventListener(target: any, type: string, handler: any, options?: any): void;
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

export type TimelessElement = any;

const setHost: (host: any) => void = (Timeless as any).setHost;
const isElement: (v: any) => boolean = (Timeless as any).isElement;
const isRef: (v: any) => boolean = (Timeless as any).isRef;

// import { CanvasGrid } from "../modules/grid";
// import { CanvasView } from "../modules/view";
// import { CanvasTxt } from "../modules/text";

// const { isDescriptor, mount, commitTree } = VNode;

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

export type CanvasHost = TimelessHost & {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  body: CanvasElement;
  draw(): void;
  destroy(): void;
  enableDebug(enabled: boolean): void;
};

export type RenderOptions = Omit<CreateCanvasHostOptions, "canvas"> & {
  onVNodeTreeCreated?: (vnode: any, host: CanvasHost) => void;
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
  | { op: "fillText"; text: string; x: number; y: number };

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
      default:
        break;
    }
  }
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

      const layoutChildren = (children: CanvasNode[]) => {
        for (const child of children) {
          if (child.kind === "fragment") {
            layoutChildren(child.childNodes);
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

      layoutChildren(node.childNodes);

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

export function createCanvasHost(
  options: CreateCanvasHostOptions = {},
): CanvasHost {
  const canvas = options.canvas ?? null;
  const win = options.window ?? (globalThis as any).window;
  const dpr =
    options.dpr ??
    (typeof win !== "undefined" && win?.devicePixelRatio
      ? win.devicePixelRatio
      : 1);

  const ctx = options.context ?? (canvas ? canvas.getContext("2d") : null);

  const body = createCanvasElement("body");

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

  const host: CanvasHost = {
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
  };

  return host;
}

let currentHost: CanvasHost | null = null;

export function getCurrentHost(): CanvasHost | null {
  return currentHost;
}

export function installCanvasHost(options?: CreateCanvasHostOptions) {
  const host = createCanvasHost(options);
  currentHost = host;
  setHost(host);
  return host;
}

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

function buildCanvasTreeFromTimelessElement(
  elm: TimelessElement,
  host: CanvasHost,
): CanvasNode | null {
  if (!elm || !isElement(elm)) return null;
  const root = elm.render();
  if (!isCanvasNode(root)) return null;

  if (elm.t === "view" && root.kind === "element") {
    const props = elm.props ?? {};

    if ((props as any).style) {
      (root as CanvasElement).style = toPlainStyle((props as any).style);
    }

    const styleSets = (props as any).styleSets;
    if (styleSets) {
      const v = isRef(styleSets) ? (styleSets as any).value : styleSets;
      if (Array.isArray(v)) {
        (root as CanvasElement).className = v.join(" ");
      } else if (typeof v === "string") {
        (root as CanvasElement).className = v;
      }
    }

    const children = elm.children;
    if (Array.isArray(children)) {
      for (const child of children) {
        const sub = buildCanvasTreeFromTimelessElement(child, host);
        if (sub) host.appendChild(root, sub);
      }
    }
  }

  return root;
}

export function render(
  elm: TimelessElement,
  canvas: HTMLCanvasElement,
  options: RenderOptions = {},
) {
  if (!canvas) {
    console.error("[Canvas Render] Canvas element not found");
    return;
  }
  if (!elm) {
    console.error("[Canvas Render] Element is null");
    return;
  }

  const { onVNodeTreeCreated, ...hostOptions } = options;

  // if (isDescriptor(elm)) {
  //   const host = createCanvasHost({ ...hostOptions, canvas });
  //   currentHost = host;
  //   setHost(host);
  //   registerCanvasComponents();

  //   const baseRenderer = getRenderer();
  //   let drawScheduled = false;

  //   const wrappedRenderer = {
  //     ...baseRenderer,
  //     patchNode(vnode: any, changes: any) {
  //       baseRenderer.patchNode(vnode, changes);
  //       if (!drawScheduled) {
  //         drawScheduled = true;
  //         queueMicrotask(() => {
  //           drawScheduled = false;
  //           host.draw();
  //         });
  //       }
  //     },
  //   };
  //   setRenderer(wrappedRenderer);

  //   const vnode = mount(elm);
  //   commitTree(vnode, getRenderer());
  //   const body = host.getBody ? host.getBody() : host.body;
  //   host.clearChildren(body);
  //   host.appendChild(body, vnode._hostNode);
  //   onVNodeTreeCreated?.(vnode, host);
  //   host.draw();
  //   return host;
  // }

  if (!isElement(elm)) {
    console.error("[Canvas Render] Invalid element");
    return;
  }

  const host = createCanvasHost({ ...hostOptions, canvas });
  // currentHost = host;
  // setHost(host);
  // registerCanvasComponents();

  // const body = host.getBody ? host.getBody() : host.body;
  // host.clearChildren(body);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const content = buildCanvasTreeFromTimelessElement(elm, host);
  if (!content) {
    console.error("[Canvas Render] Element render return null");
    return host;
  }

  draw(ctx, content, {

  });

  // host.appendChild(body, content);
  // onVNodeTreeCreated?.(elm as any, host);
  // host.draw();
  return;
}
