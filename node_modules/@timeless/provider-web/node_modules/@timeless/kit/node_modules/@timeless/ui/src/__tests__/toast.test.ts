import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { ToastCore } from "@/toast";

describe("ToastCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const toast = new ToastCore();
      expect(toast.open).toBe(false);
      expect(toast.delay).toBe(1200);
      expect(toast._mask).toBe(false);
      expect(toast._texts).toEqual([]);
    });

    it("可以设置 delay", () => {
      const toast = new ToastCore({ delay: 2000 });
      expect(toast.delay).toBe(2000);
    });
  });

  describe("show", () => {
    it("应显示 toast", async () => {
      const toast = new ToastCore();
      await toast.show({ texts: ["提示信息"] });
      expect(toast.open).toBe(true);
    });

    it("应设置 mask", async () => {
      const toast = new ToastCore();
      await toast.show({ texts: ["提示信息"], mask: true });
      expect(toast._mask).toBe(true);
    });

    it("应设置 texts", async () => {
      const toast = new ToastCore();
      await toast.show({ texts: ["提示1", "提示2"] });
      expect(toast._texts).toEqual(["提示1", "提示2"]);
    });

    it("应设置 icon", async () => {
      const toast = new ToastCore();
      await toast.show({ texts: ["提示"], icon: "loading" });
      expect(toast._icon).toBe("loading");
    });

    it("loading 类型不应自动隐藏", async () => {
      const toast = new ToastCore({ delay: 100 });
      await toast.show({ texts: ["加载中"], icon: "loading" });
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(toast.open).toBe(true);
    });

    it("非 loading 类型应自动隐藏", async () => {
      const toast = new ToastCore({ delay: 100 });
      await toast.show({ texts: ["提示"] });
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(toast.open).toBe(false);
    });
  });

  describe("hide", () => {
    it("应隐藏 toast", async () => {
      const toast = new ToastCore();
      await toast.show({ texts: ["提示"] });
      toast.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(toast.open).toBe(false);
    });
  });

  describe("clearTimer", () => {
    it("应清除定时器", async () => {
      const toast = new ToastCore({ delay: 100 });
      await toast.show({ texts: ["提示"] });
      toast.clearTimer();
      expect(toast.timer).toBe(null);
    });
  });

  describe("state", () => {
    it("应返回正确的状态", async () => {
      const toast = new ToastCore();
      await toast.show({ texts: ["提示"], mask: true, icon: "success" });
      expect(toast.state.mask).toBe(true);
      expect(toast.state.icon).toBe("success");
      expect(toast.state.texts).toEqual(["提示"]);
    });
  });

  describe("事件监听", () => {
    it("onOpenChange 应返回取消监听函数", async () => {
      const toast = new ToastCore();
      const handler = vi.fn();
      const unlisten = toast.onOpenChange(handler);
      await toast.show({ texts: ["提示"] });
      expect(handler).toHaveBeenCalledWith(true);
      unlisten();
      toast.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      // 不应再次触发
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", async () => {
      const toast = new ToastCore();
      const handler = vi.fn();
      const unlisten = toast.onStateChange(handler);
      await toast.show({ texts: ["提示"] });
      expect(handler).toHaveBeenCalled();
      unlisten();
      toast.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      // 不应再次触发
      const callCount = handler.mock.calls.length;
      await toast.show({ texts: ["提示2"] });
      expect(handler.mock.calls.length).toBe(callCount);
    });
  });
});
