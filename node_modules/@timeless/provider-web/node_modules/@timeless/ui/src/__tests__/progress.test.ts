import { describe, it, expect, vi, beforeEach } from "vitest";

import { ProgressCore } from "@/progress";

describe("ProgressCore", () => {
  describe("构造函数", () => {
    it("默认状态", () => {
      const progress = new ProgressCore({});
      expect(progress.state.value).toBe(undefined);
      expect(progress.state.max).toBe(100);
      expect(progress.state.state).toBe("indeterminate");
    });

    it("可以设置初始值", () => {
      const progress = new ProgressCore({ value: 50 });
      expect(progress.state.value).toBe(50);
      expect(progress.state.state).toBe("loading");
    });

    it("可以设置 max", () => {
      const progress = new ProgressCore({ value: 50, max: 200 });
      expect(progress.state.max).toBe(200);
    });

    it("无效的 max 应使用默认值", () => {
      const progress = new ProgressCore({ value: 50, max: 0 });
      expect(progress.state.max).toBe(100);
    });

    it("无效的 value 应设置为 undefined", () => {
      const progress = new ProgressCore({ value: -1 });
      expect(progress.state.value).toBe(undefined);
    });

    it("value 超过 max 应设置为 undefined", () => {
      const progress = new ProgressCore({ value: 150, max: 100 });
      expect(progress.state.value).toBe(undefined);
    });
  });

  describe("setValue", () => {
    it("应设置值", () => {
      const progress = new ProgressCore({});
      progress.setValue(50);
      expect(progress.state.value).toBe(50);
    });

    it("应触发 ValueChange 事件", () => {
      const progress = new ProgressCore({});
      const handler = vi.fn();
      progress.onValueChange(handler);
      progress.setValue(50);
      expect(handler).toHaveBeenCalledWith(50);
    });

    it("应触发 StateChange 事件", () => {
      const progress = new ProgressCore({});
      const handler = vi.fn();
      progress.onStateChange(handler);
      progress.setValue(50);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("应更新值", () => {
      const progress = new ProgressCore({});
      progress.update(75);
      expect(progress.state.value).toBe(75);
    });

    it("应触发事件", () => {
      const progress = new ProgressCore({});
      const handler = vi.fn();
      progress.onValueChange(handler);
      progress.update(75);
      expect(handler).toHaveBeenCalledWith(75);
    });
  });

  describe("state", () => {
    it("value 为 null 时状态为 indeterminate", () => {
      const progress = new ProgressCore({});
      expect(progress.state.state).toBe("indeterminate");
    });

    it("value 等于 max 时状态为 complete", () => {
      const progress = new ProgressCore({ value: 100 });
      expect(progress.state.state).toBe("complete");
    });

    it("value 小于 max 时状态为 loading", () => {
      const progress = new ProgressCore({ value: 50 });
      expect(progress.state.state).toBe("loading");
    });

    it("应生成正确的 label", () => {
      const progress = new ProgressCore({ value: 50 });
      expect(progress.state.label).toBe("50%");
    });

    it("可以自定义 label 生成函数", () => {
      const progress = new ProgressCore({
        value: 50,
        getValueLabel: (value, max) => `${value}/${max}`,
      });
      expect(progress.state.label).toBe("50/100");
    });
  });

  describe("事件监听", () => {
    it("onValueChange 应注册监听器", () => {
      const progress = new ProgressCore({});
      const handler = vi.fn();
      progress.onValueChange(handler);
      progress.setValue(50);
      expect(handler).toHaveBeenCalledWith(50);
    });

    it("onStateChange 应注册监听器", () => {
      const progress = new ProgressCore({});
      const handler = vi.fn();
      progress.onStateChange(handler);
      progress.setValue(50);
      expect(handler).toHaveBeenCalled();
    });
  });
});
