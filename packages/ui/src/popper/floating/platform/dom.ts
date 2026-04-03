import type { Platform } from "../types";
import type { Dimensions, ElementRects, Rect, Strategy } from "../utils";

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Check if a value is an Element
 */
function isElement(value: any): boolean {
  if (!isBrowser()) return false;
  return value instanceof Element;
}

/**
 * Check if a value is an HTMLElement
 */
function isHTMLElement(value: any): boolean {
  if (!isBrowser()) return false;
  return value instanceof HTMLElement;
}

/**
 * Get the bounding client rect of an element, with fallback for virtual elements
 */
function getBoundingClientRect(element: any): Rect {
  if (!element) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  // Virtual element with getBoundingClientRect method
  if (typeof element.getBoundingClientRect === "function") {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x ?? rect.left ?? 0,
      y: rect.y ?? rect.top ?? 0,
      width: rect.width ?? 0,
      height: rect.height ?? 0,
    };
  }

  return { x: 0, y: 0, width: 0, height: 0 };
}

/**
 * Get the dimensions of an element
 */
function getDimensions(element: any): Dimensions {
  if (!element) {
    return { width: 0, height: 0 };
  }

  if (isHTMLElement(element)) {
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
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
    return {
      x: 0,
      y: 0,
      width: Infinity,
      height: Infinity,
    };
  }

  return {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
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
  if (!isHTMLElement(element)) {
    return null;
  }
  return element.offsetParent || document.body;
}

/**
 * Check if the element's text direction is RTL
 */
function isRTL(element: any): boolean {
  if (!isHTMLElement(element)) {
    return false;
  }
  return getComputedStyle(element).direction === "rtl";
}

/**
 * Get the scale of an element (for CSS transforms)
 */
function getScale(element: any): { x: number; y: number } {
  if (!isHTMLElement(element)) {
    return { x: 1, y: 1 };
  }

  const rect = element.getBoundingClientRect();
  const scaleX =
    rect.width > 0 ? Math.round(rect.width) / element.offsetWidth || 1 : 1;
  const scaleY =
    rect.height > 0 ? Math.round(rect.height) / element.offsetHeight || 1 : 1;

  return { x: scaleX, y: scaleY };
}

/**
 * Get the document element
 */
function getDocumentElement(element: any): any {
  if (!isBrowser()) {
    return null;
  }
  if (isElement(element)) {
    return element.ownerDocument?.documentElement || document.documentElement;
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
