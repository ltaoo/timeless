import { describe, it, expect, vi, beforeEach } from "vitest";

import { DialogCore } from "@/dialog";

describe("DialogCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const dialog = new DialogCore();
      expect(dialog.open).toBe(false);
      expect(dialog.title).toBe("");
      expect(dialog.footer).toBe(true);
      expect(dialog.closeable).toBe(true);
      expect(dialog.mask).toBe(true);
    });

    it("可以设置初始状态", () => {
      const dialog = new DialogCore({
        title: "提示",
        footer: false,
        closeable: false,
        mask: false,
        open: true,
      });
      expect(dialog.title).toBe("提示");
      expect(dialog.footer).toBe(false);
      expect(dialog.closeable).toBe(false);
      expect(dialog.mask).toBe(false);
      expect(dialog.open).toBe(true);
    });
  });

  describe("show / hide", () => {
    it("show 应显示弹窗", async () => {
      const dialog = new DialogCore();
      dialog.show();
      // 等待 presence 动画
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.open).toBe(true);
    });

    it("hide 应隐藏弹窗", async () => {
      const dialog = new DialogCore();
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.open).toBe(false);
    });

    it("已显示状态下再次调用 show 不应重复触发", async () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      dialog.onShow(handler);
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      // 只应触发一次 show 事件
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("toggle", () => {
    it("应切换弹窗显示状态", async () => {
      const dialog = new DialogCore();
      dialog.toggle();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.open).toBe(true);
      dialog.toggle();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(dialog.open).toBe(false);
    });
  });

  describe("ok / cancel", () => {
    it("ok 应触发 OK 事件", () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      dialog.onOk(handler);
      dialog.ok();
      expect(handler).toHaveBeenCalled();
    });

    it("cancel 应触发 Cancel 事件", () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      dialog.onCancel(handler);
      dialog.cancel();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("setTitle", () => {
    it("应设置标题", () => {
      const dialog = new DialogCore();
      dialog.setTitle("新标题");
      expect(dialog.title).toBe("新标题");
    });

    it("应触发 StateChange 事件", () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      dialog.onStateChange(handler);
      dialog.setTitle("新标题");
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const dialog = new DialogCore({
        title: "测试",
        footer: true,
        closeable: true,
        mask: true,
      });
      expect(dialog.state.title).toBe("测试");
      expect(dialog.state.footer).toBe(true);
      expect(dialog.state.closeable).toBe(true);
      expect(dialog.state.mask).toBe(true);
    });
  });

  describe("事件监听", () => {
    it("onShow 应返回取消监听函数", async () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      const unlisten = dialog.onShow(handler);
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onHidden 应返回取消监听函数", async () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      const unlisten = dialog.onHidden(handler);
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onVisibleChange 应返回取消监听函数", async () => {
      const dialog = new DialogCore();
      const handler = vi.fn();
      const unlisten = dialog.onVisibleChange(handler);
      dialog.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledWith(true);
      unlisten();
      dialog.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      // 不应再次触发
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
