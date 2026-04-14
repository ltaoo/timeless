import { describe, it, expect, vi, beforeEach } from "vitest";

import { RadioCore, RadioGroupCore } from "@/radio";

describe("RadioCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const radio = new RadioCore();
      expect(radio.checked).toBe(false);
      expect(radio.label).toBe("");
      expect(radio.disabled).toBe(false);
      expect(radio.value).toBe("");
    });

    it("可以设置初始状态", () => {
      const radio = new RadioCore({
        label: "选项A",
        checked: true,
        disabled: true,
        value: "a",
      });
      expect(radio.label).toBe("选项A");
      expect(radio.checked).toBe(true);
      expect(radio.disabled).toBe(true);
      expect(radio.value).toBe("a");
    });
  });

  describe("check / uncheck", () => {
    it("check 应设置 checked 为 true", () => {
      const radio = new RadioCore();
      radio.check();
      expect(radio.checked).toBe(true);
    });

    it("check 已选中状态不应触发事件", () => {
      const radio = new RadioCore({ checked: true });
      const handler = vi.fn();
      radio.onStateChange(handler);
      radio.check();
      expect(handler).not.toHaveBeenCalled();
    });

    it("check disabled 状态不应触发事件", () => {
      const radio = new RadioCore({ disabled: true });
      const handler = vi.fn();
      radio.onStateChange(handler);
      radio.check();
      expect(handler).not.toHaveBeenCalled();
    });

    it("uncheck 应设置 checked 为 false", () => {
      const radio = new RadioCore({ checked: true });
      radio.uncheck();
      expect(radio.checked).toBe(false);
    });

    it("uncheck 未选中状态不应触发事件", () => {
      const radio = new RadioCore();
      const handler = vi.fn();
      radio.onStateChange(handler);
      radio.uncheck();
      expect(handler).not.toHaveBeenCalled();
    });

    it("check 应触发 Change 事件", () => {
      const radio = new RadioCore();
      const handler = vi.fn();
      radio.onChange(handler);
      radio.check();
      expect(handler).toHaveBeenCalledWith(true);
    });
  });

  describe("reset", () => {
    it("应重置为默认值", () => {
      const radio = new RadioCore({ checked: true });
      radio.uncheck();
      radio.reset();
      expect(radio.checked).toBe(true);
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
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
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
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

    it("onStateChange 应返回取消监听函数", () => {
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

describe("RadioGroupCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const group = new RadioGroupCore();
      expect(group.options).toEqual([]);
      expect(group.value).toBe(null);
      expect(group.disabled).toBe(false);
    });

    it("可以设置选项", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      expect(group.options.length).toBe(2);
    });

    it("可以设置初始值", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
        value: "a",
      });
      expect(group.value).toBe("a");
    });

    it("可以设置禁用状态", () => {
      const group = new RadioGroupCore({ disabled: true });
      expect(group.disabled).toBe(true);
    });
  });

  describe("select", () => {
    it("应选中指定选项", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
      });
      group.select("a");
      expect(group.value).toBe("a");
    });

    it("应取消其他选项的选中状态", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
        value: "a",
      });
      group.select("b");
      expect(group.value).toBe("b");
      expect(group.options[0].core.checked).toBe(false);
      expect(group.options[1].core.checked).toBe(true);
    });

    it("相同值不应触发事件", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
        value: "a",
      });
      const handler = vi.fn();
      group.onChange(handler);
      group.select("a");
      expect(handler).not.toHaveBeenCalled();
    });

    it("应触发 Change 事件", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const handler = vi.fn();
      group.onChange(handler);
      group.select("a");
      expect(handler).toHaveBeenCalledWith("a");
    });
  });

  describe("reset", () => {
    it("应清空选中值", () => {
      const group = new RadioGroupCore({
        options: [
          { value: "a", label: "选项A" },
          { value: "b", label: "选项B" },
        ],
        value: "a",
      });
      group.reset();
      expect(group.value).toBe(null);
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      group.setValue("a");
      expect(group.value).toBe("a");
    });

    it("设置 null 应调用 reset", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
        value: "a",
      });
      group.setValue(null);
      expect(group.value).toBe(null);
    });
  });

  describe("setOptions", () => {
    it("应更新选项列表", () => {
      const group = new RadioGroupCore();
      group.setOptions([
        { value: "a", label: "选项A" },
        { value: "b", label: "选项B" },
      ]);
      expect(group.options.length).toBe(2);
    });

    it("应销毁旧的选项核心", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
      });
      const oldCore = group.options[0].core;
      const destroySpy = vi.spyOn(oldCore, "destroy");
      group.setOptions([{ value: "b", label: "选项B" }]);
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const group = new RadioGroupCore({
        options: [{ value: "a", label: "选项A" }],
        value: "a",
        disabled: false,
      });
      expect(group.state.value).toBe("a");
      expect(group.state.disabled).toBe(false);
      expect(group.state.options.length).toBe(1);
    });
  });
});
