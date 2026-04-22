import { Platform } from "@timeless/base";

const noop = () => {};

let _platform: Platform = {
  addEventListener: () => noop,
  patchBodyStyle: noop,
  getViewportSize: () => ({ width: 0, height: 0 }),
  isBrowser: () => false,
  isElement: () => false,
  isHTMLElement: () => false,
  getBoundingClientRect: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  getDimensions: () => ({ width: 0, height: 0 }),
  getElementRects: () => ({
    reference: { x: 0, y: 0, width: 0, height: 0 },
    floating: { x: 0, y: 0, width: 0, height: 0 },
  }),
  getClippingRect: () => ({ x: 0, y: 0, width: Infinity, height: Infinity }),
  getOffsetParent: () => null,
  isRTL: () => false,
  getScale: () => ({ x: 1, y: 1 }),
  getDocumentElement: () => null,
};

export function setPlatform<T extends Platform = Platform>(p: T): T {
  _platform = p;
  return p;
}

export function getPlatform(): Platform {
  return _platform;
}
