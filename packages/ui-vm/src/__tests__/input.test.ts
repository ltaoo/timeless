import { describe, it, expect, vi, beforeEach } from "vitest";

import { InputCore } from "@/input/index";

describe("InputCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const input = new InputCore({ defaultValue: "" });
      expect(input.value).toBe("");
      expect(input.placeholder).toBe("请输入");
      expect(input.disabled).toBe(false);
      expect(input.type).toBe("string");
    });

    it("可以设置初始值", () => {
      const input = new InputCore({ defaultValue: "hello" });
      expect(input.value).toBe("hello");
    });

    it("可以设置 placeholder", () => {
      const input = new InputCore({
        defaultValue: "",
        placeholder: "请输入姓名",
      });
      expect(input.placeholder).toBe("请输入姓名");
    });

    it("可以设置 disabled", () => {
      const input = new InputCore({ defaultValue: "", disabled: true });
      expect(input.disabled).toBe(true);
    });

    it("可以设置 type", () => {
      const input = new InputCore({ defaultValue: "", type: "password" });
      expect(input.type).toBe("password");
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const input = new InputCore({ defaultValue: "" });
      input.setValue("hello");
      expect(input.value).toBe("hello");
    });

    it("应触发 Change 事件", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      input.onChange(handler);
      input.setValue("hello");
      expect(handler).toHaveBeenCalledWith("hello");
    });

    it("应触发 StateChange 事件", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      input.onStateChange(handler);
      input.setValue("hello");
      expect(handler).toHaveBeenCalled();
    });

    it("silence 模式不应触发事件", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      input.onChange(handler);
      input.setValue("hello", { silence: true });
      expect(handler).not.toHaveBeenCalled();
    });

    it("number 类型应转换为数字", () => {
      const input = new InputCore({ defaultValue: 0, type: "number" });
      input.setValue("123" as any);
      expect(input.value).toBe(123);
    });
  });

  describe("clear", () => {
    it("应清空值", () => {
      const input = new InputCore({ defaultValue: "hello" });
      input.clear();
      expect(input.value).toBe("");
    });

    it("应触发 Change 事件", () => {
      const input = new InputCore({ defaultValue: "hello" });
      const handler = vi.fn();
      input.onChange(handler);
      input.clear();
      expect(handler).toHaveBeenCalledWith("");
    });

    it("应触发 Clear 事件", () => {
      const input = new InputCore({ defaultValue: "hello" });
      const handler = vi.fn();
      input.onClear(handler);
      input.clear();
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("handleEnter", () => {
    it("应触发 Enter 事件", () => {
      const input = new InputCore({ defaultValue: "hello" });
      const handler = vi.fn();
      input.onEnter(handler);
      input.handleEnter();
      expect(handler).toHaveBeenCalled();
    });

    it("相同值不应重复触发", () => {
      const input = new InputCore({ defaultValue: "hello" });
      const handler = vi.fn();
      input.onEnter(handler);
      input.handleEnter();
      input.handleEnter();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleBlur", () => {
    it("应触发 Blur 事件", () => {
      const input = new InputCore({ defaultValue: "hello" });
      const handler = vi.fn();
      input.onBlur(handler);
      input.handleBlur();
      expect(handler).toHaveBeenCalledWith("hello");
    });

    it("相同值不应重复触发", () => {
      const input = new InputCore({ defaultValue: "hello" });
      const handler = vi.fn();
      input.onBlur(handler);
      input.handleBlur();
      input.handleBlur();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleKeyDown", () => {
    it("Enter 键应触发 handleEnter", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      input.onEnter(handler);
      input.handleKeyDown({ key: "Enter", preventDefault: vi.fn() });
      expect(handler).toHaveBeenCalled();
    });

    it("ignoreEnterEvent 时不应触发 handleEnter", () => {
      const input = new InputCore({ defaultValue: "", ignoreEnterEvent: true });
      const handler = vi.fn();
      input.onEnter(handler);
      input.handleKeyDown({ key: "Enter", preventDefault: vi.fn() });
      expect(handler).not.toHaveBeenCalled();
    });

    it("其他键应触发 KeyDown 事件", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      input.onKeyDown(handler);
      input.handleKeyDown({ key: "a", preventDefault: vi.fn() });
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("setPlaceholder", () => {
    it("应设置 placeholder", () => {
      const input = new InputCore({ defaultValue: "" });
      input.setPlaceholder("新占位符");
      expect(input.placeholder).toBe("新占位符");
    });

    it("应触发 StateChange 事件", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      input.onStateChange(handler);
      input.setPlaceholder("新占位符");
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("setLoading", () => {
    it("应设置 loading 状态", () => {
      const input = new InputCore({ defaultValue: "" });
      input.setLoading(true);
      expect(input.state.loading).toBe(true);
    });

    it("相同值不应触发事件", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      input.onStateChange(handler);
      input.setLoading(false);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("showText / hideText", () => {
    it("showText 应设置 tmpType 为 text", () => {
      const input = new InputCore({ defaultValue: "", type: "password" });
      input.showText();
      expect(input.tmpType).toBe("text");
    });

    it("hideText 应重置 tmpType", () => {
      const input = new InputCore({ defaultValue: "", type: "password" });
      input.showText();
      input.hideText();
      expect(input.tmpType).toBe("");
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const input = new InputCore({
        defaultValue: "hello",
        placeholder: "请输入",
        disabled: false,
        type: "text",
      });
      expect(input.state.value).toBe("hello");
      expect(input.state.placeholder).toBe("请输入");
      expect(input.state.disabled).toBe(false);
      expect(input.state.type).toBe("text");
    });
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      const unlisten = input.onChange(handler);
      input.setValue("hello");
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      input.setValue("world");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const input = new InputCore({ defaultValue: "" });
      const handler = vi.fn();
      const unlisten = input.onStateChange(handler);
      input.setValue("hello");
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      input.setValue("world");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onClear 应返回取消监听函数", () => {
      const input = new InputCore({ defaultValue: "hello" });
      const handler = vi.fn();
      const unlisten = input.onClear(handler);
      input.clear();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      input.setValue("hello");
      input.clear();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
