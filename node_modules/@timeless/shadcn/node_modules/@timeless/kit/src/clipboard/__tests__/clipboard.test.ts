import { describe, it, expect, vi, beforeEach } from "vitest";

import { ClipboardModel } from "../index";

describe("ClipboardModel", () => {
  let clipboard: ClipboardModel;

  beforeEach(() => {
    clipboard = ClipboardModel();
  });

  describe("初始状态", () => {
    it("state 应为空对象", () => {
      expect(clipboard.state).toEqual({});
    });

    it("readText 应返回错误信息", async () => {
      const result = await clipboard.readText();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe("请实现 readText 方法");
    });

    it("writeText 应存在", () => {
      expect(clipboard.writeText).toBeDefined();
      expect(typeof clipboard.writeText).toBe("function");
    });
  });

  describe("事件监听", () => {
    it("onStateChange 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = clipboard.onStateChange(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onError 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = clipboard.onError(handler);
      expect(typeof unlisten).toBe("function");
    });
  });

  describe("销毁", () => {
    it("destroy 应正常调用", () => {
      expect(() => clipboard.destroy()).not.toThrow();
    });
  });
});
