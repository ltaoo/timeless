import { describe, it, expect, vi, beforeEach } from "vitest";

import { TimePickerCore } from "@/time-picker";

describe("TimePickerCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const picker = TimePickerCore({});
      expect(picker.shape).toBe("time-picker");
      expect(picker.value).toBe(null);
      expect(picker.showSeconds).toBe(false);
      expect(picker.use12Hours).toBe(false);
    });

    it("可以设置默认值", () => {
      const picker = TimePickerCore({
        defaultValue: { hour: 10, minute: 30 },
      });
      expect(picker.value).toEqual({ hour: 10, minute: 30 });
    });

    it("可以设置 showSeconds", () => {
      const picker = TimePickerCore({ showSeconds: true });
      expect(picker.showSeconds).toBe(true);
    });

    it("可以设置 use12Hours", () => {
      const picker = TimePickerCore({ use12Hours: true });
      expect(picker.use12Hours).toBe(true);
    });

    it("可以设置 hourStep", () => {
      const picker = TimePickerCore({ hourStep: 2 });
      expect(picker.hourStep).toBe(2);
    });

    it("可以设置 minuteStep", () => {
      const picker = TimePickerCore({ minuteStep: 15 });
      expect(picker.minuteStep).toBe(15);
    });
  });

  describe("generateHours", () => {
    it("应生成 24 小时", () => {
      const picker = TimePickerCore({});
      const hours = picker.generateHours();
      expect(hours.length).toBe(24);
      expect(hours[0]).toBe(0);
      expect(hours[23]).toBe(23);
    });

    it("12 小时制应生成 12 小时", () => {
      const picker = TimePickerCore({ use12Hours: true });
      const hours = picker.generateHours();
      expect(hours.length).toBe(12);
      expect(hours[0]).toBe(1);
      expect(hours[11]).toBe(12);
    });

    it("应支持 hourStep", () => {
      const picker = TimePickerCore({ hourStep: 2 });
      const hours = picker.generateHours();
      expect(hours).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
    });
  });

  describe("generateMinutes", () => {
    it("应生成 60 分钟", () => {
      const picker = TimePickerCore({});
      const minutes = picker.generateMinutes();
      expect(minutes.length).toBe(60);
    });

    it("应支持 minuteStep", () => {
      const picker = TimePickerCore({ minuteStep: 15 });
      const minutes = picker.generateMinutes();
      expect(minutes).toEqual([0, 15, 30, 45]);
    });
  });

  describe("generateSeconds", () => {
    it("应生成 60 秒", () => {
      const picker = TimePickerCore({});
      const seconds = picker.generateSeconds();
      expect(seconds.length).toBe(60);
    });

    it("应支持 secondStep", () => {
      const picker = TimePickerCore({ secondStep: 30 });
      const seconds = picker.generateSeconds();
      expect(seconds).toEqual([0, 30]);
    });
  });

  describe("selectHour / selectMinute / selectSecond", () => {
    it("selectHour 应设置临时小时", () => {
      const picker = TimePickerCore({});
      picker.selectHour(10);
      expect(picker.state.tempHour).toBe(10);
    });

    it("selectMinute 应设置临时分钟", () => {
      const picker = TimePickerCore({});
      picker.selectMinute(30);
      expect(picker.state.tempMinute).toBe(30);
    });

    it("selectSecond 应设置临时秒", () => {
      const picker = TimePickerCore({});
      picker.selectSecond(45);
      expect(picker.state.tempSecond).toBe(45);
    });

    it("应触发 StateChange 事件", () => {
      const picker = TimePickerCore({});
      const handler = vi.fn();
      picker.onStateChange(handler);
      picker.selectHour(10);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("confirm", () => {
    it("应设置最终值", () => {
      const picker = TimePickerCore({});
      picker.selectHour(10);
      picker.selectMinute(30);
      picker.confirm();
      expect(picker.value).toEqual({ hour: 10, minute: 30 });
    });

    it("showSeconds 时应包含秒", () => {
      const picker = TimePickerCore({ showSeconds: true });
      picker.selectHour(10);
      picker.selectMinute(30);
      picker.selectSecond(45);
      picker.confirm();
      expect(picker.value).toEqual({ hour: 10, minute: 30, second: 45 });
    });

    it("应触发 Change 事件", () => {
      const picker = TimePickerCore({});
      const handler = vi.fn();
      picker.onChange(handler);
      picker.selectHour(10);
      picker.selectMinute(30);
      picker.confirm();
      expect(handler).toHaveBeenCalled();
    });

    it("小时或分钟为 null 时不应确认", () => {
      const picker = TimePickerCore({});
      const handler = vi.fn();
      picker.onChange(handler);
      picker.confirm();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("应清空值", () => {
      const picker = TimePickerCore({
        defaultValue: { hour: 10, minute: 30 },
      });
      picker.clear();
      expect(picker.value).toBe(null);
    });

    it("应清空临时值", () => {
      const picker = TimePickerCore({
        defaultValue: { hour: 10, minute: 30 },
      });
      picker.clear();
      expect(picker.state.tempHour).toBe(null);
      expect(picker.state.tempMinute).toBe(null);
      expect(picker.state.tempSecond).toBe(null);
    });

    it("应触发 Change 事件", () => {
      const picker = TimePickerCore({
        defaultValue: { hour: 10, minute: 30 },
      });
      const handler = vi.fn();
      picker.onChange(handler);
      picker.clear();
      expect(handler).toHaveBeenCalledWith(null);
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const picker = TimePickerCore({});
      picker.setValue({ hour: 10, minute: 30 });
      expect(picker.value).toEqual({ hour: 10, minute: 30 });
    });

    it("应同步临时值", () => {
      const picker = TimePickerCore({});
      picker.setValue({ hour: 10, minute: 30, second: 45 });
      expect(picker.state.tempHour).toBe(10);
      expect(picker.state.tempMinute).toBe(30);
      expect(picker.state.tempSecond).toBe(45);
    });

    it("设置 null 应清空", () => {
      const picker = TimePickerCore({
        defaultValue: { hour: 10, minute: 30 },
      });
      picker.setValue(null);
      expect(picker.value).toBe(null);
    });
  });

  describe("state", () => {
    it("应返回正确的格式化时间", () => {
      const picker = TimePickerCore({
        defaultValue: { hour: 10, minute: 30 },
      });
      expect(picker.state.time).toBe("10:30");
    });

    it("showSeconds 时应包含秒", () => {
      const picker = TimePickerCore({
        defaultValue: { hour: 10, minute: 30, second: 45 },
        showSeconds: true,
      });
      expect(picker.state.time).toBe("10:30:45");
    });

    it("未设置值时 time 应为 null", () => {
      const picker = TimePickerCore({});
      expect(picker.state.time).toBe(null);
    });
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
      const picker = TimePickerCore({});
      const handler = vi.fn();
      const unlisten = picker.onChange(handler);
      picker.selectHour(10);
      picker.selectMinute(30);
      picker.confirm();
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      picker.selectHour(11);
      picker.selectMinute(45);
      picker.confirm();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const picker = TimePickerCore({});
      const handler = vi.fn();
      const unlisten = picker.onStateChange(handler);
      picker.selectHour(10);
      expect(handler).toHaveBeenCalled();
      unlisten();
      picker.selectHour(11);
      const callCount = handler.mock.calls.length;
      picker.selectHour(12);
      expect(handler.mock.calls.length).toBe(callCount);
    });
  });
});
