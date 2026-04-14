import { describe, it, expect, vi, beforeEach } from "vitest";

import { TooltipCore } from "@/tooltip";

describe("TooltipCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const tooltip = new TooltipCore();
      expect(tooltip.visible).toBe(false);
      expect(tooltip._side).toBe("top");
      expect(tooltip._align).toBe("center");
    });

    it("可以设置 side", () => {
      const tooltip = new TooltipCore({ side: "bottom" });
      expect(tooltip._side).toBe("bottom");
    });

    it("可以设置 align", () => {
      const tooltip = new TooltipCore({ align: "start" });
      expect(tooltip._align).toBe("start");
    });
  });

  describe("show / hide", () => {
    it("show 应显示 tooltip", () => {
      const tooltip = new TooltipCore();
      tooltip.show();
      expect(tooltip.visible).toBe(true);
    });

    it("已显示状态下再次调用 show 不应重复触发", () => {
      const tooltip = new TooltipCore();
      const handler = vi.fn();
      tooltip.onShow(handler);
      tooltip.show();
      tooltip.show();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("hide 应隐藏 tooltip", () => {
      const tooltip = new TooltipCore();
      tooltip.show();
      tooltip.hide();
      expect(tooltip.visible).toBe(false);
    });

    it("已隐藏状态下再次调用 hide 不应重复触发", () => {
      const tooltip = new TooltipCore();
      const handler = vi.fn();
      tooltip.onHide(handler);
      tooltip.show();
      tooltip.hide();
      tooltip.hide();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("show 应触发 Show 事件", () => {
      const tooltip = new TooltipCore();
      const handler = vi.fn();
      tooltip.onShow(handler);
      tooltip.show();
      expect(handler).toHaveBeenCalled();
    });

    it("hide 应触发 Hidden 事件", () => {
      const tooltip = new TooltipCore();
      const handler = vi.fn();
      tooltip.onHide(handler);
      tooltip.show();
      tooltip.hide();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const tooltip = new TooltipCore();
      expect(tooltip.state.visible).toBe(false);
      expect(tooltip.state.enter).toBe(false);
      expect(tooltip.state.exit).toBe(false);
    });

    it("show 后状态应更新", () => {
      const tooltip = new TooltipCore();
      tooltip.show();
      expect(tooltip.state.visible).toBe(true);
      expect(tooltip.state.enter).toBe(true);
    });
  });

  describe("事件监听", () => {
    it("onShow 应返回取消监听函数", () => {
      const tooltip = new TooltipCore();
      const handler = vi.fn();
      const unlisten = tooltip.onShow(handler);
      tooltip.show();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      tooltip.hide();
      tooltip.show();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onHide 应返回取消监听函数", () => {
      const tooltip = new TooltipCore();
      const handler = vi.fn();
      const unlisten = tooltip.onHide(handler);
      tooltip.show();
      tooltip.hide();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      tooltip.show();
      tooltip.hide();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const tooltip = new TooltipCore();
      const handler = vi.fn();
      const unlisten = tooltip.onStateChange(handler);
      tooltip.show();
      expect(handler).toHaveBeenCalled();
      unlisten();
      tooltip.hide();
      const callCount = handler.mock.calls.length;
      tooltip.show();
      expect(handler.mock.calls.length).toBe(callCount);
    });
  });
});
