import type { Platform } from "../types";
import type {
  ClientRectObject,
  Dimensions,
  ElementRects,
  Rect,
  Strategy,
} from "../utils";

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

const zeroRect: ClientRectObject = {
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

function normalizeRect(
  rect: Partial<ClientRectObject> | null | undefined,
): ClientRectObject {
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

function unwrapElement(value: any): any {
  if (value && typeof value === "object") {
    if (value.$el) {
      return value.$el;
    }
    if (value.contextElement) {
      return value.contextElement;
    }
  }
  return value;
}

/**
 * Check if a value is an Element
 */
function isElement(value: any): boolean {
  if (!isBrowser()) return false;
  return unwrapElement(value) instanceof Element;
}

/**
 * Check if a value is an HTMLElement
 */
function isHTMLElement(value: any): boolean {
  if (!isBrowser()) return false;
  return unwrapElement(value) instanceof HTMLElement;
}

/**
 * Get the bounding client rect of an element, with fallback for virtual elements
 */
function getBoundingClientRect(element: any): Rect {
  if (!element) {
    return { ...zeroRect };
  }

  if (typeof element.getRect === "function") {
    return normalizeRect(element.getRect());
  }

  const unwrapped = unwrapElement(element);
  if (typeof unwrapped.getBoundingClientRect === "function") {
    return normalizeRect(unwrapped.getBoundingClientRect());
  }

  return { ...zeroRect };
}

/**
 * Get the dimensions of an element
 */
function getDimensions(element: any): Dimensions {
  if (!element) {
    return { width: 0, height: 0 };
  }

  const unwrapped = unwrapElement(element);
  if (isHTMLElement(unwrapped)) {
    return {
      width: unwrapped.offsetWidth,
      height: unwrapped.offsetHeight,
    };
  }

  // Fall back to bounding rect
  const rect = getBoundingClientRect(element);
  return { width: rect.width, height: rect.height };
}

/**
 * Get the viewport clipping rect
 */
function getViewportRect(): Rect {
  if (!isBrowser()) {
    // SSR fallback - return infinite viewport
    return normalizeRect({
      x: 0,
      y: 0,
      width: Infinity,
      height: Infinity,
    });
  }

  return normalizeRect({
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  });
}

/**
 * Get element rects for positioning calculation
 */
function getElementRects(args: {
  reference: any;
  floating: any;
  strategy: Strategy;
}): ElementRects {
  const { reference, floating } = args;

  return {
    reference: getBoundingClientRect(reference),
    floating: getBoundingClientRect(floating),
  };
}

/**
 * Get the clipping rect for overflow detection
 * Simplified implementation that only supports viewport boundary
 */
function getClippingRect(_args: {
  element: any;
  boundary: any;
  rootBoundary: any;
  strategy: Strategy;
}): Rect {
  // For simplicity, we only use viewport as the clipping boundary
  return getViewportRect();
}

/**
 * Get the offset parent of an element
 */
function getOffsetParent(element: any): any {
  const unwrapped = unwrapElement(element);
  if (!isHTMLElement(unwrapped)) {
    return null;
  }
  return unwrapped.offsetParent || document.body;
}

/**
 * Check if the element's text direction is RTL
 */
function isRTL(element: any): boolean {
  const unwrapped = unwrapElement(element);
  if (!isHTMLElement(unwrapped)) {
    return false;
  }
  return getComputedStyle(unwrapped).direction === "rtl";
}

/**
 * Get the scale of an element (for CSS transforms)
 */
function getScale(element: any): { x: number; y: number } {
  const unwrapped = unwrapElement(element);
  if (!isHTMLElement(unwrapped)) {
    return { x: 1, y: 1 };
  }

  const rect = unwrapped.getBoundingClientRect();
  const scaleX =
    rect.width > 0 ? Math.round(rect.width) / unwrapped.offsetWidth || 1 : 1;
  const scaleY =
    rect.height > 0 ? Math.round(rect.height) / unwrapped.offsetHeight || 1 : 1;

  return { x: scaleX, y: scaleY };
}

/**
 * Get the document element
 */
function getDocumentElement(element: any): any {
  if (!isBrowser()) {
    return null;
  }
  const unwrapped = unwrapElement(element);
  if (isElement(unwrapped)) {
    return unwrapped.ownerDocument?.documentElement || document.documentElement;
  }
  return document.documentElement;
}

/**
 * Create a DOM platform implementation
 * This is a factory function to avoid accessing DOM APIs at module level
 */
export function getDOMPlatform(): Platform {
  return {
    getElementRects,
    getClippingRect,
    getDimensions,
    getOffsetParent,
    isElement: (value: any) => isElement(value),
    isRTL,
    getScale,
    getDocumentElement,
  };
}
