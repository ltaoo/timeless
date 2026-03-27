import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { HistoryCore } from "../index";
import { RouteViewCore } from "../../route_view";
import { NavigatorCore } from "../../navigator";
import { buildRoutes } from "../../route_view/utils";

/**
 * 测试 back/forward 时浏览器 URL 同步功能
 *
 * 设计原则：
 * - handlePopState 只处理浏览器的 popstate 事件，emit PopState 事件
 * - Back/Forward 事件只在用户主动调用 history.back()/forward() 时 emit
 * - _isPopState 标记用于区分 popstate 触发和用户主动调用
 */

type RouteName =
  | "root"
  | "root.home_layout"
  | "root.home_layout.index"
  | "root.home_layout.index.general"
  | "root.home_layout.index.form";

function createTestEnv() {
  const routesConfigure = {
    home_layout: {
      title: "首页",
      pathname: "/home",
      component: "HomeLayout",
      children: {
        index: {
          title: "组件库",
          pathname: "/home/index",
          component: "HomeIndexPage",
          children: {
            general: {
              default: true,
              title: "通用组件",
              pathname: "/home/index/general",
              component: "GeneralPage",
            },
            form: {
              title: "表单组件",
              pathname: "/home/index/form",
              component: "FormPage",
            },
          },
        },
      },
    },
  };

  const { routes } = buildRoutes(routesConfigure);
  const router = new NavigatorCore();
  const rootview = new RouteViewCore({
    name: "root",
    pathname: "/",
    title: "ROOT",
    visible: true,
    parent: null,
    views: [],
  });
  rootview.isRoot = true;
  const history = new HistoryCore<RouteName, (typeof routes)[RouteName]>({
    view: rootview,
    router,
    routes: routes as Record<RouteName, (typeof routes)[RouteName]>,
    views: { root: rootview } as Record<RouteName, RouteViewCore>,
  });

  return { history, router, rootview, routes };
}

/** 跑完所有 PresenceCore 的 150ms 定时器 */
function flushTimers() {
  vi.advanceTimersByTime(200);
}

// ─── 辅助：查找某 name 对应的 RouteViewCore ───
function findView(history: HistoryCore<any, any>, name: string) {
  return history.views[name] as RouteViewCore | undefined;
}

