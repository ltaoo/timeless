import type { Platform } from "../types";

export function getMockPlatform(): Platform {
  return {
    getElementRects: ({ reference, floating, strategy }) => {
      const refRect =
        typeof (reference as any)?.getBoundingClientRect === "function"
          ? (reference as any).getBoundingClientRect()
          : { x: 0, y: 0, width: 0, height: 0 };
      const floatRect =
        typeof (floating as any)?.getBoundingClientRect === "function"
          ? (floating as any).getBoundingClientRect()
          : { x: 0, y: 0, width: 0, height: 0 };

      return {
        reference: {
          x: refRect.x ?? 0,
          y: refRect.y ?? 0,
          width: refRect.width ?? 0,
          height: refRect.height ?? 0,
        },
        floating: {
          x: floatRect.x ?? 0,
          y: floatRect.y ?? 0,
          width: floatRect.width ?? 0,
          height: floatRect.height ?? 0,
        },
      };
    },

    getClippingRect: ({ strategy }) => {
      return {
        x: 0,
        y: 0,
        width: Infinity,
        height: Infinity,
      };
    },

    getDimensions: (element) => {
      if (!element) {
        return { width: 0, height: 0 };
      }
      if (typeof (element as any)?.getBoundingClientRect === "function") {
        const rect = (element as any).getBoundingClientRect();
        return { width: rect.width ?? 0, height: rect.height ?? 0 };
      }
      return { width: 0, height: 0 };
    },

    getOffsetParent: (element) => null,

    isElement: (value) => value instanceof Element,

    isRTL: (element) => false,

    getScale: (element) => ({ x: 1, y: 1 }),

    getDocumentElement: (element) =>
      element?.ownerDocument?.documentElement || document?.documentElement,
  };
}
