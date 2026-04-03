import {
  setHost,
  type HeadlessHost,
  type BoundingRect,
  isElement,
  type TimelessElement,
} from "@timeless/timeless";

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

export type CanvasHost = HeadlessHost & {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  body: CanvasElement;
  draw(): void;
  destroy(): void;
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
        const idx = child.parentNode.childNodes.indexOf(child);
        if (idx !== -1) child.parentNode.childNodes.splice(idx, 1);
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
        const oidx = newNode.parentNode.childNodes.indexOf(newNode);
        if (oidx !== -1) newNode.parentNode.childNodes.splice(oidx, 1);
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
  const node: CanvasText = {
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
  };
  return node;
}

export function createCanvasFragment(): CanvasFragment {
  const children: CanvasNode[] = [];

  const node: CanvasFragment = {
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
        const idx = child.parentNode.childNodes.indexOf(child);
        if (idx !== -1) child.parentNode.childNodes.splice(idx, 1);
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
        const oidx = newNode.parentNode.childNodes.indexOf(newNode);
        if (oidx !== -1) newNode.parentNode.childNodes.splice(oidx, 1);
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

function parseLength(
  value: any,
  parentSize: number | null,
): number | null {
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

function resolveRect(
  node: CanvasElement,
  parentRect: BoundingRect | null,
): BoundingRect {
  const parentWidth = parentRect ? parentRect.width : null;
  const parentHeight = parentRect ? parentRect.height : null;

  const left = parseLength(styleGetFirst(node, ["left", "x"]), parentWidth) ?? 0;
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

function containsPoint(rect: BoundingRect, p: Point) {
  return (
    p.x >= rect.left &&
    p.x <= rect.right &&
    p.y >= rect.top &&
    p.y <= rect.bottom
  );
}

function walkDrawables(root: CanvasNode, fn: (node: CanvasNode) => void) {
  fn(root);
  for (const child of root.childNodes) {
    walkDrawables(child, fn);
  }
}

function pickNodeAtPoint(
  root: CanvasNode,
  point: Point,
  rectCache: WeakMap<CanvasNode, BoundingRect>,
): CanvasNode | null {
  const children = root.childNodes;
  for (let i = children.length - 1; i >= 0; i--) {
    const hit = pickNodeAtPoint(children[i], point, rectCache);
    if (hit) return hit;
  }

  if (root.kind !== "element") return null;
  const rect = rectCache.get(root);
  if (!rect) return null;
  if (rect.width <= 0 || rect.height <= 0) return null;
  return containsPoint(rect, point) ? root : null;
}

type AnyEventHandler = (event: any) => void;

function normalizeCapture(options?: any) {
  if (typeof options === "boolean") return options;
  return !!options?.capture;
}

function computeEventPoint(
  canvas: HTMLCanvasElement,
  event: any,
): Point {
  if (typeof event?.offsetX === "number" && typeof event?.offsetY === "number") {
    return { x: event.offsetX, y: event.offsetY };
  }
  const rect = canvas.getBoundingClientRect();
  const clientX = typeof event?.clientX === "number" ? event.clientX : rect.left;
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
): { width: number; height: number } {
  const cssWidth =
    canvas.clientWidth ||
    parseNumber(canvas.getAttribute("width")) ||
    canvas.width / dpr ||
    0;
  const cssHeight =
    canvas.clientHeight ||
    parseNumber(canvas.getAttribute("height")) ||
    canvas.height / dpr ||
    0;

  const width = Math.max(0, cssWidth);
  const height = Math.max(0, cssHeight);
  const nextW = Math.max(1, Math.round(width * dpr));
  const nextH = Math.max(1, Math.round(height * dpr));

  if (canvas.width !== nextW) canvas.width = nextW;
  if (canvas.height !== nextH) canvas.height = nextH;

  return { width, height };
}

function renderTreeToCanvas(
  root: CanvasNode,
  ctx: CanvasRenderingContext2D,
  rectCache: WeakMap<CanvasNode, BoundingRect>,
  clearColor: string | null | undefined,
  dpr: number,
) {
  const { width, height } = applyCanvasSizing(ctx.canvas, dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  rectCache.set(root, {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    x: 0,
    y: 0,
  });

  if (shouldClear(ctx, clearColor)) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  walkDrawables(root, (node) => {
    if (!isCanvasNode(node)) return;

    if (node.kind === "element") {
      const rect = resolveRect(
        node,
        node.parentNode ? rectCache.get(node.parentNode) ?? null : null,
      );
      rectCache.set(node, rect);

      const opacity = parseNumber(styleGet(node, "opacity")) ?? 1;
      if (opacity <= 0) return;

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

      if (rect.width > 0 && rect.height > 0) {
        ctx.save();
        ctx.globalAlpha *= opacity;
        if (background) {
          ctx.fillStyle = background;
          ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
        }
        if (borderColor && borderWidth > 0) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth;
          ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
        }
        ctx.restore();
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
            "#000";
          const font = styleGet(node, "font") ?? "16px sans-serif";
          const textAlign = styleGet(node, "textAlign") ?? "left";
          const textBaseline = styleGet(node, "textBaseline") ?? "top";
          const padLeft = parseLength(styleGet(node, "paddingLeft"), null) ?? 0;
          const padTop = parseLength(styleGet(node, "paddingTop"), null) ?? 0;

          ctx.save();
          ctx.globalAlpha *= opacity;
          ctx.fillStyle = color;
          ctx.font = font;
          ctx.textAlign = textAlign;
          ctx.textBaseline = textBaseline;
          ctx.fillText(text, rect.left + padLeft, rect.top + padTop);
          ctx.restore();
        }
      }

      return;
    }

    if (node.kind === "text") {
      const parent = node.parentNode;
      if (!parent || parent.kind !== "element") return;
      const rect = rectCache.get(parent);
      if (!rect) return;
      const color =
        styleGetFirst(parent, ["color", "fillStyle"]) ??
        (parent as CanvasElement).getAttribute("color") ??
        "#000";
      const font = styleGet(parent as CanvasElement, "font") ?? "16px sans-serif";
      const textAlign = styleGet(parent as CanvasElement, "textAlign") ?? "left";
      const textBaseline = styleGet(parent as CanvasElement, "textBaseline") ?? "top";
      const padLeft = parseLength(styleGet(parent as CanvasElement, "paddingLeft"), null) ?? 0;
      const padTop = parseLength(styleGet(parent as CanvasElement, "paddingTop"), null) ?? 0;

      ctx.save();
      ctx.fillStyle = color;
      ctx.font = font;
      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;
      ctx.fillText(node.textContent, rect.left + padLeft, rect.top + padTop);
      ctx.restore();
    }
  });
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

  const ctx =
    options.context ??
    (canvas ? canvas.getContext("2d") : null);

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
      const originalStopPropagation = (event as any).stopPropagation?.bind(event);
      const originalStopImmediatePropagation = (event as any).stopImmediatePropagation?.bind(event);

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
          (event as any).stopImmediatePropagation = originalStopImmediatePropagation;
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
      renderTreeToCanvas(body, ctx, rectCache, clearColor, dpr);
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
      return createCanvasElement(tag);
    },
    createElementNS(_namespace: string, tag: string) {
      return createCanvasElement(tag);
    },
    createTextNode(text: string) {
      return createCanvasText(text);
    },
    createDocumentFragment() {
      return createCanvasFragment();
    },
    appendChild(parent: any, child: any) {
      if (!isCanvasNode(parent) || !isCanvasNode(child)) return;
      parent.appendChild(child);
    },
    removeChild(parent: any, child: any) {
      if (!isCanvasNode(parent) || !isCanvasNode(child)) return;
      parent.removeChild(child);
    },
    insertBefore(parent: any, child: any, before: any) {
      if (!isCanvasNode(parent) || !isCanvasNode(child)) return;
      parent.insertBefore(child, isCanvasNode(before) ? before : null);
    },
    replaceChild(parent: any, newChild: any, oldChild: any) {
      if (!isCanvasNode(parent) || !isCanvasNode(newChild) || !isCanvasNode(oldChild)) return;
      parent.replaceChild(newChild, oldChild);
    },
    clearChildren(parent: any) {
      if (!isCanvasNode(parent)) return;
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    },
    setAttribute(el: any, name: string, value: string) {
      if (!isCanvasElement(el)) return;
      el.setAttribute(name, value);
    },
    removeAttribute(el: any, name: string) {
      if (!isCanvasElement(el)) return;
      el.removeAttribute(name);
    },
    setClassName(el: any, className: string) {
      if (!isCanvasElement(el)) return;
      el.className = className;
    },
    setStyleText(el: any, cssText: string) {
      if (!isCanvasElement(el)) return;
      (el as any).style = parseCssText(cssText) as any;
    },
    patchStyle(el: any, patch: Record<string, string>) {
      if (!isCanvasElement(el)) return;
      for (const k of Object.keys(patch)) {
        (el.style as any)[k] = patch[k];
      }
    },
    setTextContent(node: any, text: string) {
      if (!isCanvasNode(node)) return;
      node.textContent = text;
    },
    setInnerHTML(el: any, html: string) {
      if (!isCanvasElement(el)) return;
      el.innerHTML = html;
      el.textContent = html;
    },
    setProperty(el: any, key: string, value: any) {
      if (!isCanvasNode(el)) return;
      (el as any)[key] = value;
    },
    addEventListener(target: any, type: string, handler: any, options?: any) {
      if (!isCanvasNode(target)) {
        target?.addEventListener?.(type, handler, options);
        return;
      }
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
    },
    removeEventListener(target: any, type: string, handler: any, options?: any) {
      if (!isCanvasNode(target)) {
        target?.removeEventListener?.(type, handler, options);
        return;
      }
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
    },
    addDocumentEventListener(type: string, handler: any, options?: any) {
      canvas?.addEventListener(type, handler, options);
    },
    removeDocumentEventListener(type: string, handler: any, options?: any) {
      canvas?.removeEventListener(type, handler, options);
    },
    patchBodyStyle(_patch: { cursor?: string; userSelect?: string }) {},
    setTimeout(handler: () => void, ms: number) {
      return win?.setTimeout ? win.setTimeout(handler, ms) : setTimeout(handler, ms);
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
      return rectCache.get(el) ?? { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
    },
    getViewportSize() {
      if (!canvas) return { width: 0, height: 0 };
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      return { width: Number.isFinite(w) ? w : 0, height: Number.isFinite(h) ? h : 0 };
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

export function installCanvasHost(options?: CreateCanvasHostOptions) {
  const host = createCanvasHost(options);
  setHost(host);
  return host;
}

export function render(elm: TimelessElement, canvas: HTMLCanvasElement | null, options: Omit<CreateCanvasHostOptions, "canvas"> = {}) {
  if (!canvas) {
    console.error("[Canvas Render] Canvas element not found");
    return;
  }
  if (!elm) {
    console.error("[Canvas Render] Element is null");
    return;
  }
  if (!isElement(elm)) {
    console.error("[Canvas Render] Invalid element");
    return;
  }

  const host = createCanvasHost({ ...options, canvas });
  setHost(host);

  const content = elm.render();
  if (!content) {
    console.error("[Canvas Render] Element render returned null");
    return;
  }

  host.clearChildren(host.getBody());
  host.appendChild(host.getBody(), content as any);
  host.draw();
  return host;
}

export function draw(host: CanvasHost) {
  host.draw();
}
