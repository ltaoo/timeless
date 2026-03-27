import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { RouteViewCore } from "../index";

describe("RouteViewCore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("构造函数", () => {
    it("初始状态", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test Page",
      });
      expect(view.name).toBe("test");
      expect(view.pathname).toBe("/test");
      expect(view.title).toBe("Test Page");
      expect(view.query).toEqual({});
      expect(view.params).toEqual({});
      expect(view.parent).toBeNull();
      expect(view.curView).toBeNull();
      expect(view.subViews).toEqual([]);
      expect(view.mounted).toBe(true);
      expect(view.layered).toBe(false);
      expect(view.isRoot).toBe(false);
    });

    it("传入子视图时应设置子视图的 parent", () => {
      const child = new RouteViewCore({
        name: "child",
        pathname: "/child",
        title: "Child",
      });
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
        views: [child],
      });
      expect(parent.subViews).toContain(child);
      expect(child.parent).toBe(parent);
    });
  });

  describe("state getter", () => {
    it("应返回当前状态", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      expect(view.state).toEqual({
        mounted: true,
        visible: false,
        layered: false,
      });
    });
  });

  describe("href getter", () => {
    it("应返回 pathname", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      expect(view.href).toBe("/test");
    });

    it("应包含 query", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
        query: { id: "123", type: "user" },
      });
      expect(view.href).toContain("/test");
      expect(view.href).toContain("id=123");
      expect(view.href).toContain("type=user");
    });
  });

  describe("appendView", () => {
    it("应添加子视图", () => {
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
      });
      const child = new RouteViewCore({
        name: "child",
        pathname: "/child",
        title: "Child",
      });
      parent.appendView(child);
      expect(parent.subViews).toContain(child);
      expect(child.parent).toBe(parent);
    });

    it("应触发 SubViewAppended 事件", () => {
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
      });
      const child = new RouteViewCore({
        name: "child",
        pathname: "/child",
        title: "Child",
      });
      const handler = vi.fn();
      parent.onSubViewAppended(handler);
      parent.appendView(child);
      expect(handler).toHaveBeenCalledWith(child);
    });
  });

  describe("replaceViews", () => {
    it("应替换所有子视图", () => {
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
      });
      const child1 = new RouteViewCore({
        name: "child1",
        pathname: "/child1",
        title: "Child1",
      });
      const child2 = new RouteViewCore({
        name: "child2",
        pathname: "/child2",
        title: "Child2",
      });
      parent.appendView(child1);
      parent.replaceViews([child2]);
      expect(parent.subViews).toEqual([child2]);
    });
  });

  describe("removeView", () => {
    it("destroy=false 时应清除 curView", () => {
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
      });
      const child = new RouteViewCore({
        name: "child",
        pathname: "/child",
        title: "Child",
      });
      parent.appendView(child);
      parent.curView = child;
      parent.removeView(child, { destroy: false });
      expect(parent.curView).toBeNull();
    });
  });

  describe("findCurView", () => {
    it("无 curView 时应返回自身", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      expect(view.findCurView()).toBe(view);
    });

    it("有 curView 时应返回最深层的视图", () => {
      const grandchild = new RouteViewCore({
        name: "grandchild",
        pathname: "/grandchild",
        title: "Grandchild",
      });
      const child = new RouteViewCore({
        name: "child",
        pathname: "/child",
        title: "Child",
        views: [grandchild],
      });
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
        views: [child],
      });
      child.curView = grandchild;
      parent.curView = child;
      expect(parent.findCurView()).toBe(grandchild);
    });
  });

  describe("show/hide", () => {
    it("show 应使视图可见", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      expect(view.visible).toBe(false);
      view.show();
      expect(view.visible).toBe(true);
    });

    it("hide 应使视图不可见", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      view.show();
      expect(view.visible).toBe(true);
      view.hide();
      vi.advanceTimersByTime(200);
      expect(view.visible).toBe(false);
    });

    it("hide 应同时隐藏子视图", () => {
      const child = new RouteViewCore({
        name: "child",
        pathname: "/child",
        title: "Child",
      });
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
        views: [child],
      });
      parent.show();
      child.show();
      expect(child.visible).toBe(true);
      parent.hide();
      vi.advanceTimersByTime(200);
      expect(child.visible).toBe(false);
    });
  });

  describe("showView", () => {
    it("应显示指定的子视图", () => {
      const child1 = new RouteViewCore({
        name: "child1",
        pathname: "/child1",
        title: "Child1",
      });
      const child2 = new RouteViewCore({
        name: "child2",
        pathname: "/child2",
        title: "Child2",
      });
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
        views: [child1],
      });
      parent.show();
      parent.showView(child2);
      expect(parent.curView).toBe(child2);
      expect(child2.visible).toBe(true);
    });

    it("应隐藏旧的 curView", () => {
      const child1 = new RouteViewCore({
        name: "child1",
        pathname: "/child1",
        title: "Child1",
      });
      const child2 = new RouteViewCore({
        name: "child2",
        pathname: "/child2",
        title: "Child2",
      });
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
        views: [child1],
      });
      parent.show();
      child1.show();
      parent.showView(child2, { reason: "show_sibling" });
      vi.advanceTimersByTime(200);
      expect(child1.visible).toBe(false);
    });
  });

  describe("clearCurView", () => {
    it("应清除 curView", () => {
      const child = new RouteViewCore({
        name: "child",
        pathname: "/child",
        title: "Child",
      });
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
        views: [child],
      });
      parent.show();
      child.show();
      parent.clearCurView();
      expect(parent.curView).toBeNull();
    });

    it("无 curView 时不应报错", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      expect(() => view.clearCurView()).not.toThrow();
    });
  });

  describe("mount/unmount", () => {
    it("mount 应设置 mounted", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      view.mounted = false;
      view.mount();
      expect(view.mounted).toBe(true);
    });

    it("unmount 应清空 subViews", () => {
      const child = new RouteViewCore({
        name: "child",
        pathname: "/child",
        title: "Child",
      });
      const parent = new RouteViewCore({
        name: "parent",
        pathname: "/parent",
        title: "Parent",
        views: [child],
      });
      parent.show();
      parent.unmount();
      vi.advanceTimersByTime(200);
      expect(parent.subViews).toEqual([]);
    });
  });

  describe("setLoaded/setUnload", () => {
    it("setLoaded 应设置 loaded", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      expect(view.loaded).toBe(false);
      view.setLoaded();
      expect(view.loaded).toBe(true);
    });

    it("setUnload 应重置 loaded", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      view.setLoaded();
      view.setUnload();
      expect(view.loaded).toBe(false);
    });
  });

  describe("buildUrl", () => {
    it("应构建正确的 URL", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/users/:id",
        title: "Test",
        query: {},
      });
      view.params = { id: "123" };
      const url = view.buildUrl({ page: 1 });
      expect(url).toContain("/users/123");
      expect(url).toContain("page=1");
    });
  });

  describe("事件监听", () => {
    it("onStateChange 应注册监听器", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      const handler = vi.fn();
      const unlisten = view.onStateChange(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onReady 应注册监听器", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      const handler = vi.fn();
      const unlisten = view.onReady(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onMounted 应注册监听器", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      const handler = vi.fn();
      const unlisten = view.onMounted(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onSubViewsChange 应注册监听器", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      const handler = vi.fn();
      const unlisten = view.onSubViewsChange(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onCurViewChange 应注册监听器", () => {
      const view = new RouteViewCore({
        name: "test",
        pathname: "/test",
        title: "Test",
      });
      const handler = vi.fn();
      const unlisten = view.onCurViewChange(handler);
      expect(typeof unlisten).toBe("function");
    });
  });
});
