import { setPlatform, type Platform } from "@timeless/timeless";
import { setPopperPlatform } from "@timeless/inner-vm";

interface Rect {
  x: number;
  y: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface ElementRects {
  reference: Rect;
  floating: Rect;
}

type Strategy = "absolute" | "fixed";

import { render } from "./renderer";
import { hydrate } from "./renderer/hydrate";

console.log("timeless.dom.version " + __Version);

export { render };
export { hydrate };
export { build, buildAndRender } from "./renderer/build";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

const zeroRect: Rect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
};

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function normalizeRect(rect: Partial<Rect> | null | undefined): Rect {
  if (!rect) {
    return { ...zeroRect };
  }
  const x = numberOr(rect.x, numberOr(rect.left, 0));
  const y = numberOr(rect.y, numberOr(rect.top, 0));
  const width = numberOr(rect.width, 0);
  const height = numberOr(rect.height, 0);
  const left = numberOr(rect.left, x);
  const top = numberOr(rect.top, y);
  return {
    x,
    y,
    top,
    left,
    width,
    height,
    right: numberOr(rect.right, left + width),
    bottom: numberOr(rect.bottom, top + height),
  };
}

function unwrapElement(value: unknown): unknown {
  if (value && typeof value === "object") {
    const maybeWrapped = value as { $el?: unknown; contextElement?: unknown };
    if (maybeWrapped.$el) {
      return maybeWrapped.$el;
    }
    if (maybeWrapped.contextElement) {
      return maybeWrapped.contextElement;
    }
  }
  return value;
}

function isElement(value: unknown): boolean {
  if (!isBrowser()) return false;
  return unwrapElement(value) instanceof Element;
}

function isHTMLElement(value: unknown): boolean {
  if (!isBrowser()) return false;
  return unwrapElement(value) instanceof HTMLElement;
}

function getBoundingClientRect(element: unknown): Rect {
  if (!element) {
    return { ...zeroRect };
  }

  if (typeof (element as { getRect?: unknown }).getRect === "function") {
    return normalizeRect(
      (element as { getRect: () => Partial<Rect> }).getRect(),
    );
  }

  const unwrapped = unwrapElement(element);
  if (typeof (unwrapped as any).getBoundingClientRect === "function") {
    return normalizeRect((unwrapped as Element).getBoundingClientRect());
  }

  return { ...zeroRect };
}

function getDimensions(element: unknown): Dimensions {
  if (!element) {
    return { width: 0, height: 0 };
  }

  const unwrapped = unwrapElement(element);
  if (isHTMLElement(unwrapped)) {
    const el = unwrapped as HTMLElement;
    return {
      width: el.offsetWidth,
      height: el.offsetHeight,
    };
  }

  const rect = getBoundingClientRect(element);
  return { width: rect.width, height: rect.height };
}

function getElementRects(args: {
  reference: unknown;
  floating: unknown;
  strategy: Strategy;
}): ElementRects {
  const { reference, floating } = args;

  return {
    reference: getBoundingClientRect(reference),
    floating: getBoundingClientRect(floating),
  };
}

function getClippingRect(_args: {
  element: unknown;
  boundary: unknown;
  rootBoundary: unknown;
  strategy: Strategy;
}): Rect {
  if (!isBrowser()) {
    return normalizeRect({ x: 0, y: 0, width: Infinity, height: Infinity });
  }

  return normalizeRect({
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  });
}

function getOffsetParent(element: unknown): unknown {
  const unwrapped = unwrapElement(element);
  if (!isHTMLElement(unwrapped)) {
    return null;
  }
  const el = unwrapped as HTMLElement;
  return el.offsetParent || document.body;
}

function isRTL(element: unknown): boolean {
  const unwrapped = unwrapElement(element);
  if (!isHTMLElement(unwrapped)) {
    return false;
  }
  const el = unwrapped as HTMLElement;
  return getComputedStyle(el).direction === "rtl";
}

function getScale(element: unknown): { x: number; y: number } {
  const unwrapped = unwrapElement(element);
  if (!isHTMLElement(unwrapped)) {
    return { x: 1, y: 1 };
  }

  const el = unwrapped as HTMLElement;
  const rect = el.getBoundingClientRect();
  const scaleX =
    rect.width > 0 ? Math.round(rect.width) / el.offsetWidth || 1 : 1;
  const scaleY =
    rect.height > 0 ? Math.round(rect.height) / el.offsetHeight || 1 : 1;

  return { x: scaleX, y: scaleY };
}

function getDocumentElement(element?: unknown): unknown {
  if (!isBrowser()) {
    return null;
  }
  const unwrapped = unwrapElement(element);
  if (unwrapped && isElement(unwrapped)) {
    return (
      (unwrapped as Element).ownerDocument?.documentElement ||
      document.documentElement
    );
  }
  return document.documentElement;
}

export const platform = setPlatform<Platform>({
  addEventListener(
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions,
  ) {
    if (isBrowser()) {
      window.addEventListener(type, handler, options);
      return () => window.removeEventListener(type, handler, options);
    }
    return () => {};
  },

  patchBodyStyle(style: Record<string, string>) {
    if (isBrowser()) {
      Object.assign(document.body.style, style);
    }
  },

  getViewportSize() {
    if (isBrowser()) {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return { width: 0, height: 0 };
  },

  isBrowser,

  isElement,

  isHTMLElement,

  getBoundingClientRect,

  getDimensions,

  getElementRects,

  getClippingRect,

  getOffsetParent,

  isRTL,

  getScale,

  getDocumentElement,
});

// PopperCore owns its platform selection. Keep it on the same DOM adapter as
// the primitive renderer instead of letting view primitives replace it later.
setPopperPlatform(platform);
