import { describe, it, expect, vi, beforeEach } from "vitest";

import { NavigatorCore } from "../index";

describe("NavigatorCore", () => {
  let router: NavigatorCore;

  beforeEach(() => {
    NavigatorCore.prefix = null;
    router = new NavigatorCore();
  });

  describe("构造函数", () => {
    it("初始状态", () => {
      expect(router.pathname).toBe("/");
      expect(router.query).toEqual({});
      expect(router.params).toEqual({});
      expect(router.href).toBe("/");
      expect(router.histories).toEqual([]);
      expect(router.prevHistories).toEqual([]);
      expect(router.prevPathname).toBeNull();
      expect(router.origin).toBe("");
      expect(router.host).toBe("");
    });
  });

  describe("state getter", () => {
    it("应返回当前状态", () => {
      expect(router.state).toEqual({
        pathname: "/",
        search: "",
        params: {},
        query: {},
        location: {},
      });
    });
  });

  describe("静态 parse 方法", () => {
    it("应解析相对路径", () => {
      const result = NavigatorCore.parse("/users/123");
      expect(result.pathname).toBe("/users/123");
      expect(result.query).toEqual({});
    });

    it("应解析带 query 的路径", () => {
      const result = NavigatorCore.parse("/users?id=123&name=test");
      expect(result.pathname).toBe("/users");
      expect(result.query).toEqual({ id: "123", name: "test" });
    });

    it("应解析绝对路径", () => {
      const result = NavigatorCore.parse("https://example.com/users?id=123");
      expect(result.pathname).toBe("/users");
      expect(result.query).toEqual({ id: "123" });
      expect(result.origin).toBe("https://example.com");
    });

    it("应处理 prefix", () => {
      NavigatorCore.prefix = "/app";
      const result = NavigatorCore.parse("/app/users/123");
      expect(result.pathname).toBe("/users/123");
    });
  });

  describe("prepare", () => {
    it("应设置初始状态", async () => {
      await router.prepare({
        host: "example.com",
        protocol: "https:",
        origin: "https://example.com",
        pathname: "/users",
        href: "https://example.com/users?id=123",
        search: "?id=123",
      });
      expect(router.pathname).toBe("/users");
      expect(router.query).toEqual({ id: "123" });
      expect(router.origin).toBe("https://example.com");
      expect(router.host).toBe("example.com");
    });
  });

  describe("start", () => {
    it("应初始化 histories", async () => {
      await router.prepare({
        host: "example.com",
        protocol: "https:",
        origin: "https://example.com",
        pathname: "/users",
        href: "https://example.com/users",
        search: "",
      });
      router.start();
      expect(router.histories).toEqual([
        { pathname: "/users", href: "/users" },
      ]);
    });
  });

  describe("pushState", () => {
    it("应添加到 histories", () => {
      router.origin = "https://example.com";
      router.pathname = "/";
      router.pushState("/users");
      expect(router.histories.length).toBe(1);
      expect(router.histories[0].pathname).toBe("/users");
      expect(router.pathname).toBe("/users");
    });

    it("应更新 prevPathname", () => {
      router.origin = "https://example.com";
      router.pathname = "/home";
      router.pushState("/users");
      expect(router.prevPathname).toBe("/home");
    });

    it("应触发 PushState 事件", () => {
      router.origin = "https://example.com";
      router.pathname = "/";
      const handler = vi.fn();
      router.onPushState(handler);
      router.pushState("/users");
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("replaceState", () => {
    it("应替换当前 history", () => {
      router.origin = "https://example.com";
      router.pathname = "/";
      router.histories = [{ pathname: "/", href: "/" }];
      router.replaceState("/users");
      expect(router.histories.length).toBe(1);
      expect(router.histories[0].pathname).toBe("/users");
    });

    it("应触发 ReplaceState 事件", () => {
      router.origin = "https://example.com";
      router.pathname = "/";
      router.histories = [{ pathname: "/", href: "/" }];
      const handler = vi.fn();
      router.onReplaceState(handler);
      router.replaceState("/users");
      expect(handler).toHaveBeenCalled();
    });
  });

  describe("handlePopState", () => {
    it("应处理 back 操作", () => {
      router.pathname = "/users";
      router.href = "/users";
      router.histories = [
        { pathname: "/", href: "/" },
        { pathname: "/users", href: "/users" },
      ];
      const handler = vi.fn();
      router.onBack(handler);
      router.handlePopState({
        type: "popstate",
        pathname: "/",
        href: "https://example.com/",
      });
      expect(handler).toHaveBeenCalled();
      expect(router.pathname).toBe("/");
    });

    it("应处理 forward 操作", () => {
      router.pathname = "/";
      router.href = "/";
      router.histories = [{ pathname: "/", href: "/" }];
      router.prevHistories = [{ pathname: "/users", href: "/users" }];
      const handler = vi.fn();
      router.onForward(handler);
      router.handlePopState({
        type: "popstate",
        pathname: "/users",
        href: "https://example.com/users",
      });
      expect(handler).toHaveBeenCalled();
      expect(router.pathname).toBe("/users");
    });
  });

  describe("事件监听", () => {
    it("onHistoriesChange 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = router.onHistoriesChange(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onPopState 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = router.onPopState(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onPathnameChange 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = router.onPathnameChange(handler);
      expect(typeof unlisten).toBe("function");
    });
  });
});
