/**
 * CheckboxCore / CheckboxGroupCore 状态机单测
 *
 * CheckboxCore 是纯状态机——管理 checked/unchecked 状态、
 * toggle/check/uncheck 操作、以及 Change/StateChange 事件。
 * 通过 PresenceCore 集成入场/退场动画。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

import { CheckboxCore } from "@/checkbox";
import { CheckboxGroupCore } from "@/checkbox/group";

describe("CheckboxCore", () => {
  // —— 构造函数 ——

  describe("构造函数", () => {
    it("默认状态：未选中、空标签、非禁用", () => {
      const checkbox = new CheckboxCore();
      expect(checkbox.checked).toBe(false);
      expect(checkbox.label).toBe("");
      expect(checkbox.disabled).toBe(false);
      expect(checkbox.state.value).toBe(false);
    });

    it("可通过 props 设置初始状态", () => {
      const checkbox = new CheckboxCore({
        label: "同意条款",
        checked: true,
        disabled: true,
      });
      expect(checkbox.label).toBe("同意条款");
      expect(checkbox.checked).toBe(true);
      expect(checkbox.disabled).toBe(true);
    });

    it("defaultChecked 记录构造时的初始值", () => {
      const checkbox = new CheckboxCore({ checked: true });
      expect(checkbox.defaultChecked).toBe(true);
      expect(checkbox.defaultValue).toBe(true);
    });

    it("onChange 回调传入构造函数", () => {
      const handler = vi.fn();
      const checkbox = new CheckboxCore({ onChange: handler });
      checkbox.toggle();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it("state 快照 value 与 checked 一致", () => {
      const checkbox = new CheckboxCore({ checked: true });
      expect(checkbox.state.checked).toBe(true);
      expect(checkbox.state.value).toBe(true);
    });
  });

  // —— toggle ——

  describe("toggle", () => {
    it("false → true → false 切换", () => {
      const checkbox = new CheckboxCore();
      checkbox.toggle();
      expect(checkbox.checked).toBe(true);
      checkbox.toggle();
      expect(checkbox.checked).toBe(false);
    });

    it("toggle 触发 Change 事件携带当前状态", () => {
      const checkbox = new CheckboxCore();
      const values: boolean[] = [];
      checkbox.onChange((v) => values.push(v));

      checkbox.toggle(); // false → true
      checkbox.toggle(); // true → false
      checkbox.toggle(); // false → true

      expect(values).toEqual([true, false, true]);
    });

    it("toggle 触发 StateChange 事件", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      checkbox.onStateChange(handler);

      checkbox.toggle();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler.mock.calls[0][0].checked).toBe(true);
    });

    it("toggle 记录 prev_checked", () => {
      const checkbox = new CheckboxCore();
      checkbox.toggle(); // false → true
      expect(checkbox.prev_checked).toBe(false);

      checkbox.toggle(); // true → false
      expect(checkbox.prev_checked).toBe(true);
    });
  });

  // —— check / uncheck ——

  describe("check / uncheck", () => {
    it("check 设置 checked=true 并调用 presence.show()", () => {
      const checkbox = new CheckboxCore();
      const spy = vi.spyOn(checkbox.presence, "show");
      checkbox.check();
      expect(checkbox.checked).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it("check 已选中时不触发重复操作", () => {
      const checkbox = new CheckboxCore({ checked: true });
      const handler = vi.fn();
      checkbox.onStateChange(handler);
      checkbox.check();
      expect(handler).not.toHaveBeenCalled();
    });

    it("uncheck 设置 checked=false 并调用 presence.hide()", () => {
      const checkbox = new CheckboxCore({ checked: true });
      const spy = vi.spyOn(checkbox.presence, "hide");
      checkbox.uncheck();
      expect(checkbox.checked).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    it("uncheck 未选中时不触发重复操作", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      checkbox.onStateChange(handler);
      checkbox.uncheck();
      expect(handler).not.toHaveBeenCalled();
    });

    it("check 不触发 Change 事件（仅 toggle 和 setValue 触发）", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      checkbox.onChange(handler);

      checkbox.check();
      expect(handler).not.toHaveBeenCalled();
    });

    it("uncheck 不触发 Change 事件", () => {
      const checkbox = new CheckboxCore({ checked: true });
      const handler = vi.fn();
      checkbox.onChange(handler);

      checkbox.uncheck();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // —— setValue ——

  describe("setValue", () => {
    it("setValue(true) 设置选中", () => {
      const checkbox = new CheckboxCore();
      checkbox.setValue(true);
      expect(checkbox.checked).toBe(true);
    });

    it("setValue(false) 设置取消", () => {
      const checkbox = new CheckboxCore({ checked: true });
      checkbox.setValue(false);
      expect(checkbox.checked).toBe(false);
    });

    it("setValue 触发 Change + StateChange", () => {
      const checkbox = new CheckboxCore();
      const changeHandler = vi.fn();
      const stateHandler = vi.fn();
      checkbox.onChange(changeHandler);
      checkbox.onStateChange(stateHandler);

      checkbox.setValue(true);
      expect(changeHandler).toHaveBeenCalledWith(true);
      expect(stateHandler).toHaveBeenCalled();
    });

    it("setValue silence 模式不触发事件", () => {
      const checkbox = new CheckboxCore();
      const changeHandler = vi.fn();
      const stateHandler = vi.fn();
      checkbox.onChange(changeHandler);
      checkbox.onStateChange(stateHandler);

      checkbox.setValue(true, { silence: true });
      expect(checkbox.checked).toBe(true);
      expect(changeHandler).not.toHaveBeenCalled();
      expect(stateHandler).not.toHaveBeenCalled();
    });

    it("setValue silence 模式值未变化也不触发", () => {
      const checkbox = new CheckboxCore({ checked: true });
      const handler = vi.fn();
      checkbox.onChange(handler);

      // 值相同 + silence → 不触发
      checkbox.setValue(true, { silence: true });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // —— reset ——

  describe("reset", () => {
    it("reset 恢复为 defaultChecked", () => {
      const checkbox = new CheckboxCore({ checked: true });
      checkbox.uncheck();
      expect(checkbox.checked).toBe(false);

      checkbox.reset();
      expect(checkbox.checked).toBe(true);
    });

    it("reset 委托 setValue 触发 Change", () => {
      const checkbox = new CheckboxCore();
      checkbox.toggle(); // checked = true
      const handler = vi.fn();
      checkbox.onChange(handler);

      checkbox.reset(); // defaultChecked = false
      expect(handler).toHaveBeenCalledWith(false);
    });
  });

  // —— setStatus ——

  describe("setStatus", () => {
    it("setStatus 修改 status 并触发 StateChange", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      checkbox.onStateChange(handler);

      checkbox.setStatus("error");
      expect(checkbox.status).toBe("error");
      expect(handler).toHaveBeenCalled();
    });
  });

  // —— state 快照 ——

  describe("state 快照", () => {
    it("state 返回完整快照", () => {
      const checkbox = new CheckboxCore({
        label: "测试",
        checked: true,
        disabled: false,
      });
      expect(checkbox.state).toEqual({
        label: "测试",
        checked: true,
        value: true,
        disabled: false,
      });
    });

    it("修改快照不影响内部状态", () => {
      const checkbox = new CheckboxCore({ label: "原始" });
      const snap = checkbox.state;
      // @ts-expect-error 尝试修改快照
      snap.label = "篡改";
      expect(checkbox.label).toBe("原始");
    });
  });

  // —— 事件监听取消 ——

  describe("事件监听器返回取消函数", () => {
    it("onChange 取消后不再触发", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      const unlisten = checkbox.onChange(handler);

      checkbox.toggle();
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      checkbox.toggle();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 取消后不再触发", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      const unlisten = checkbox.onStateChange(handler);

      checkbox.toggle();
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      checkbox.toggle();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});

// —— CheckboxGroupCore ——

describe("CheckboxGroupCore", () => {
  describe("构造函数", () => {
    it("默认状态：空选项、空值、非禁用", () => {
      const group = new CheckboxGroupCore();
      expect(group.options).toEqual([]);
      expect(group.values).toEqual([]);
      expect(group.disabled).toBe(false);
    });

    it("可设置选项列表", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      expect(group.options.length).toBe(2);
      expect(group.options[0].core).toBeInstanceOf(CheckboxCore);
    });

    it("选项初始 checked=true 仅初始化 CheckboxCore，不自动收集到 values", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "选项A", checked: true },
          { value: "b", label: "选项B" },
        ],
      });
      // constructor 不会自动收集 checked 选项到 values
      // checked 只初始化 CheckboxCore 内部状态
      expect(group.options[0].core.checked).toBe(true);
      expect(group.values).toEqual([]);
    });

    it("可设置全局 disabled", () => {
      const group = new CheckboxGroupCore({ disabled: true });
      expect(group.disabled).toBe(true);
    });

    it("onChange 回调传入构造函数", () => {
      const handler = vi.fn();
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
        onChange: handler,
      });
      group.checkOption("a");
      expect(handler).toHaveBeenCalledWith(["a"]);
    });
  });

  // —— checkOption / uncheckOption ——

  describe("checkOption / uncheckOption", () => {
    it("checkOption 添加值到 values", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.checkOption("a");
      expect(group.values).toEqual(["a"]);
    });

    it("uncheckOption 从 values 中移除值", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.checkOption("a");
      group.uncheckOption("a");
      expect(group.values).toEqual([]);
    });

    it("checkOption 触发 Change 事件（携带 values 数组）", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }, { value: "b", label: "选项B" }],
      });
      const handler = vi.fn();
      group.onChange(handler);

      group.checkOption("a");
      expect(handler).toHaveBeenCalledWith(["a"]);

      group.checkOption("b");
      expect(handler).toHaveBeenCalledWith(["a", "b"]);
    });

    it("checkOption 触发 StateChange", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const handler = vi.fn();
      group.onStateChange(handler);
      group.checkOption("a");
      expect(handler).toHaveBeenCalled();
    });

    it("uncheckOption 触发 Change 事件", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.checkOption("a");
      const handler = vi.fn();
      group.onChange(handler);
      group.uncheckOption("a");
      expect(handler).toHaveBeenCalledWith([]);
    });

    it("checkbox toggle 自动联动 checkOption/uncheckOption", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const checkbox = group.options[0].core;

      checkbox.toggle(); // check "a"
      expect(group.values).toEqual(["a"]);

      checkbox.toggle(); // uncheck "a"
      expect(group.values).toEqual([]);
    });
  });

  // —— reset ——

  describe("reset", () => {
    it("reset 清空所有选中值", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      group.checkOption("a");
      group.checkOption("b");
      group.reset();
      expect(group.values).toEqual([]);
    });

    it("reset 触发 Change([])", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.checkOption("a");
      const handler = vi.fn();
      group.onChange(handler);
      group.reset();
      expect(handler).toHaveBeenCalledWith([]);
    });
  });

  // —— setOptions ——

  describe("setOptions", () => {
    it("setOptions 替换选项列表", () => {
      const group = new CheckboxGroupCore();
      group.setOptions([
        { value: "a", label: "选项A" },
        { value: "b", label: "选项B" },
      ]);
      expect(group.options.length).toBe(2);
    });

    it("setOptions 销毁旧 CheckboxCore 实例", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const oldCore = group.options[0].core;
      const spy = vi.spyOn(oldCore, "destroy");
      group.setOptions([{ value: "b", label: "选项B" }]);
      expect(spy).toHaveBeenCalled();
    });

    it("setOptions 触发 StateChange", () => {
      const group = new CheckboxGroupCore();
      const handler = vi.fn();
      group.onStateChange(handler);
      group.setOptions([{ value: "a", label: "选项A" }]);
      expect(handler).toHaveBeenCalled();
    });

    it("setOptions 不触发 Change", () => {
      const group = new CheckboxGroupCore();
      const handler = vi.fn();
      group.onChange(handler);
      group.setOptions([{ value: "a", label: "选项A" }]);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // —— indeterminate ——

  describe("indeterminate", () => {
    it("全选时 indeterminate = true", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      group.checkOption("a");
      group.checkOption("b");
      expect(group.indeterminate).toBe(true);
    });

    it("部分选中时 indeterminate = false", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      group.checkOption("a");
      expect(group.indeterminate).toBe(false);
    });

    it("空选项时 indeterminate = true（0 === 0）", () => {
      const group = new CheckboxGroupCore();
      expect(group.indeterminate).toBe(true);
    });
  });

  // —— state ——

  describe("state 快照", () => {
    it("state 包含 values, options, disabled, indeterminate", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.checkOption("a");

      const snap = group.state;
      expect(snap.values).toEqual(["a"]);
      expect(snap.options.length).toBe(1);
      expect(snap.disabled).toBe(false);
      expect(snap.indeterminate).toBe(true);
    });
  });

  // —— 事件监听取消 ——

  describe("事件监听器返回取消函数", () => {
    it("onChange 取消后不再触发", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const handler = vi.fn();
      const unlisten = group.onChange(handler);

      group.checkOption("a");
      expect(handler).toHaveBeenCalledTimes(1);

      unlisten();
      group.uncheckOption("a");
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
