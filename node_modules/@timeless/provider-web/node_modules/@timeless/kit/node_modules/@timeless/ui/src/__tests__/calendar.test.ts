import { describe, it, expect, vi, beforeEach } from "vitest";

import { CalendarCore } from "@/calendar";

describe("CalendarCore", () => {
  describe("构造函数", () => {
    it("应正确初始化", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      expect(calendar.state.day).toBeDefined();
      expect(calendar.state.month).toBeDefined();
      expect(calendar.state.year).toBeDefined();
      expect(calendar.state.weeks.length).toBe(6);
    });

    it("应生成正确的月份文本", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      expect(calendar.state.month.text).toBe("1月");
    });

    it("应生成正确的年份", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      expect(calendar.state.year.text).toBe(2024);
    });
  });

  describe("selectDay", () => {
    it("应选中指定日期", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      const newDay = new Date(2024, 0, 20);
      calendar.selectDay(newDay);
      expect(calendar.state.day.text).toBe("20");
    });

    it("应触发 SelectDay 事件", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      const handler = vi.fn();
      calendar.onSelectDay(handler);
      const newDay = new Date(2024, 0, 20);
      calendar.selectDay(newDay);
      expect(handler).toHaveBeenCalled();
    });

    it("应触发 Change 事件", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      const handler = vi.fn();
      calendar.onChange(handler);
      const newDay = new Date(2024, 0, 20);
      calendar.selectDay(newDay);
      expect(handler).toHaveBeenCalled();
    });

    it("选择不同月份的日期应刷新周数据", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      const newDay = new Date(2024, 1, 15);
      calendar.selectDay(newDay);
      expect(calendar.state.month.text).toBe("2月");
    });
  });

  describe("buildMonthText", () => {
    it("应返回正确的月份文本", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      expect(calendar.buildMonthText(new Date(2024, 0, 1))).toBe("1月");
      expect(calendar.buildMonthText(new Date(2024, 5, 1))).toBe("6月");
      expect(calendar.buildMonthText(new Date(2024, 11, 1))).toBe("12月");
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      expect(calendar.state.day).toBeDefined();
      expect(calendar.state.month).toBeDefined();
      expect(calendar.state.year).toBeDefined();
      expect(calendar.state.weeks).toBeDefined();
      expect(calendar.state.selectedDay).toBeDefined();
    });

    it("weeks 应包含 6 周", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      expect(calendar.state.weeks.length).toBe(6);
      expect(calendar.state.weeks[0].dates.length).toBe(7);
    });

    it("日期应包含正确的属性", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      const date = calendar.state.weeks[0].dates[0];
      expect(date).toHaveProperty("id");
      expect(date).toHaveProperty("text");
      expect(date).toHaveProperty("yyyy");
      expect(date).toHaveProperty("value");
      expect(date).toHaveProperty("time");
      expect(date).toHaveProperty("is_prev_month");
      expect(date).toHaveProperty("is_next_month");
      expect(date).toHaveProperty("is_today");
    });
  });

  describe("value", () => {
    it("应返回当前选中的日期", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      expect(calendar.value).toBeDefined();
    });
  });

  describe("事件监听", () => {
    it("onSelectDay 应返回取消监听函数", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      const handler = vi.fn();
      const unlisten = calendar.onSelectDay(handler);
      const newDay = new Date(2024, 0, 20);
      calendar.selectDay(newDay);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      const anotherDay = new Date(2024, 0, 25);
      calendar.selectDay(anotherDay);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onChange 应返回取消监听函数", () => {
      const today = new Date(2024, 0, 15);
      const calendar = CalendarCore({ today });
      const handler = vi.fn();
      const unlisten = calendar.onChange(handler);
      const newDay = new Date(2024, 0, 20);
      calendar.selectDay(newDay);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      const anotherDay = new Date(2024, 0, 25);
      calendar.selectDay(anotherDay);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
