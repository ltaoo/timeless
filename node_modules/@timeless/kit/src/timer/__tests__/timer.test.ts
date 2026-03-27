import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { TimerCore } from "../index";

describe("TimerCore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("构造函数", () => {
    it("初始状态 timer 应为 null", () => {
      const timer = new TimerCore();
      expect(timer.timer).toBeNull();
    });
  });

  describe("interval 方法", () => {
    it("应定期调用回调函数", () => {
      const timer = new TimerCore();
      const fn = vi.fn();
      timer.interval(fn, 1000);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(fn).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(1000);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("timer 不为 null 时不应重复设置", () => {
      const timer = new TimerCore();
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      timer.timer = setTimeout(() => {}, 1000) as any;
      timer.interval(fn2, 500);
      vi.advanceTimersByTime(1000);
      expect(fn2).not.toHaveBeenCalled();
    });
  });

  describe("clear 方法", () => {
    it("timer 为 null 时不应报错", () => {
      const timer = new TimerCore();
      expect(() => timer.clear()).not.toThrow();
    });

    it("timer 不为 null 时应清除定时器", () => {
      const timer = new TimerCore();
      const mockTimer = setTimeout(() => {}, 1000) as any;
      timer.timer = mockTimer;
      timer.clear();
      expect(timer.timer).toBeNull();
    });
  });
});
