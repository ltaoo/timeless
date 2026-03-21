import { describe, it, expect, vi, beforeEach } from "vitest";

import { MultipleSelectionCore } from "../index";

describe("MultipleSelectionCore", () => {
  const options = [
    { label: "选项1", value: "a" },
    { label: "选项2", value: "b" },
    { label: "选项3", value: "c" },
  ];

  describe("构造函数", () => {
    it("初始状态", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: [],
        options,
      });
      expect(selection.value).toEqual([]);
      expect(selection.options).toEqual(options);
      expect(selection.defaultValue).toEqual([]);
      expect(selection.shape).toBe("multiple-select");
    });

    it("带默认值", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a", "b"],
        options,
      });
      expect(selection.value).toEqual(["a", "b"]);
    });
  });

  describe("state getter", () => {
    it("应返回当前状态", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a"],
        options,
      });
      expect(selection.state).toEqual({
        value: ["a"],
        options,
      });
    });
  });

  describe("setValue", () => {
    it("应设置 value", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: [],
        options,
      });
      selection.setValue(["a", "c"]);
      expect(selection.value).toEqual(["a", "c"]);
    });

    it("应触发 Change 事件", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: [],
        options,
      });
      const handler = vi.fn();
      selection.onChange(handler);
      selection.setValue(["a"]);
      expect(handler).toHaveBeenCalledWith(["a"]);
    });
  });

  describe("select", () => {
    it("应添加选项", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: [],
        options,
      });
      selection.select("a");
      expect(selection.value).toContain("a");
    });

    it("重复选择不应重复添加", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a"],
        options,
      });
      selection.select("a");
      expect(selection.value).toEqual(["a"]);
    });

    it("应触发 StateChange 事件", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: [],
        options,
      });
      const handler = vi.fn();
      selection.onStateChange(handler);
      selection.select("a");
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("应移除选项", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a", "b"],
        options,
      });
      selection.remove("a");
      expect(selection.value).toEqual(["b"]);
    });

    it("移除不存在的选项不应报错", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a"],
        options,
      });
      selection.remove("z");
      expect(selection.value).toEqual(["a"]);
    });
  });

  describe("toggle", () => {
    it("应添加不存在的选项", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: [],
        options,
      });
      selection.toggle("a");
      expect(selection.value).toContain("a");
    });

    it("应移除已存在的选项", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a"],
        options,
      });
      selection.toggle("a");
      expect(selection.value).not.toContain("a");
    });
  });

  describe("isEmpty", () => {
    it("空值应返回 true", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: [],
        options,
      });
      expect(selection.isEmpty()).toBe(true);
    });

    it("有值应返回 false", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a"],
        options,
      });
      expect(selection.isEmpty()).toBe(false);
    });
  });

  describe("clear", () => {
    it("应清空所有选项", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a", "b"],
        options,
      });
      selection.clear();
      expect(selection.value).toEqual([]);
    });

    it("应触发 Change 事件", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: ["a"],
        options,
      });
      const handler = vi.fn();
      selection.onChange(handler);
      selection.clear();
      expect(handler).toHaveBeenCalledWith([]);
    });
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
      const selection = new MultipleSelectionCore({
        defaultValue: [],
        options,
      });
      const handler = vi.fn();
      const unlisten = selection.onChange(handler);
      selection.select("a");
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      selection.select("b");
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
