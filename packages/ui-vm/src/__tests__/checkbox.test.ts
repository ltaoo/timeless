import { describe, it, expect, vi, beforeEach } from "vitest";

import { CheckboxCore, CheckboxGroupCore } from "@/checkbox";

describe("CheckboxCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const checkbox = new CheckboxCore();
      expect(checkbox.checked).toBe(false);
      expect(checkbox.label).toBe("");
      expect(checkbox.disabled).toBe(false);
    });

    it("可以设置初始状态", () => {
      const checkbox = new CheckboxCore({
        label: "同意",
        checked: true,
        disabled: true,
      });
      expect(checkbox.label).toBe("同意");
      expect(checkbox.checked).toBe(true);
      expect(checkbox.disabled).toBe(true);
    });
  });

  describe("toggle", () => {
    it("应切换选中状态", () => {
      const checkbox = new CheckboxCore();
      expect(checkbox.checked).toBe(false);
      checkbox.toggle();
      expect(checkbox.checked).toBe(true);
      checkbox.toggle();
      expect(checkbox.checked).toBe(false);
    });

    it("应触发 Change 事件", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      checkbox.onChange(handler);
      checkbox.toggle();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it("应触发 StateChange 事件", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      checkbox.onStateChange(handler);
      checkbox.toggle();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("check / uncheck", () => {
    it("check 应设置 checked 为 true", () => {
      const checkbox = new CheckboxCore();
      checkbox.check();
      expect(checkbox.checked).toBe(true);
    });

    it("check 已选中状态不应触发事件", () => {
      const checkbox = new CheckboxCore({ checked: true });
      const handler = vi.fn();
      checkbox.onStateChange(handler);
      checkbox.check();
      expect(handler).not.toHaveBeenCalled();
    });

    it("uncheck 应设置 checked 为 false", () => {
      const checkbox = new CheckboxCore({ checked: true });
      checkbox.uncheck();
      expect(checkbox.checked).toBe(false);
    });

    it("uncheck 未选中状态不应触发事件", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      checkbox.onStateChange(handler);
      checkbox.uncheck();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("reset", () => {
    it("应重置为默认值", () => {
      const checkbox = new CheckboxCore({ checked: true });
      checkbox.uncheck();
      checkbox.reset();
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const checkbox = new CheckboxCore();
      checkbox.setValue(true);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
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
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
      const checkbox = new CheckboxCore();
      const handler = vi.fn();
      const unlisten = checkbox.onChange(handler);
      checkbox.toggle();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      checkbox.toggle();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
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

describe("CheckboxGroupCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const group = new CheckboxGroupCore();
      expect(group.options).toEqual([]);
      expect(group.values).toEqual([]);
      expect(group.disabled).toBe(false);
    });

    it("可以设置选项", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      expect(group.options.length).toBe(2);
    });

    it("可以设置禁用状态", () => {
      const group = new CheckboxGroupCore({ disabled: true });
      expect(group.disabled).toBe(true);
    });
  });

  describe("checkOption / uncheckOption", () => {
    it("checkOption 应添加值", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.checkOption("a");
      expect(group.values).toContain("a");
    });

    it("uncheckOption 应移除值", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.checkOption("a");
      group.uncheckOption("a");
      expect(group.values).not.toContain("a");
    });

    it("checkOption 应触发 Change 事件", () => {
      const group = new CheckboxGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const handler = vi.fn();
      group.onChange(handler);
      group.checkOption("a");
      expect(handler).toHaveBeenCalledWith(["a"]);
    });
  });

  describe("reset", () => {
    it("应清空所有选中值", () => {
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
  });

  describe("setOptions", () => {
    it("应更新选项列表", () => {
      const group = new CheckboxGroupCore();
      group.setOptions([
        { value: "a", label: "选项A" },
        { value: "b", label: "选项B" },
      ]);
      expect(group.options.length).toBe(2);
    });
  });

  describe("indeterminate", () => {
    it("当所有选项都被选中时应返回 true", () => {
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

    it("当部分选项被选中时应返回 false", () => {
      const group = new CheckboxGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      group.checkOption("a");
      expect(group.indeterminate).toBe(false);
    });
  });
});
