import { describe, it, expect, afterEach } from "vitest";
import type { Platform } from "@timeless/base";

import { PopperCore, getPopperPlatform, setPopperPlatform } from "@/popper";
import { SelectCore } from "@/select";

function createPlatform(size: { width: number; height: number }): Platform {
  return {
    addEventListener: () => () => {},
    patchBodyStyle: () => {},
    getViewportSize: () => size,
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
}

describe("Popper platform injection", () => {
  afterEach(() => {
    setPopperPlatform(undefined);
  });

  it("PopperCore 默认应使用全局注入的 platform", () => {
    const platform = createPlatform({ width: 375, height: 812 });

    setPopperPlatform(platform);

    const popper = new PopperCore();

    expect(getPopperPlatform()).toBe(platform);
    expect(popper.platform).toBe(platform);
    expect(popper.platform.getViewportSize()).toEqual({ width: 375, height: 812 });
  });

  it("上层组件不传 platform 时应复用全局注入能力", () => {
    const platform = createPlatform({ width: 430, height: 932 });

    setPopperPlatform(platform);

    const select = new SelectCore({ defaultValue: null });

    expect(select.popper$.platform).toBe(platform);
    expect(select.popper$.platform.getViewportSize()).toEqual({
      width: 430,
      height: 932,
    });
  });

  it("显式传入的 platform 应覆盖全局注入", () => {
    const injected = createPlatform({ width: 375, height: 812 });
    const local = createPlatform({ width: 1024, height: 768 });

    setPopperPlatform(injected);

    const popper = new PopperCore({ platform: local });

    expect(popper.platform).toBe(local);
    expect(popper.platform.getViewportSize()).toEqual({ width: 1024, height: 768 });
  });
});
