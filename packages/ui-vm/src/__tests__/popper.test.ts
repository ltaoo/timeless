import { describe, it, expect, afterEach, vi } from "vitest";
import type { Platform } from "@timeless/inner-base";

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
    expect(popper.platform.getViewportSize()).toEqual({
      width: 375,
      height: 812,
    });
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
    expect(popper.platform.getViewportSize()).toEqual({
      width: 1024,
      height: 768,
    });
  });
});

describe("Popper offset placement", () => {
  function createPopper(options: {
    offsetY: number;
    placement: "top" | "bottom";
  }) {
    const popper = new PopperCore({
      side: "bottom",
      offsetY: options.offsetY,
      platform: createPlatform({ width: 1024, height: 768 }),
    });
    popper.reference = {
      getRect: () => ({
        x: 100,
        y: 300,
        left: 100,
        top: 300,
        right: 140,
        bottom: 340,
        width: 40,
        height: 40,
      }),
    };
    popper.floating = {
      getRect: () => ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 200,
        bottom: 220,
        width: 200,
        height: 220,
      }),
    };
    vi.spyOn(popper, "computePosition").mockResolvedValue({
      x: 100,
      y: 200,
      placement: options.placement,
      strategy: "fixed",
      middleware_data: {},
    });
    return popper;
  }

  it("发生翻转时应反转正 offsetY", async () => {
    const popper = createPopper({ offsetY: 8, placement: "top" });

    await popper.place();

    expect(popper.state.y).toBe(192);
    expect(popper.state.anchorY).toBe(412);
    expect(popper.offsetY).toBe(8);
  });

  it("发生翻转时应反转负 offsetY", async () => {
    const popper = createPopper({ offsetY: -8, placement: "top" });

    await popper.place();

    expect(popper.state.y).toBe(208);
    expect(popper.state.anchorY).toBe(428);
    expect(popper.offsetY).toBe(-8);
  });

  it("未发生翻转时应保持 offsetY 符号", async () => {
    const popper = createPopper({ offsetY: 8, placement: "bottom" });

    await popper.place();

    expect(popper.state.y).toBe(208);
    expect(popper.state.anchorY).toBeUndefined();
    expect(popper.offsetY).toBe(8);
  });

  it("上方内容受高度约束时应使用实际渲染高度计算底边锚点", async () => {
    const popper = createPopper({ offsetY: 8, placement: "top" });
    vi.mocked(popper.computePosition).mockResolvedValue({
      x: 100,
      y: 200,
      placement: "top",
      strategy: "fixed",
      middleware_data: {
        size: {
          availableHeight: 100,
          availableWidth: 200,
        },
      },
    });

    await popper.place();

    expect(popper.state.y).toBe(192);
    expect(popper.state.height).toBe(100);
    expect(popper.state.anchorY).toBe(292);
  });

  it("无效 reference rect 不应产生未处理的定位异常", async () => {
    const popper = new PopperCore({
      platform: createPlatform({ width: 1024, height: 768 }),
    });
    popper.reference = {
      getRect: () => undefined as never,
    };
    popper.floating = {
      getRect: () => ({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 200,
        bottom: 220,
        width: 200,
        height: 220,
      }),
    };

    await expect(popper.place()).resolves.toBeUndefined();
    expect(popper.state.isPlaced).toBe(false);
  });

  it("并发定位只应应用最后一次计算结果", async () => {
    const popper = createPopper({ offsetY: 0, placement: "bottom" });
    let resolve_first: (value: any) => void = () => {};
    let resolve_second: (value: any) => void = () => {};
    vi.mocked(popper.computePosition)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolve_first = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolve_second = resolve;
          }),
      );

    const first_place = popper.place();
    const second_place = popper.place();
    resolve_second({
      x: 300,
      y: 400,
      placement: "top",
      strategy: "fixed",
      middleware_data: {},
    });
    await second_place;
    resolve_first({
      x: 100,
      y: 200,
      placement: "bottom",
      strategy: "fixed",
      middleware_data: {},
    });
    await first_place;

    expect(popper.state.x).toBe(300);
    expect(popper.state.y).toBe(400);
    expect(popper.state.placement).toBe("top");
    expect(popper.state.anchorY).toBe(620);
  });
});

describe("Popper item-aligned placement", () => {
  it("未完成定位前不应设置 height，避免首次测量被压成 0", () => {
    const popper = new PopperCore();

    expect(popper.state.isPlaced).toBe(false);
    expect(popper.state.height).toBeUndefined();
  });

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

    expect(popper.state.height).toBeUndefined();

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
