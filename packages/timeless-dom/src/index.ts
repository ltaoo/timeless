import { setPlatform, type Platform } from "@timeless/timeless";

interface Rect {
  x: number;
  y: number;
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

function isElement(value: unknown): boolean {
  if (!isBrowser()) return false;
  return value instanceof Element;
}

function isHTMLElement(value: unknown): boolean {
  if (!isBrowser()) return false;
  return value instanceof HTMLElement;
}

function getBoundingClientRect(element: unknown): Rect {
  if (!element) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  if (typeof (element as any).getBoundingClientRect === "function") {
    const rect = (element as Element).getBoundingClientRect();
    return {
      x: rect.x ?? rect.left ?? 0,
      y: rect.y ?? rect.top ?? 0,
      width: rect.width ?? 0,
      height: rect.height ?? 0,
    };
  }

  return { x: 0, y: 0, width: 0, height: 0 };
}

function getDimensions(element: unknown): Dimensions {
  if (!element) {
    return { width: 0, height: 0 };
  }

  if (isHTMLElement(element)) {
    const el = element as HTMLElement;
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
    return { x: 0, y: 0, width: Infinity, height: Infinity };
  }

  return {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getOffsetParent(element: unknown): unknown {
  if (!isHTMLElement(element)) {
    return null;
  }
  const el = element as HTMLElement;
  return el.offsetParent || document.body;
}

function isRTL(element: unknown): boolean {
  if (!isHTMLElement(element)) {
    return false;
  }
  const el = element as HTMLElement;
  return getComputedStyle(el).direction === "rtl";
}

function getScale(element: unknown): { x: number; y: number } {
  if (!isHTMLElement(element)) {
    return { x: 1, y: 1 };
  }

  const el = element as HTMLElement;
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
  if (element && isElement(element)) {
    return (
      (element as Element).ownerDocument?.documentElement ||
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