describe("back/forward 浏览器 URL 同步", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("_isPopState 标记防止循环调用", () => {
    it("back() 应该触发 router.back() 事件（非 popstate 触发时）", () => {
      const { history, router } = createTestEnv();

      // 导航到 general 和 form
      history.push("root.home_layout.index.general", {});
      history.push("root.home_layout.index.form", {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;
      const formView = findView(history, "root.home_layout.index.form")!;

      expect(history.cursor).toBe(1);
      expect(router.href).toBe(formView.href);

      // 监听 NavigatorCore.Back 事件
      const backEvents: any[] = [];
      router.onBack(() => backEvents.push({}));

      // 非 popstate 触发的 back() 应该 emit Back 事件
      router.href = generalView.href;
      history.back();
      flushTimers();

      expect(backEvents.length).toBe(1);
      expect(history.cursor).toBe(0);
      expect(router.href).toBe(generalView.href);
    });

    it("设置 _isPopState=true 后 back() 不应该触发 router.back()", () => {
      const { history, router } = createTestEnv();

      // 导航到 general 和 form
      history.push("root.home_layout.index.general", {});
      history.push("root.home_layout.index.form", {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;
      const formView = findView(history, "root.home_layout.index.form")!;

      expect(history.cursor).toBe(1);

      // 监听 NavigatorCore.Back 事件
      const backEvents: any[] = [];
      router.onBack(() => backEvents.push({}));

      // 模拟 popstate 触发的 back()
      router.href = generalView.href;
      history._isPopState = true;
      history.back();
      flushTimers();

      // _isPopState=true 时不应该 emit Back 事件
      expect(backEvents.length).toBe(0);
      expect(history.cursor).toBe(0);
      expect(router.href).toBe(generalView.href);

      // _isPopState 应该被重置为 false
      expect(history._isPopState).toBe(false);
    });

    it("forward() 应该触发 router.forward() 事件（非 popstate 触发时）", () => {
      const { history, router } = createTestEnv();

      // 导航到 general 和 form
      history.push("root.home_layout.index.general", {});
      history.push("root.home_layout.index.form", {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;
      const formView = findView(history, "root.home_layout.index.form")!;

      // 先 back 到 general
      router.href = generalView.href;
      history.back();
      flushTimers();
      expect(history.cursor).toBe(0);

      // 监听 NavigatorCore.Forward 事件
      const forwardEvents: any[] = [];
      router.onForward(() => forwardEvents.push({}));

      // 非 popstate 触发的 forward() 应该 emit Forward 事件
      router.href = formView.href;
      history.forward();
      flushTimers();

      expect(forwardEvents.length).toBe(1);
      expect(history.cursor).toBe(1);
      expect(router.href).toBe(formView.href);
    });

    it("设置 _isPopState=true 后 forward() 不应该触发 router.forward()", () => {
      const { history, router } = createTestEnv();

      // 导航到 general 和 form
      history.push("root.home_layout.index.general", {});
      history.push("root.home_layout.index.form", {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;
      const formView = findView(history, "root.home_layout.index.form")!;

      // 先 back 到 general
      router.href = generalView.href;
      history.back();
      flushTimers();
      expect(history.cursor).toBe(0);

      // 监听 NavigatorCore.Forward 事件
      const forwardEvents: any[] = [];
      router.onForward(() => forwardEvents.push({}));

      // 模拟 popstate 触发的 forward()
      router.href = formView.href;
      history._isPopState = true;
      history.forward();
      flushTimers();

      // _isPopState=true 时不应该 emit Forward 事件
      expect(forwardEvents.length).toBe(0);
      expect(history.cursor).toBe(1);
      expect(router.href).toBe(formView.href);

      // _isPopState 应该被重置为 false
      expect(history._isPopState).toBe(false);
    });
  });

  describe("多次 back 不应产生循环", () => {
    it("连续 back 多次，每次 cursor 只减少 1", () => {
      const { history, router } = createTestEnv();

      // 导航到 3 个页面
      history.push("root.home_layout.index.general", {});
      history.push("root.home_layout.index.form", {});
      history.push("root.home_layout.index.general", { tab: "2" });
      flushTimers();

      expect(history.cursor).toBe(2);
      expect(history.stacks.length).toBe(3);

      const view0 = history.stacks[0];
      const view1 = history.stacks[1];
      const view2 = history.stacks[2];

      // 第一次 back
      router.href = view1.href;
      history._isPopState = true;
      history.back();
      flushTimers();
      expect(history.cursor).toBe(1);

      // 第二次 back
      router.href = view0.href;
      history._isPopState = true;
      history.back();
      flushTimers();
      expect(history.cursor).toBe(0);

      // 第三次 back（已经在栈底，应该不生效）
      history._isPopState = true;
      history.back();
      flushTimers();
      expect(history.cursor).toBe(0); // 保持不变
    });
  });

  describe("popstate 触发的 back/forward 流程", () => {
    it("模拟 popstate 触发的完整流程：handlePopState → PopState 事件 → _isPopState=true → back()", () => {
      const { history, router } = createTestEnv();

      // 导航到 general 和 form
      history.push("root.home_layout.index.general", {});
      history.push("root.home_layout.index.form", {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;
      const formView = findView(history, "root.home_layout.index.form")!;

      expect(history.cursor).toBe(1);
      expect(router.href).toBe(formView.href);

      // 监听 NavigatorCore.Back 事件
      const backEvents: any[] = [];
      router.onBack(() => backEvents.push({}));

      // 监听 NavigatorCore.PopState 事件
      const popStateEvents: any[] = [];
      router.onPopState(() => popStateEvents.push({}));

      // 模拟浏览器 popstate 触发
      router.handlePopState({
        type: "popstate",
        pathname: generalView.href,
        href: generalView.href,
      });

      // 模拟 provider-web 的 onPopState 回调
      history._isPopState = true;
      history.back();
      flushTimers();

      // 验证：cursor 应该减少 1
      expect(history.cursor).toBe(0);
      expect(router.href).toBe(generalView.href);

      // 验证：handlePopState 只 emit PopState，不 emit Back
      // 所以 backEvents 应该只有 1 次（来自 history.back()）
      expect(backEvents.length).toBe(1);
      expect(popStateEvents.length).toBe(1);
    });
  });

  describe("onRouteChange 事件在 back/forward 时正确触发", () => {
    it("back() 应该触发 onRouteChange 事件，reason 为 'back'", () => {
      const { history, router } = createTestEnv();

      // 导航到 general 和 form
      history.push("root.home_layout.index.general", {});
      history.push("root.home_layout.index.form", {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;

      // 监听 RouteChange 事件
      const routeChanges: any[] = [];
      history.onRouteChange((e) => routeChanges.push(e));

      // back
      router.href = generalView.href;
      history.back();
      flushTimers();

      expect(routeChanges.length).toBe(1);
      expect(routeChanges[0].reason).toBe("back");
      expect(routeChanges[0].href).toBe(generalView.href);
    });

    it("forward() 应该触发 onRouteChange 事件，reason 为 'forward'", () => {
      const { history, router } = createTestEnv();

      // 导航到 general 和 form
      history.push("root.home_layout.index.general", {});
      history.push("root.home_layout.index.form", {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;
      const formView = findView(history, "root.home_layout.index.form")!;

      // 先 back 到 general
      router.href = generalView.href;
      history.back();
      flushTimers();

      // 监听 RouteChange 事件
      const routeChanges: any[] = [];
      history.onRouteChange((e) => routeChanges.push(e));

      // forward
      router.href = formView.href;
      history.forward();
      flushTimers();

      expect(routeChanges.length).toBe(1);
      expect(routeChanges[0].reason).toBe("forward");
      expect(routeChanges[0].href).toBe(formView.href);
    });
  });
});
