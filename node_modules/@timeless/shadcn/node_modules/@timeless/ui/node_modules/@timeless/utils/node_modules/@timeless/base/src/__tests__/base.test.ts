import { describe, it, expect, vi, beforeEach } from "vitest";

import { base, BaseDomain, BaseEvents } from "../base";

describe("base", () => {
  describe("事件监听", () => {
    it("on 应注册监听器", () => {
      const bus = base<{ test: string }>();
      const handler = vi.fn();
      bus.on("test", handler);
      bus.emit("test", "hello");
      expect(handler).toHaveBeenCalledWith("hello");
    });

    it("on 应返回取消监听函数", () => {
      const bus = base<{ test: string }>();
      const handler = vi.fn();
      const unlisten = bus.on("test", handler);
      bus.emit("test", "hello");
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      bus.emit("test", "world");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("off 应移除监听器", () => {
      const bus = base<{ test: string }>();
      const handler = vi.fn();
      bus.on("test", handler);
      bus.off("test", handler);
      bus.emit("test", "hello");
      expect(handler).not.toHaveBeenCalled();
    });

    it("emit 应触发事件", () => {
      const bus = base<{ test: number }>();
      const handler = vi.fn();
      bus.on("test", handler);
      bus.emit("test", 42);
      expect(handler).toHaveBeenCalledWith(42);
    });

    it("多个监听器应都被触发", () => {
      const bus = base<{ test: string }>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus.on("test", handler1);
      bus.on("test", handler2);
      bus.emit("test", "hello");
      expect(handler1).toHaveBeenCalledWith("hello");
      expect(handler2).toHaveBeenCalledWith("hello");
    });
  });

  describe("destroy", () => {
    it("应移除所有监听器", () => {
      const bus = base<{ test: string }>();
      const handler = vi.fn();
      bus.on("test", handler);
      bus.destroy();
      bus.emit("test", "hello");
      expect(handler).not.toHaveBeenCalled();
    });

    it("destroy 后再次 emit 事件不会触发已移除的监听器", () => {
      const bus = base<{ test: string }>();
      const handler = vi.fn();
      bus.on("test", handler);
      bus.destroy();
      bus.emit("test", "hello");
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("uid", () => {
    it("应返回递增的唯一 ID", () => {
      const bus = base<{}>();
      const id1 = bus.uid();
      const id2 = bus.uid();
      const id3 = bus.uid();
      expect(id2).toBe(id1 + 1);
      expect(id3).toBe(id2 + 1);
    });
  });
});

describe("BaseDomain", () => {
  describe("构造函数", () => {
    it("默认 unique_id", () => {
      const domain = new BaseDomain();
      expect(domain.unique_id).toBe("BaseDomain");
    });

    it("传入 unique_id", () => {
      const domain = new BaseDomain({ unique_id: "TestDomain" });
      expect(domain.unique_id).toBe("TestDomain");
    });

    it("默认 debug 为 false", () => {
      const domain = new BaseDomain();
      expect(domain.debug).toBe(false);
    });
  });

  describe("事件监听", () => {
    it("on 应注册监听器", () => {
      const domain = new BaseDomain<{ test: string }>();
      const handler = vi.fn();
      domain.on("test", handler);
      domain.emit("test", "hello");
      expect(handler).toHaveBeenCalledWith("hello");
    });

    it("on 应返回取消监听函数", () => {
      const domain = new BaseDomain<{ test: string }>();
      const handler = vi.fn();
      const unlisten = domain.on("test", handler);
      domain.emit("test", "hello");
      expect(handler).toHaveBeenCalledTimes(1);
      unlisten();
      domain.emit("test", "world");
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("off 应移除监听器", () => {
      const domain = new BaseDomain<{ test: string }>();
      const handler = vi.fn();
      domain.on("test", handler);
      domain.off("test", handler);
      domain.emit("test", "hello");
      expect(handler).not.toHaveBeenCalled();
    });

    it("offEvent 应移除指定事件的所有监听器", () => {
      const domain = new BaseDomain<{ test: string }>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      domain.on("test", handler1);
      domain.on("test", handler2);
      domain.offEvent("test" as any);
      domain.emit("test", "hello");
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it("emit 应触发事件", () => {
      const domain = new BaseDomain<{ test: number }>();
      const handler = vi.fn();
      domain.on("test", handler);
      domain.emit("test", 42);
      expect(handler).toHaveBeenCalledWith(42);
    });

    it("多个监听器应都被触发", () => {
      const domain = new BaseDomain<{ test: string }>();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      domain.on("test", handler1);
      domain.on("test", handler2);
      domain.emit("test", "hello");
      expect(handler1).toHaveBeenCalledWith("hello");
      expect(handler2).toHaveBeenCalledWith("hello");
    });
  });

  describe("destroy", () => {
    it("应移除所有监听器", () => {
      const domain = new BaseDomain<{ test: string }>();
      const handler = vi.fn();
      domain.on("test", handler);
      domain.destroy();
      domain.emit("test", "hello");
      expect(handler).not.toHaveBeenCalled();
    });

    it("destroy 后再次 emit 事件不会触发已移除的监听器", () => {
      const domain = new BaseDomain<{ test: string }>();
      const handler = vi.fn();
      domain.on("test", handler);
      domain.destroy();
      domain.emit("test", "hello");
      expect(handler).not.toHaveBeenCalled();
    });

    it("onDestroy 应返回取消监听函数", () => {
      const domain = new BaseDomain();
      const handler = vi.fn();
      const unlisten = domain.onDestroy(handler);
      expect(typeof unlisten).toBe("function");
    });
  });

  describe("uid", () => {
    it("应返回递增的唯一 ID", () => {
      const domain = new BaseDomain();
      const id1 = domain.uid();
      const id2 = domain.uid();
      const id3 = domain.uid();
      expect(id2).toBe(id1 + 1);
      expect(id3).toBe(id2 + 1);
    });
  });

  describe("log", () => {
    it("debug 为 false 时返回空数组", () => {
      const domain = new BaseDomain();
      domain.debug = false;
      const result = domain.log("test");
      expect(result).toEqual([]);
    });

    it("debug 为 true 时返回日志数组", () => {
      const domain = new BaseDomain();
      domain.debug = true;
      const result = domain.log("test", "value");
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain("test");
      expect(result).toContain("value");
    });
  });

  describe("Symbol.toStringTag", () => {
    it("应返回 Domain", () => {
      const domain = new BaseDomain();
      expect(Object.prototype.toString.call(domain)).toBe("[object Domain]");
    });
  });
});
