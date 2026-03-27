import { describe, it, expect, vi, beforeEach } from "vitest";

import { StepCore } from "@/step";

describe("StepCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const step = new StepCore();
      expect(step.value).toBe(0);
    });

    it("可以设置初始值", () => {
      const step = new StepCore({ value: 5 });
      expect(step.value).toBe(5);
    });
  });

  describe("change", () => {
    it("应设置值", () => {
      const step = new StepCore();
      step.change(3);
      expect(step.value).toBe(3);
    });

    it("应触发 StateChange 事件", () => {
      const step = new StepCore();
      const handler = vi.fn();
      step.onStateChange(handler);
      step.change(3);
      expect(handler).toHaveBeenCalled();
    });

    it("应触发 Change 事件", () => {
      const step = new StepCore();
      const handler = vi.fn();
      step.onChange(handler);
      step.change(3);
      expect(handler).toHaveBeenCalledWith(3);
    });
  });

  describe("state", () => {
    it("应返回正确的状态", () => {
      const step = new StepCore({ value: 5 });
      expect(step.state).toEqual({
        value: 5,
      });
    });
  });

  describe("事件监听", () => {
    it("onChange 应返回取消监听函数", () => {
      const step = new StepCore();
      const handler = vi.fn();
      const unlisten = step.onChange(handler);
      step.change(1);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      step.change(2);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("onStateChange 应返回取消监听函数", () => {
      const step = new StepCore();
      const handler = vi.fn();
      const unlisten = step.onStateChange(handler);
      step.change(1);
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      step.change(2);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
