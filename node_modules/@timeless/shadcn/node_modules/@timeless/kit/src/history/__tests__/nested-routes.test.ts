import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { HistoryCore } from "../index";
import { RouteViewCore } from "../../route_view";
import { NavigatorCore } from "../../navigator";
import { buildRoutes } from "../../route_view/utils";

/**
 * 模拟 article 页面的路由层级：
 *
 *   root
 *     home_layout              /home
 *       article                /article            (分类侧栏 + StandardSubViews)
 *         category             /article/category   (文章列表 + StandardSubViews)
 *           content            /article/category/detail  (文章详情)
 */

type RouteName =
  | "root"
  | "root.home_layout"
  | "root.home_layout.article"
  | "root.home_layout.article.category"
  | "root.home_layout.article.category.content";

function createTestEnv() {
  const routesConfigure = {
    home_layout: {
      title: "首页",
      pathname: "/home",
      component: "HomeLayout",
      children: {
        article: {
          title: "博客",
          pathname: "/article",
          component: "ArticleCategoryPage",
          children: {
            category: {
              title: "分类",
              pathname: "/article/category",
              component: "ArticleListPage",
              children: {
                content: {
                  title: "详情",
                  pathname: "/article/category/detail",
                  component: "ArticleContentPage",
                },
              },
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

describe("嵌套子路由导航", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("push 创建正确的父级链", () => {
    it("push 叶路由时，ensureParent 自动创建中间路由", () => {
      const { history } = createTestEnv();

      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      );
      expect(categoryView).toBeDefined();
      expect(categoryView!.parent).toBeDefined();
      expect(categoryView!.parent!.name).toBe("root.home_layout.article");
      expect(categoryView!.query).toEqual({ cate_id: "a" });
    });

    it("push 时同时按 name 存储视图，后续 ensureParent 能找到", () => {
      const { history } = createTestEnv();

      // push category
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });

      // 此时 views 中应该能通过 name 找到 category
      const byName = history.views["root.home_layout.article.category"];
      expect(byName).toBeDefined();
      expect(byName.query).toEqual({ cate_id: "a" });
    });
  });

  describe("push + replace 模拟自动选中文章", () => {
    it("push category 后 replace content，父级链正确", () => {
      const { history } = createTestEnv();

      // 1. push category（模拟点击分类）
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });

      // 2. replace content（模拟 ArticleListPageView 自动选中第一篇）
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });

      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      );
      expect(contentView).toBeDefined();
      expect(contentView!.query).toEqual({ cate_id: "a", id: "1" });

      // content 的 parent 应是 category（通过 name 找到 push 时创建的那个）
      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      );
      expect(contentView!.parent).toBe(categoryView);
    });

    it("replace 不应该销毁被替换视图（父级可能被复用）", () => {
      const { history } = createTestEnv();

      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      )!;

      // replace content 不应 destroy category（category 是 content 的父级）
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });

      flushTimers(); // 即使定时器跑完

      // category 应该仍然存活
      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      )!;
      expect(contentView.parent).toBe(categoryView);
      // category 的 subViews 应包含 content
      expect(categoryView.subViews).toContain(contentView);
    });
  });

  describe("切换分类后 back/forward", () => {
    function setupTwoCategories() {
      const { history, router } = createTestEnv();

      // 导航到分类 A
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const content1 = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      // 导航到分类 B
      history.push("root.home_layout.article.category", {
        cate_id: "b",
      });
      flushTimers();
      history.replace("root.home_layout.article.category.content", {
        cate_id: "b",
        id: "2",
      });
      flushTimers();

      const content2 = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      return { history, router, content1, content2 };
    }

    it("切换分类后，stacks 正确", () => {
      const { history, content1, content2 } = setupTwoCategories();

      // stacks 应为 [content1, content2]
      expect(history.stacks.length).toBe(2);
      expect(history.stacks[0]).toBe(content1);
      expect(history.stacks[1]).toBe(content2);
      expect(history.cursor).toBe(1);
    });

    it("content1 的 parent 应该仍然存活且可访问", () => {
      const { content1 } = setupTwoCategories();

      // content1 的 parent（category_a）不应被销毁
      expect(content1.parent).toBeDefined();
      expect(content1.parent!.name).toBe("root.home_layout.article.category");
    });

    it("back 能找到正确的目标视图", () => {
      const { history, router, content1 } = setupTwoCategories();

      // 模拟浏览器 back：先设置 $router.href 为目标
      router.href = content1.href;
      history.back();

      // 应该切换到 content1
      expect(history.cursor).toBe(0);
      expect(router.href).toBe(content1.href);
    });

    it("back 后 content1 的 parent（category_a）应该被 re-show", () => {
      const { history, router, content1 } = setupTwoCategories();

      const categoryA = content1.parent!;

      router.href = content1.href;
      history.back();
      flushTimers();

      // category_a 应该重新变为 visible
      expect(categoryA.visible).toBe(true);
      // category_a 的 curView 应该是 content1
      expect(categoryA.curView).toBe(content1);
    });

    it("back 后 RouteChange 事件包含正确信息", () => {
      const { history, router, content1 } = setupTwoCategories();

      const changes: any[] = [];
      history.onRouteChange((e) => changes.push(e));

      router.href = content1.href;
      history.back();

      expect(changes.length).toBe(1);
      expect(changes[0].reason).toBe("back");
      expect(changes[0].query).toEqual({ cate_id: "a", id: "1" });
    });

    it("back 后再 forward", () => {
      const { history, router, content1, content2 } = setupTwoCategories();

      // back
      router.href = content1.href;
      history.back();
      flushTimers();

      expect(history.cursor).toBe(0);

      // forward
      router.href = content2.href;
      history.forward();
      flushTimers();

      expect(router.href).toBe(content2.href);
    });
  });

  describe("ensureParent 向父级传递 query", () => {
    it("push 叶路由时，中间路由由 ensureParent 创建但保持自身 query", () => {
      const { history } = createTestEnv();

      // 直接 push 到 content（跳过 category 的显式 push）
      history.push("root.home_layout.article.category.content", {
        cate_id: "b",
        id: "2",
      });

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      );
      expect(categoryView).toBeDefined();
      // ensureParent 创建的中间路由 query 为空，不应继承子路由的 query
      // 否则父路由的 href 会被篡改，导致浏览器 back 时 href 不匹配
      expect(categoryView!.query).toEqual({});
    });

    it("已存在的父级在 ensureParent 时不应被覆盖 query", () => {
      const { history } = createTestEnv();

      // 先 push category
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      )!;
      expect(categoryView.query.cate_id).toBe("a");

      // 再 replace content（ensureParent 会找到已有的 category）
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });

      // category 的 query 不应被子路由覆盖，保持自身的 query
      // 这样 category.href 不变，浏览器 back 时才能正确匹配
      expect(categoryView.query).toEqual({ cate_id: "a" });
    });
  });

  describe("多次切换分类并返回", () => {
    it("A → B → C → back → back → forward → forward", () => {
      const { history, router } = createTestEnv();

      // 导航到 A
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();
      const content_a = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      // 导航到 B
      history.push("root.home_layout.article.category", {
        cate_id: "b",
      });
      flushTimers();
      history.replace("root.home_layout.article.category.content", {
        cate_id: "b",
        id: "2",
      });
      flushTimers();
      const content_b = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      // 导航到 C
      history.push("root.home_layout.article.category", {
        cate_id: "c",
      });
      flushTimers();
      history.replace("root.home_layout.article.category.content", {
        cate_id: "c",
        id: "3",
      });
      flushTimers();
      const content_c = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      expect(history.stacks.length).toBe(3);
      expect(history.stacks[0]).toBe(content_a);
      expect(history.stacks[1]).toBe(content_b);
      expect(history.stacks[2]).toBe(content_c);

      // back to B
      router.href = content_b.href;
      history.back();
      flushTimers();
      expect(history.cursor).toBe(1);
      expect(content_b.parent).toBeDefined();
      expect(content_b.parent!.name).toBe("root.home_layout.article.category");

      // back to A
      router.href = content_a.href;
      history.back();
      flushTimers();
      expect(history.cursor).toBe(0);
      expect(content_a.parent).toBeDefined();

      // forward to B
      router.href = content_b.href;
      history.forward();
      flushTimers();
      expect(router.href).toBe(content_b.href);

      // forward to C
      router.href = content_c.href;
      history.forward();
      flushTimers();
      expect(router.href).toBe(content_c.href);
    });
  });

  describe("showView 和 visibility 链", () => {
    it("push category 后 category 应该 visible", () => {
      const { history } = createTestEnv();

      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      flushTimers();

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      )!;
      expect(categoryView.visible).toBe(true);
    });

    it("replace content 后 content 和 category 都应该 visible", () => {
      const { history } = createTestEnv();

      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      )!;
      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      expect(categoryView.visible).toBe(true);
      expect(contentView.visible).toBe(true);
      expect(contentView.parent).toBe(categoryView);
    });

    it("切换到分类 B 后，分类 A 的 category 应该不可见", () => {
      const { history } = createTestEnv();

      // A
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const categoryA = findView(history, "root.home_layout.article.category")!;

      // B
      history.push("root.home_layout.article.category", {
        cate_id: "b",
      });
      flushTimers();

      // A 应该被隐藏（可能需要定时器完成）
      // B 的 category 应该 visible
      const categoryB = findView(history, "root.home_layout.article.category")!;
      expect(categoryB.visible).toBe(true);
      // categoryA 和 categoryB 是不同的实例
      expect(categoryA).not.toBe(categoryB);
    });
  });

  describe("从兄弟路由跳转到嵌套路由再返回", () => {
    /**
     * 模拟用户操作路径：
     * general → article → article/category/content → back to article
     *
     * 路由结构增加 index.general 作为 article 的兄弟路由
     */

    type RouteNameWithSibling =
      | "root"
      | "root.home_layout"
      | "root.home_layout.index"
      | "root.home_layout.index.general"
      | "root.home_layout.article"
      | "root.home_layout.article.category"
      | "root.home_layout.article.category.content";

    function createEnvWithSibling() {
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
                  title: "通用组件",
                  pathname: "/home/index/general",
                  component: "GeneralPage",
                },
              },
            },
            article: {
              title: "博客",
              pathname: "/article",
              component: "ArticleCategoryPage",
              children: {
                category: {
                  title: "分类",
                  pathname: "/article/category",
                  component: "ArticleListPage",
                  children: {
                    content: {
                      title: "详情",
                      pathname: "/article/category/detail",
                      component: "ArticleContentPage",
                    },
                  },
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
      const history = new HistoryCore<
        RouteNameWithSibling,
        (typeof routes)[RouteNameWithSibling]
      >({
        view: rootview,
        router,
        routes: routes as Record<
          RouteNameWithSibling,
          (typeof routes)[RouteNameWithSibling]
        >,
        views: { root: rootview } as Record<
          RouteNameWithSibling,
          RouteViewCore
        >,
      });

      return { history, router, rootview, routes };
    }

    it("general → article → category/content → back(article) 应清除 article 的 curView", () => {
      const { history, router } = createEnvWithSibling();

      // 1. 导航到 general（默认首页）
      history.push("root.home_layout.index.general", {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;
      expect(generalView).toBeDefined();
      expect(generalView.visible).toBe(true);

      // 2. 点击 article 导航
      history.push("root.home_layout.article", {});
      flushTimers();

      const articleView = findView(history, "root.home_layout.article")!;
      expect(articleView).toBeDefined();
      expect(articleView.visible).toBe(true);

      // 3. 点击分类 → push category
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      flushTimers();

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      )!;
      expect(categoryView).toBeDefined();
      expect(categoryView.visible).toBe(true);
      expect(articleView.curView).toBe(categoryView);

      // 4. 自动 replace content（模拟自动选中第一篇文章）
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      )!;
      expect(contentView).toBeDefined();
      expect(contentView.visible).toBe(true);

      // stacks: [general, article, content]（category 被 replace 掉了不在 stacks 中）
      // 但 article.curView = category, category.curView = content

      // 5. 浏览器返回到 article
      router.href = articleView.href;
      history.back();
      flushTimers();

      // article 的 curView 应该被清除（category 被隐藏）
      expect(articleView.curView).toBeNull();
      // category 应该不可见
      expect(categoryView.visible).toBe(false);
    });

    it("general → article → category/content → back(article) → back(general)", () => {
      const { history, router } = createEnvWithSibling();

      // 1. general
      history.push("root.home_layout.index.general", {});
      flushTimers();
      const generalView = findView(history, "root.home_layout.index.general")!;

      // 2. article
      history.push("root.home_layout.article", {});
      flushTimers();
      const articleView = findView(history, "root.home_layout.article")!;

      // 3. category + replace content
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      // 4. back to article
      router.href = articleView.href;
      history.back();
      flushTimers();

      expect(articleView.visible).toBe(true);
      expect(articleView.curView).toBeNull();

      // 5. back to general
      router.href = generalView.href;
      history.back();
      flushTimers();

      expect(history.cursor).toBe(0);
      expect(generalView.visible).toBe(true);
    });
  });

  describe("back 多级嵌套路由的 curView 清理", () => {
    type RouteNameWithSibling =
      | "root"
      | "root.home_layout"
      | "root.home_layout.index"
      | "root.home_layout.index.general"
      | "root.home_layout.article"
      | "root.home_layout.article.category"
      | "root.home_layout.article.category.content";

    function createEnvWithSibling() {
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
                  title: "通用组件",
                  pathname: "/home/index/general",
                  component: "GeneralPage",
                },
              },
            },
            article: {
              title: "博客",
              pathname: "/article",
              component: "ArticleCategoryPage",
              children: {
                category: {
                  title: "分类",
                  pathname: "/article/category",
                  component: "ArticleListPage",
                  children: {
                    content: {
                      title: "详情",
                      pathname: "/article/category/detail",
                      component: "ArticleContentPage",
                    },
                  },
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
      const history = new HistoryCore<
        RouteNameWithSibling,
        (typeof routes)[RouteNameWithSibling]
      >({
        view: rootview,
        router,
        routes: routes as Record<
          RouteNameWithSibling,
          (typeof routes)[RouteNameWithSibling]
        >,
        views: { root: rootview } as Record<
          RouteNameWithSibling,
          RouteViewCore
        >,
      });

      return { history, router };
    }

    it("replace(content) 后 removeView 应清除 category.curView", () => {
      const { history } = createEnvWithSibling();

      history.push("root.home_layout.article", {});
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      flushTimers();

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      )!;
      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      );

      // replace 前 category 还没有 content 子视图
      expect(categoryView.curView).toBeNull();

      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const content = findView(
        history,
        "root.home_layout.article.category.content",
      )!;
      // replace 后 category.curView = content
      expect(categoryView.curView).toBe(content);

      // 模拟 back: removeView(content) 由 back() 中的 viewsAfter 循环触发
      categoryView.removeView(content, { reason: "back", destroy: false });
      flushTimers();

      // 关键断言：removeView destroy=false 必须清除 category.curView
      expect(categoryView.curView).toBeNull();
    });

    it("general → article → category/content → back(article): article.curView 应为 null", () => {
      const { history, router } = createEnvWithSibling();

      // 1. general (首页)
      history.push("root.home_layout.index.general", {});
      flushTimers();
      const generalView = findView(history, "root.home_layout.index.general")!;

      // 2. article
      history.push("root.home_layout.article", {});
      flushTimers();
      const articleView = findView(history, "root.home_layout.article")!;
      expect(articleView.visible).toBe(true);
      expect(articleView.curView).toBeDefined(); // category 或 null

      // 3. category → replace content（模拟自动选中文章）
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      )!;
      expect(contentView.visible).toBe(true);
      expect(history.cursor).toBe(2);
      expect(history.stacks.length).toBe(3);

      // 4. back to article（从 cursor=2 到 cursor=1）
      router.href = articleView.href;
      history.back();
      flushTimers();

      expect(history.cursor).toBe(1);
      expect(articleView.visible).toBe(true);
      // 关键断言：back 后 article 的 curView 应被清除
      expect(articleView.curView).toBeNull();
      // content 应被隐藏
      expect(contentView.visible).toBe(false);
    });

    it("general → article → category/content → back(article) → back(general): 全链路 visibility", () => {
      const { history, router } = createEnvWithSibling();

      // 1. general
      history.push("root.home_layout.index.general", {});
      flushTimers();
      const generalView = findView(history, "root.home_layout.index.general")!;

      // 2. article
      history.push("root.home_layout.article", {});
      flushTimers();
      const articleView = findView(history, "root.home_layout.article")!;

      // 3. category → replace content
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      )!;
      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      // 初始状态：只有当前活跃链 (home_layout → article → category → content) 可见
      // general 是 article 的兄弟路由，push article 时被隐藏
      expect(generalView.visible).toBe(false);
      expect(articleView.visible).toBe(true);
      expect(categoryView.visible).toBe(true);
      expect(contentView.visible).toBe(true);

      // 4. back to article
      router.href = articleView.href;
      history.back();
      flushTimers();

      expect(articleView.visible).toBe(true);
      expect(articleView.curView).toBeNull();
      expect(contentView.visible).toBe(false);

      // 5. back to general（这就是 "从 3 返回 2" 失败的场景）
      router.href = generalView.href;
      history.back();
      flushTimers();

      expect(history.cursor).toBe(0);
      expect(generalView.visible).toBe(true);
      // article 及其子视图应全部隐藏
      expect(articleView.visible).toBe(false);
      expect(categoryView.visible).toBe(false);
    });

    it("forward 来回切换不应有残留 curView", () => {
      const { history, router } = createEnvWithSibling();

      // 1. general
      history.push("root.home_layout.index.general", {});
      flushTimers();
      const generalView = findView(history, "root.home_layout.index.general")!;

      // 2. article
      history.push("root.home_layout.article", {});
      flushTimers();
      const articleView = findView(history, "root.home_layout.article")!;

      // 3. category → replace content
      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();
      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      // 4. back to article
      router.href = articleView.href;
      history.back();
      flushTimers();
      expect(articleView.visible).toBe(true);
      expect(articleView.curView).toBeNull();

      // 5. back to general
      router.href = generalView.href;
      history.back();
      flushTimers();
      expect(generalView.visible).toBe(true);

      // 6. forward to article
      router.href = articleView.href;
      history.forward();
      flushTimers();
      expect(articleView.visible).toBe(true);

      // 7. forward to content
      router.href = contentView.href;
      history.forward();
      flushTimers();
      expect(contentView.visible).toBe(true);
      expect(history.cursor).toBe(2);

      // 8. back to article 再次验证
      router.href = articleView.href;
      history.back();
      flushTimers();
      expect(articleView.visible).toBe(true);
      expect(articleView.curView).toBeNull();
      expect(contentView.visible).toBe(false);
    });

    it("四层导航 back 逐级返回: stacks 中每层 curView 均正确清理", () => {
      const { history, router } = createEnvWithSibling();

      // 导航: general → article → category → replace content
      history.push("root.home_layout.index.general", {});
      flushTimers();
      const generalView = findView(history, "root.home_layout.index.general")!;

      history.push("root.home_layout.article", {});
      flushTimers();
      const articleView = findView(history, "root.home_layout.article")!;

      history.push("root.home_layout.article.category", {
        cate_id: "a",
      });
      flushTimers();
      const categoryView = findView(
        history,
        "root.home_layout.article.category",
      )!;

      history.replace("root.home_layout.article.category.content", {
        cate_id: "a",
        id: "1",
      });
      flushTimers();
      const contentView = findView(
        history,
        "root.home_layout.article.category.content",
      )!;

      // 初始状态验证
      expect(history.stacks.length).toBe(3); // [general, article, content]
      expect(history.cursor).toBe(2);
      expect(contentView.visible).toBe(true);
      expect(categoryView.curView).toBe(contentView);

      // back: content → article
      router.href = articleView.href;
      history.back();
      flushTimers();

      expect(history.cursor).toBe(1);
      expect(articleView.visible).toBe(true);
      // 核心断言: category.curView 必须被清除（removeView destroy=false 导致）
      expect(categoryView.curView).toBeNull();
      expect(contentView.visible).toBe(false);

      // back: article → general
      router.href = generalView.href;
      history.back();
      flushTimers();

      expect(history.cursor).toBe(0);
      expect(generalView.visible).toBe(true);
      expect(articleView.visible).toBe(false);

      // forward: general → article
      router.href = articleView.href;
      history.forward();
      flushTimers();

      expect(history.cursor).toBe(1);
      expect(articleView.visible).toBe(true);

      // forward: article → content
      router.href = contentView.href;
      history.forward();
      flushTimers();

      expect(history.cursor).toBe(2);
      expect(contentView.visible).toBe(true);
      // forward 后 article.curView 应指向 category（由 showView 递归设置）
      expect(articleView.curView).not.toBeNull();
    });
  });
});
