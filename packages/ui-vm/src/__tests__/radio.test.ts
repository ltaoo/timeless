/**
 * RadioCore / RadioGroupCore 状态机单测
 *
 * RadioCore 管理单个 radio 的 check/uncheck 状态。
 * RadioGroupCore 管理互斥选项组——选中一个自动取消其他。
 * 通过 PresenceCore 集成入场/退场动画。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { RadioCore, RadioGroupCore } from "@/radio";

describe("RadioCore", () => {
  // —— 构造函数 ——

  describe("构造函数", () => {
    it("默认状态：未选中、空标签、空值、非禁用", () => {
      const radio = new RadioCore();
      expect(radio.checked).toBe(false);
      expect(radio.label).toBe("");
      expect(radio.value).toBe("");
      expect(radio.disabled).toBe(false);
    });

    it("可通过 props 设置所有属性", () => {
      const radio = new RadioCore({
        label: "选项A",
        value: "a",
        checked: true,
        disabled: true,
      });
      expect(radio.label).toBe("选项A");
      expect(radio.value).toBe("a");
      expect(radio.checked).toBe(true);
      expect(radio.disabled).toBe(true);
    });

    it("checked=true 时自动调用 presence.show()", () => {
      const radio = new RadioCore({ checked: true });
      expect(radio.presence.state.visible).toBe(true);
    });

    it("checked=false 时不调用 presence.show()", () => {
      const radio = new RadioCore({ checked: false });
      expect(radio.presence.state.mounted).toBe(false);
    });

    it("defaultChecked 记录构造时的初始值", () => {
      const radio = new RadioCore({ checked: true });
      expect(radio.defaultChecked).toBe(true);
    });

    it("onChange 回调传入构造函数", () => {
      const handler = vi.fn();
      const radio = new RadioCore({ onChange: handler });
      radio.check();
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  // —— check / uncheck ——

  describe("check", () => {
    it("check 设置 checked=true 并调用 presence.show()", () => {
      const radio = new RadioCore();
      const spy = vi.spyOn(radio.presence, "show");
      radio.check();
      expect(radio.checked).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it("check 已选中时不触发重复操作", () => {
      const radio = new RadioCore({ checked: true });
      const spy = vi.spyOn(radio.presence, "show");
      const handler = vi.fn();
      radio.onStateChange(handler);

      radio.check();
      expect(handler).not.toHaveBeenCalled();
      expect(spy).not.toHaveBeenCalled();
    });

    it("check 禁用状态下不生效", () => {
      const radio = new RadioCore({ disabled: true });
      const handler = vi.fn();
      radio.onStateChange(handler);

      radio.check();
      expect(radio.checked).toBe(false);
      expect(handler).not.toHaveBeenCalled();
    });

    it("check 触发 Change(true) 事件", () => {
      const radio = new RadioCore();
      const handler = vi.fn();
      radio.onChange(handler);

      radio.check();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it("check 触发 StateChange 事件", () => {
      const radio = new RadioCore();
      const handler = vi.fn();
      radio.onStateChange(handler);

      radio.check();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("uncheck", () => {
    it("uncheck 设置 checked=false 并调用 presence.hide()", () => {
      const radio = new RadioCore({ checked: true });
      const spy = vi.spyOn(radio.presence, "hide");
      radio.uncheck();
      expect(radio.checked).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    it("uncheck 未选中时不触发重复操作", () => {
      const radio = new RadioCore();
      const handler = vi.fn();
      radio.onStateChange(handler);

      radio.uncheck();
      expect(handler).not.toHaveBeenCalled();
    });

    it("uncheck 不触发 Change 事件", () => {
      const radio = new RadioCore({ checked: true });
      const handler = vi.fn();
      radio.onChange(handler);

      radio.uncheck();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // —— reset ——

  describe("reset", () => {
    it("reset 恢复为 defaultChecked", () => {
      const radio = new RadioCore({ checked: true });
      radio.uncheck();
      expect(radio.checked).toBe(false);

      radio.reset();
      expect(radio.checked).toBe(true);
    });

    it("reset 到 true 时调用 presence.show()", () => {
      const radio = new RadioCore({ checked: true });
      radio.uncheck();
      const spy = vi.spyOn(radio.presence, "show");
      radio.reset();
      expect(spy).toHaveBeenCalled();
    });

    it("reset 到 false 时调用 presence.hide()", () => {
      const radio = new RadioCore();
      radio.check();
      const spy = vi.spyOn(radio.presence, "hide");
      radio.reset();
      expect(spy).toHaveBeenCalled();
    });

    it("reset 触发 StateChange", () => {
      const radio = new RadioCore();
      const handler = vi.fn();
      radio.onStateChange(handler);

      radio.reset();
      expect(handler).toHaveBeenCalled();
    });
  });

  // —— state ——

  describe("state 快照", () => {
    it("state 返回完整快照", () => {
      const radio = new RadioCore({
        label: "测试",
        checked: true,
        value: "test",
        disabled: false,
      });
      expect(radio.state).toEqual({
        label: "测试",
        checked: true,
        value: "test",
        disabled: false,
      });
    });

    it("修改快照不影响内部状态", () => {
      const radio = new RadioCore({ label: "原始" });
      const snap = radio.state;
      // @ts-expect-error 尝试修改快照
      snap.label = "篡改";
      expect(radio.label).toBe("原始");
    });
  });

  // —— 事件监听取消 ——

  describe("事件监听器返回取消函数", () => {
    it("onChange 取消后不再触发", () => {
      const radio = new RadioCore();
      const handler = vi.fn();
      const unlisten = radio.onChange(handler);

      radio.check();
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      radio.uncheck();
      radio.check();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 取消后不再触发", () => {
      const radio = new RadioCore();
      const handler = vi.fn();
      const unlisten = radio.onStateChange(handler);

      radio.check();
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      radio.uncheck();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});

// —— RadioGroupCore ——

describe("RadioGroupCore", () => {
  describe("构造函数", () => {
    it("默认状态：空选项、null 值、非禁用", () => {
      const group = new RadioGroupCore();
      expect(group.options).toEqual([]);
      expect(group.value).toBe(null);
      expect(group.disabled).toBe(false);
    });

    it("可设置选项列表，每个选项包装 RadioCore", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      expect(group.options.length).toBe(2);
      expect(group.options[0].core).toBeInstanceOf(RadioCore);
    });

    it("可设置初始值", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
        value: "a",
      });
      expect(group.value).toBe("a");
      expect(group.options[0].core.checked).toBe(true);
    });

    it("可设置禁用状态", () => {
      const group = new RadioGroupCore({ disabled: true });
      expect(group.disabled).toBe(true);
    });

    it("onChange 回调传入构造函数", () => {
      const handler = vi.fn();
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
        onChange: handler,
      });
      group.select("a");
      expect(handler).toHaveBeenCalledWith("a");
    });

    it("group.value 始终来自 value prop（checked 只影响 RadioCore 内部）", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A", checked: true },
          { value: "b", label: "选项B" },
        ],
        value: "b",
      });
      // group.value 由 value prop 决定
      expect(group.value).toBe("b");
      // 但选项 a 的 RadioCore 也被 checked=true 初始化
      expect(group.options[0].core.checked).toBe(true);
    });
  });

  // —— select ——

  describe("select", () => {
    let group: RadioGroupCore<string>;

    beforeEach(() => {
      group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
          { value: "c", label: "选项C" },
        ],
      });
    });

    it("select 设置 value 并 check 对应选项", () => {
      group.select("a");
      expect(group.value).toBe("a");
      expect(group.options[0].core.checked).toBe(true);
    });

    it("select 切换时取消旧选项选中", () => {
      group.select("a");
      group.select("b");

      expect(group.value).toBe("b");
      expect(group.options[0].core.checked).toBe(false);
      expect(group.options[1].core.checked).toBe(true);
    });

    it("select 相同值不触发重复操作", () => {
      group.select("a");
      const handler = vi.fn();
      group.onChange(handler);

      group.select("a");
      expect(handler).not.toHaveBeenCalled();
    });

    it("select 触发 Change 事件携带选中的值", () => {
      const handler = vi.fn();
      group.onChange(handler);

      group.select("b");
      expect(handler).toHaveBeenCalledWith("b");
    });

    it("select 触发 StateChange 事件", () => {
      const handler = vi.fn();
      group.onStateChange(handler);

      group.select("a");
      expect(handler).toHaveBeenCalled();
      expect(handler.mock.calls[0][0].value).toBe("a");
    });

    it("radio.core.check() 自动触发 group.select()", () => {
      // 每个 RadioCore 的 onChange 会调用 group.select()
      const radioB = group.options[1].core;
      radioB.check();

      expect(group.value).toBe("b");
      expect(group.options[0].core.checked).toBe(false);
      expect(group.options[1].core.checked).toBe(true);
    });
  });

  // —— reset ——

  describe("reset", () => {
    it("reset 清空选中值为 null", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
        value: "a",
      });
      group.reset();
      expect(group.value).toBe(null);
    });

    it("reset 触发 Change(null)", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
        value: "a",
      });
      const handler = vi.fn();
      group.onChange(handler);
      group.reset();
      expect(handler).toHaveBeenCalledWith(null);
    });

    it("reset 重置每个 RadioCore", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A", checked: true },
          { value: "b", label: "选项B" },
        ],
      });
      group.reset();
      // 每个 RadioCore.reset() 回到 defaultChecked
      expect(group.options[0].core.checked).toBe(true); // defaultChecked = true
      expect(group.options[1].core.checked).toBe(false); // defaultChecked = false
    });
  });

  // —— setValue ——

  describe("setValue", () => {
    it("setValue(v) 委托 select()", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.setValue("a");
      expect(group.value).toBe("a");
    });

    it("setValue(null) 调用 reset()", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
        value: "a",
      });
      group.setValue(null);
      expect(group.value).toBe(null);
    });
  });

  // —— setOptions ——

  describe("setOptions", () => {
    it("setOptions 替换选项列表", () => {
      const group = new RadioGroupCore();
      group.setOptions([
        { value: "a", label: "选项A" },
        { value: "b", label: "选项B" },
      ]);
      expect(group.options.length).toBe(2);
    });

    it("setOptions 销毁旧 RadioCore 实例", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const oldCore = group.options[0].core;
      const spy = vi.spyOn(oldCore, "destroy");
      group.setOptions([{ value: "b", label: "选项B" }]);
      expect(spy).toHaveBeenCalled();
    });

    it("setOptions 触发 StateChange", () => {
      const group = new RadioGroupCore();
      const handler = vi.fn();
      group.onStateChange(handler);
      group.setOptions([{ value: "a", label: "选项A" }]);
      expect(handler).toHaveBeenCalled();
    });

    it("setOptions 保留当前 value 匹配的选项选中状态", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A旧" }],
        value: "a",
      });
      group.setOptions([
        { value: "a", label: "选项A新" },
        { value: "b", label: "选项B" },
      ]);
      expect(group.value).toBe("a");
      expect(group.options[0].core.checked).toBe(true);
    });
  });

  // —— state 快照 ——

  describe("state 快照", () => {
    it("state 包含 value, options, disabled", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
        value: "a",
        disabled: false,
      });
      const snap = group.state;
      expect(snap.value).toBe("a");
      expect(snap.disabled).toBe(false);
      expect(snap.options.length).toBe(1);
    });
  });

  // —— 事件监听取消 ——

  describe("事件监听器返回取消函数", () => {
    it("onChange 取消后不再触发", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }, { value: "b", label: "选项B" }],
      });
      const handler = vi.fn();
      const unlisten = group.onChange(handler);

      group.select("a");
      const callCount = handler.mock.calls.length;
      expect(callCount).toBeGreaterThanOrEqual(1);

      unlisten();
      group.select("b");
      expect(handler.mock.calls.length).toBe(callCount);
    });
  });
});
