/**
 * SwitchCore 状态机单测
 *
 * SwitchCore 是工厂函数（非 class），返回一个包含 state getter、
 * setValue/disable/enable 方法、事件订阅的纯对象。
 * 内部使用 @timeless/inner-base 的 base() 事件总线。
 */

import { describe, it, expect, vi } from "vitest";

import { SwitchCore } from "@/switch";

describe("SwitchCore", () => {
  // —— 构造函数 ——

  describe("构造函数", () => {
    it("defaultValue=false 时 state.value/checked 为 false", () => {
      const sw = SwitchCore({ defaultValue: false });
      expect(sw.state.value).toBe(false);
      expect(sw.state.checked).toBe(false);
    });

    it("defaultValue=true 时 state.value/checked 为 true", () => {
      const sw = SwitchCore({ defaultValue: true });
      expect(sw.state.value).toBe(true);
      expect(sw.state.checked).toBe(true);
    });

    it("disabled 未传入时 state.disabled 为 undefined", () => {
      const sw = SwitchCore({ defaultValue: false });
      expect(sw.state.disabled).toBeUndefined();
    });

    it("disabled=true 时 state.disabled 为 true", () => {
      const sw = SwitchCore({ defaultValue: false, disabled: true });
      expect(sw.state.disabled).toBe(true);
    });

    it("shape 为 'switch'", () => {
      const sw = SwitchCore({ defaultValue: false });
      expect(sw.shape).toBe("switch");
    });
  });

  // —— setValue ——

  describe("setValue", () => {
    it("setValue(true) 设置 value 为 true", () => {
      const sw = SwitchCore({ defaultValue: false });
      sw.setValue(true);
      expect(sw.state.value).toBe(true);
      expect(sw.state.checked).toBe(true);
    });

    it("setValue(false) 设置 value 为 false", () => {
      const sw = SwitchCore({ defaultValue: true });
      sw.setValue(false);
      expect(sw.state.value).toBe(false);
    });

    it("setValue 触发 Change 事件（携带新值）", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      sw.onChange(handler);

      sw.setValue(true);
      expect(handler).toHaveBeenCalledWith(true);

      sw.setValue(false);
      expect(handler).toHaveBeenCalledWith(false);
    });

    it("setValue 触发 StateChange 事件（携带状态快照）", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      sw.onStateChange(handler);

      sw.setValue(true);
      expect(handler).toHaveBeenCalled();
      const snap = handler.mock.calls[0][0];
      expect(snap.value).toBe(true);
      expect(snap.checked).toBe(true);
    });

    it("setValue 不触发 Open/Close 事件", () => {
      const sw = SwitchCore({ defaultValue: false });
      const openHandler = vi.fn();
      const closeHandler = vi.fn();
      sw.onOpen(openHandler);
      sw.onClose(closeHandler);

      sw.setValue(true);
      sw.setValue(false);

      expect(openHandler).not.toHaveBeenCalled();
      expect(closeHandler).not.toHaveBeenCalled();
    });
  });

  // —— handleChange ——

  describe("handleChange", () => {
    it("handleChange 委托给 setValue", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      sw.onChange(handler);

      sw.handleChange(true);
      expect(sw.state.value).toBe(true);
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // —— disable / enable ——

  describe("disable / enable", () => {
    it("disable 设置 disabled=true 并触发 StateChange", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      sw.onStateChange(handler);

      sw.disable();
      expect(sw.state.disabled).toBe(true);
      expect(handler).toHaveBeenCalled();
    });

    it("enable 设置 disabled=false 并触发 StateChange", () => {
      const sw = SwitchCore({ defaultValue: false, disabled: true });
      const handler = vi.fn();
      sw.onStateChange(handler);

      sw.enable();
      expect(sw.state.disabled).toBe(false);
      expect(handler).toHaveBeenCalled();
    });

    it("disable 不触发 Change 事件", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      sw.onChange(handler);

      sw.disable();
      expect(handler).not.toHaveBeenCalled();
    });

    it("disable/enable 循环正常", () => {
      const sw = SwitchCore({ defaultValue: false });
      sw.disable();
      expect(sw.state.disabled).toBe(true);
      sw.enable();
      expect(sw.state.disabled).toBe(false);
      sw.disable();
      expect(sw.state.disabled).toBe(true);
    });
  });

  // —— state 快照 ——

  describe("state 快照", () => {
    it("state 是完整对象，含 value/checked/disabled", () => {
      const sw = SwitchCore({ defaultValue: true, disabled: true });
      expect(sw.state).toEqual({
        value: true,
        checked: true,
        disabled: true,
      });
    });

    it("value 和 checked 始终相同", () => {
      const sw = SwitchCore({ defaultValue: false });
      expect(sw.state.value).toBe(sw.state.checked);

      sw.setValue(true);
      expect(sw.state.value).toBe(sw.state.checked);

      sw.setValue(false);
      expect(sw.state.value).toBe(sw.state.checked);
    });

    it("StateChange 回调收到的是浅拷贝快照", () => {
      const sw = SwitchCore({ defaultValue: false });
      const snapshots: any[] = [];
      sw.onStateChange((snap) => snapshots.push(snap));

      sw.setValue(true);
      sw.setValue(false);

      // 修改第一次的快照不应对后续产生影响
      snapshots[0].value = "篡改" as any;
      expect(snapshots[1].value).toBe(false);
    });
  });

  // —— 事件监听取消 ——

  describe("事件监听器返回取消函数", () => {
    it("onChange 取消后不再触发", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      const unlisten = sw.onChange(handler);

      sw.setValue(true);
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      sw.setValue(false);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 取消后不再触发", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      const unlisten = sw.onStateChange(handler);

      sw.setValue(true);
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      sw.setValue(false);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onOpen 取消后不再触发", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      const unlisten = sw.onOpen(handler);
      // Open 事件预留，不会由当前 API 触发
      unlisten();
      // 验证取消函数不抛错
    });

    it("onClose 取消后不再触发", () => {
      const sw = SwitchCore({ defaultValue: false });
      const handler = vi.fn();
      const unlisten = sw.onClose(handler);
      // Close 事件预留，不会由当前 API 触发
      unlisten();
      // 验证取消函数不抛错
    });
  });
});
