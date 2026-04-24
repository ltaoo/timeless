import type { Platform } from "@timeless/base";

const noop = () => {};

const default_platform: Platform = {
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

let injected_platform: Platform | undefined;

/**
 * 为 Popper 注入平台能力。通常在应用启动时调用一次即可，
 * 之后各个 Popper/Select/Tooltip 等组件无需再层层透传 `platform`。
 */
export function setPopperPlatform<T extends Platform = Platform>(
  platform?: T,
): T | undefined {
  injected_platform = platform;
  return platform;
}

export function getPopperPlatform(): Platform {
  return injected_platform ?? default_platform;
}
