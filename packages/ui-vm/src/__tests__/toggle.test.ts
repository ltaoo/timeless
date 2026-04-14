import { describe, it, expect, vi, beforeEach } from "vitest";

import { ToggleCore } from "@/toggle";

describe("ToggleCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const toggle = new ToggleCore({});
      expect(toggle.state.checked).toBe(false);
    });

    it("可以设置默认值", () => {
      const toggle = new ToggleCore({ defaultValue: true });
      expect(toggle.state.checked).toBe(true);
    });
  });

  describe("toggle", () => {
    it("应切换选中状态", () => {
      const toggle = new ToggleCore({});
      expect(toggle.state.checked).toBe(false);
      toggle.toggle();
      expect(toggle.state.checked).toBe(true);
      toggle.toggle();
      expect(toggle.state.checked).toBe(false);
    });

    it("应触发 stateChange 事件", () => {
      const toggle = new ToggleCore({});
      const handler = vi.fn();
      toggle.onStateChange(handler);
      toggle.toggle();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("事件监听", () => {
    it("onStateChange 应返回取消监听函数", () => {
      const toggle = new ToggleCore({});
      const handler = vi.fn();
      const unlisten = toggle.onStateChange(handler);
      toggle.toggle();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      toggle.toggle();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
