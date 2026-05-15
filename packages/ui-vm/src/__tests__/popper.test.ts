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

describe("Popper item-aligned placement", () => {
  it("应在 floating 后挂载时补算已到达的 item-aligned 定位", () => {
    const popper = new PopperCore({
      mode: "item-aligned",
      platform: createPlatform({ width: 1024, height: 768 }),
    });

    popper.viewport$.rect.contentHeight = 168;
    popper.viewport$.rect.height = 168;
    popper.viewport$.rect.offsetTop = 0;
    popper.viewport$.rect.paddingTop = 4;
    popper.viewport$.rect.paddingBottom = 4;

    popper.adjustContentPositionWithOffsetTop({
      selectedItem: {
        offsetTop: 4,
        offsetHeight: 32,
        bottom: 36,
        isFirst: true,
        isLast: false,
      },
    });

    expect(popper.state.height).toBe(0);

    popper.setReference({
      getRect: () => ({
        x: 100,
        y: 100,
        left: 100,
        top: 100,
        right: 260,
        bottom: 132,
        width: 160,
        height: 32,
      }),
    });
    popper.setFloating({
      getRect: () => ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 180,
        bottom: 168,
        width: 180,
        height: 168,
      }),
    });

    expect(popper.state.height).toBeGreaterThan(0);
    expect(popper.state.minWidth).toBe(159);
    expect(popper.state.isPlaced).toBe(true);
  });
});
