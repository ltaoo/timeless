import { describe, it, expect, vi, beforeEach } from "vitest";

import { SwitchCore } from "@/switch";

describe("SwitchCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const sw = SwitchCore({ defaultValue: false });
      expect(sw.state.value).toBe(false);
      expect(sw.state.checked).toBe(false);
      expect(sw.state.disabled).toBe(false);
    });

    it("可以设置默认值", () => {
      const sw = SwitchCore({ defaultValue: true });
      expect(sw.state.value).toBe(true);
      expect(sw.state.checked).toBe(true);
    });

    it("可以设置禁用状态", () => {
      const sw = SwitchCore({ defaultValue: false, disabled: true });
      expect(sw.state.disabled).toBe(true);
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const sw = SwitchCore({ defaultValue: false });
      sw.setValue(true);
      expect(sw.state.value).toBe(true);
    });

    it("应触发 Change 事件", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      sw.onChange(handler);
      sw.setValue(true);
      expect(handler).toHaveBeenCalledWith(true);
    });

    it("应触发 StateChange 事件", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      sw.onStateChange(handler);
      sw.setValue(true);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("handleChange", () => {
    it("应调用 setValue", () => {
      const sw = SwitchCore({ defaultValue: false });
      sw.handleChange(true);
      expect(sw.state.value).toBe(true);
    });
  });

  describe("disable / enable", () => {
    it("disable 应设置 disabled 为 true", () => {
      const sw = SwitchCore({ defaultValue: false });
      sw.disable();
      expect(sw.state.disabled).toBe(true);
    });

    it("enable 应设置 disabled 为 false", () => {
      const sw = SwitchCore({ defaultValue: false, disabled: true });
      sw.enable();
      expect(sw.state.disabled).toBe(false);
    });

    it("disable 应触发 StateChange 事件", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      sw.onStateChange(handler);
      sw.disable();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const sw = SwitchCore({ defaultValue: true, disabled: false });
      expect(sw.state).toEqual({
        value: true,
        checked: true,
        disabled: false,
      });
    });

    it("value 和 checked 应该相同", () => {
      const sw = SwitchCore({ defaultValue: true });
      expect(sw.state.value).toBe(sw.state.checked);
    });
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      const unlisten = sw.onChange(handler);
      sw.setValue(true);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      sw.setValue(false);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      const unlisten = sw.onStateChange(handler);
      sw.setValue(true);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      sw.setValue(false);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onOpen 应返回取消监听函数", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      const unlisten = sw.onOpen(handler);
      sw.setValue(true);
      // onOpen 不会被 setValue 触发
      unlisten();
    });

    it("onClose 应返回取消监听函数", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      const unlisten = sw.onClose(handler);
      sw.setValue(false);
      // onClose 不会被 setValue 触发
      unlisten();
    });
  });
});
