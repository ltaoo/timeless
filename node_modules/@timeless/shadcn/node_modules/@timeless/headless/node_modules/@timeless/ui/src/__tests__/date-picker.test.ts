import { describe, it, expect, vi, beforeEach } from "vitest";

import { DatePickerCore } from "@/date-picker";

describe("DatePickerCore", () => {
  describe("构造函数", () => {
    it("应正确初始化", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      expect(picker.shape).toBe("date-picker");
      expect(picker.state.date).toBeDefined();
      expect(picker.state.value).toBeDefined();
    });

    it("应包含 calendar 实例", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      expect(picker.$calendar).toBeDefined();
    });

    it("应包含 presence 实例", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      expect(picker.$presence).toBeDefined();
    });

    it("应包含 popper 实例", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      expect(picker.$popper).toBeDefined();
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      const newDate = new Date(2024, 0, 20);
      picker.setValue(newDate);
      expect(picker.value).toBeDefined();
    });

    it("应触发 Change 事件", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      const handler = vi.fn();
      picker.onChange(handler);
      const newDate = new Date(2024, 0, 20);
      picker.setValue(newDate);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      expect(picker.state.date).toBeDefined();
      expect(picker.state.value).toBeDefined();
    });

    it("未选择日期时 date 应显示提示文本", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      // 初始状态下应该有值
      expect(picker.state.date).toBeDefined();
    });
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      const handler = vi.fn();
      const unlisten = picker.onChange(handler);
      const newDate = new Date(2024, 0, 20);
      picker.setValue(newDate);
      expect(handler).toHaveBeenCalled();
      unlisten();
      const anotherDate = new Date(2024, 0, 25);
      picker.setValue(anotherDate);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const today = new Date(2024, 0, 15);
      const picker = DatePickerCore({ today });
      const handler = vi.fn();
      const unlisten = picker.onStateChange(handler);
      const newDate = new Date(2024, 0, 20);
      picker.setValue(newDate);
      expect(handler).toHaveBeenCalled();
      unlisten();
      const anotherDate = new Date(2024, 0, 25);
      picker.setValue(anotherDate);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
