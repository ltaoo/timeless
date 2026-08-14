import { describe, it, expect, vi, beforeEach } from "vitest";

import { PopoverCore } from "@/popover";

describe("PopoverCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const popover = new PopoverCore();
      expect(popover.visible).toBe(false);
      expect(popover._side).toBe("bottom");
      expect(popover._align).toBe("end");
      expect(popover._closeable).toBe(true);
    });

    it("可以设置 side", () => {
      const popover = new PopoverCore({ side: "top" });
      expect(popover._side).toBe("top");
    });

    it("可以设置 align", () => {
      const popover = new PopoverCore({ align: "start" });
      expect(popover._align).toBe("start");
    });

    it("可以设置 closeable", () => {
      const popover = new PopoverCore({ closeable: false });
      expect(popover._closeable).toBe(false);
    });

    it("应将 offsetX 和 offsetY 转交给 PopperCore", () => {
      const popover = new PopoverCore({ offsetX: 3, offsetY: -8 });

      expect(popover.popper.offsetX).toBe(3);
      expect(popover.popper.offsetY).toBe(-8);
    });
  });

  describe("show / hide", () => {
    it("show 应显示 popover", () => {
      const popover = new PopoverCore();
      popover.show();
      expect(popover.visible).toBe(true);
    });

    it("hide 应隐藏 popover", () => {
      const popover = new PopoverCore();
      popover.show();
      popover.hide();
      expect(popover.visible).toBe(false);
    });

    it("已隐藏状态下再次调用 hide 不应重复触发", () => {
      const popover = new PopoverCore();
      const handler = vi.fn();
      popover.onHide(handler);
      popover.show();
      popover.hide();
      popover.hide();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("show 应触发 Show 事件", () => {
      const popover = new PopoverCore();
      const handler = vi.fn();
      popover.onShow(handler);
      popover.show();
      expect(handler).toHaveBeenCalled();
    });

    it("hide 应触发 Hidden 事件", () => {
      const popover = new PopoverCore();
      const handler = vi.fn();
      popover.onHide(handler);
      popover.show();
      popover.hide();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("toggle", () => {
    it("应切换显示状态", () => {
      const popover = new PopoverCore();
      popover.toggle();
      expect(popover.visible).toBe(true);
      popover.toggle();
      expect(popover.visible).toBe(false);
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const popover = new PopoverCore();
      expect(popover.state.visible).toBe(false);
      expect(popover.state.closeable).toBe(true);
    });
  });

  describe("事件监听", () => {
    it("onShow 应返回取消监听函数", () => {
      const popover = new PopoverCore();
      const handler = vi.fn();
      const unlisten = popover.onShow(handler);
      popover.show();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      popover.hide();
      popover.show();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onHide 应返回取消监听函数", () => {
      const popover = new PopoverCore();
      const handler = vi.fn();
      const unlisten = popover.onHide(handler);
      popover.show();
      popover.hide();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      popover.show();
      popover.hide();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const popover = new PopoverCore();
      const handler = vi.fn();
      const unlisten = popover.onStateChange(handler);
      popover.show();
      expect(handler).toHaveBeenCalled();
      unlisten();
      popover.hide();
      const callCount = handler.mock.calls.length;
      popover.show();
      expect(handler.mock.calls.length).toBe(callCount);
    });
  });
});
