import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { PresenceCore } from "@/presence";

describe("PresenceCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const presence = new PresenceCore();
      expect(presence.mounted).toBe(false);
      expect(presence.enter).toBe(false);
      expect(presence.visible).toBe(false);
      expect(presence.exit).toBe(false);
    });

    it("可以设置 mounted", () => {
      const presence = new PresenceCore({ mounted: true });
      expect(presence.mounted).toBe(true);
    });

    it("可以设置 visible", () => {
      const presence = new PresenceCore({ visible: true });
      expect(presence.visible).toBe(true);
      expect(presence.mounted).toBe(true);
    });
  });

  describe("show", () => {
    it("应设置 visible 为 true", () => {
      const presence = new PresenceCore();
      presence.show();
      expect(presence.visible).toBe(true);
    });

    it("应设置 mounted 为 true", () => {
      const presence = new PresenceCore();
      presence.show();
      expect(presence.mounted).toBe(true);
    });

    it("应设置 enter 为 true", () => {
      const presence = new PresenceCore();
      presence.show();
      expect(presence.enter).toBe(true);
    });

    it("应触发 StateChange 事件", () => {
      const presence = new PresenceCore();
      const handler = vi.fn();
      presence.onStateChange(handler);
      presence.show();
      expect(handler).toHaveBeenCalled();
    });

    it("动画结束后应触发 Show 事件", async () => {
      const presence = new PresenceCore();
      const handler = vi.fn();
      presence.onShow(handler);
      presence.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("hide", () => {
    it("应设置 exit 为 true", () => {
      const presence = new PresenceCore({ visible: true });
      presence.hide();
      expect(presence.exit).toBe(true);
    });

    it("应触发 StateChange 事件", () => {
      const presence = new PresenceCore({ visible: true });
      const handler = vi.fn();
      presence.onStateChange(handler);
      presence.hide();
      expect(handler).toHaveBeenCalled();
    });

    it("动画结束后应触发 Hidden 事件", async () => {
      const presence = new PresenceCore({ visible: true });
      const handler = vi.fn();
      presence.onHidden(handler);
      presence.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalled();
    });

    it("destroy=false 时不卸载 DOM", async () => {
      const presence = new PresenceCore({ visible: true });
      presence.hide({ destroy: false });
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(presence.mounted).toBe(true);
    });
  });

  describe("toggle", () => {
    it("应切换显示状态", () => {
      const presence = new PresenceCore();
      presence.toggle();
      expect(presence.visible).toBe(true);
      presence.toggle();
      expect(presence.exit).toBe(true);
    });
  });

  describe("unmount", () => {
    it("应重置所有状态", () => {
      const presence = new PresenceCore({ visible: true });
      presence.unmount();
      expect(presence.mounted).toBe(false);
      expect(presence.enter).toBe(false);
      expect(presence.visible).toBe(false);
      expect(presence.exit).toBe(false);
    });

    it("应触发 Unmounted 事件", () => {
      const presence = new PresenceCore({ visible: true });
      const handler = vi.fn();
      presence.onUnmounted(handler);
      presence.unmount();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("reset", () => {
    it("应重置所有状态", () => {
      const presence = new PresenceCore({ visible: true });
      presence.reset();
      expect(presence.mounted).toBe(false);
      expect(presence.enter).toBe(false);
      expect(presence.visible).toBe(false);
      expect(presence.exit).toBe(false);
    });
  });

  describe("handleAnimationEnd", () => {
    it("exit 状态下应触发 Hidden 事件", () => {
      const presence = new PresenceCore({ visible: true });
      presence.exit = true;
      const handler = vi.fn();
      presence.onHidden(handler);
      presence.handleAnimationEnd();
      expect(handler).toHaveBeenCalled();
    });

    it("enter 状态下应触发 Show 事件", () => {
      const presence = new PresenceCore();
      presence.show();
      const handler = vi.fn();
      presence.onShow(handler);
      presence.handleAnimationEnd();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("state", () => {
    it("应返回正确的状态文本", () => {
      const presence = new PresenceCore();
      expect(presence.state.text).toBe("unknown");

      presence.show();
      expect(presence.state.text).toBe("enter");

      presence.enter = false;
      presence.visible = true;
      expect(presence.state.text).toBe("visible");

      presence.exit = true;
      expect(presence.state.text).toBe("exit");
    });
  });

  describe("事件监听", () => {
    it("onShow 应返回取消监听函数", async () => {
      const presence = new PresenceCore();
      const handler = vi.fn();
      const unlisten = presence.onShow(handler);
      presence.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      presence.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      presence.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onHidden 应返回取消监听函数", async () => {
      const presence = new PresenceCore({ visible: true });
      const handler = vi.fn();
      const unlisten = presence.onHidden(handler);
      presence.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      presence.show();
      await new Promise((resolve) => setTimeout(resolve, 200));
      presence.hide();
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onUnmounted 应返回取消监听函数", () => {
      const presence = new PresenceCore({ visible: true });
      const handler = vi.fn();
      const unlisten = presence.onUnmounted(handler);
      presence.unmount();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      presence.show();
      presence.unmount();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
