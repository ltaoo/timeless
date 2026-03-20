import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { HistoryCore } from "../index";
import { RouteViewCore } from "@/route_view";
import { NavigatorCore } from "@/navigator";
import { buildRoutes } from "@/route_view/utils";

/**
 * 模拟 article 页面的路由层级：
 *
 *   root
 *     home_layout              /home
 *       article                /article            (分类侧栏 + RouteSubViews)
 *         category             /article/category   (文章列表 + RouteSubViews)
 *           content            /article/category/detail  (文章详情)
 */

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

  const { routes, views } = buildRoutes(routesConfigure);
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
  const history = new HistoryCore({
    view: rootview,
    router,
    routes,
    views: { root: rootview } as any,
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

      history.push("root.home_layout.article.category" as any, {
        cate_id: "a",
      });

      const categoryView = findView(history, "root.home_layout.article.category");
      expect(categoryView).toBeDefined();
      expect(categoryView!.parent).toBeDefined();
      expect(categoryView!.parent!.name).toBe("root.home_layout.article");
      expect(categoryView!.query).toEqual({ cate_id: "a" });
    });

    it("push 时同时按 name 存储视图，后续 ensureParent 能找到", () => {
      const { history } = createTestEnv();

      // push category
      history.push("root.home_layout.article.category" as any, {
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
      history.push("root.home_layout.article.category" as any, {
        cate_id: "a",
      });

      // 2. replace content（模拟 ArticleListPageView 自动选中第一篇）
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "a",
        id: "1",
      });

      const contentView = findView(history, "root.home_layout.article.category.content");
      expect(contentView).toBeDefined();
      expect(contentView!.query).toEqual({ cate_id: "a", id: "1" });

      // content 的 parent 应是 category（通过 name 找到 push 时创建的那个）
      const categoryView = findView(history, "root.home_layout.article.category");
      expect(contentView!.parent).toBe(categoryView);
    });

    it("replace 不应该销毁被替换视图（父级可能被复用）", () => {
      const { history } = createTestEnv();

      history.push("root.home_layout.article.category" as any, {
        cate_id: "a",
      });

      const categoryView = findView(history, "root.home_layout.article.category")!;

      // replace content 不应 destroy category（category 是 content 的父级）
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "a",
        id: "1",
      });

      flushTimers(); // 即使定时器跑完

      // category 应该仍然存活
      const contentView = findView(history, "root.home_layout.article.category.content")!;
      expect(contentView.parent).toBe(categoryView);
      // category 的 subViews 应包含 content
      expect(categoryView.subViews).toContain(contentView);
    });
  });

  describe("切换分类后 back/forward", () => {
    function setupTwoCategories() {
      const { history, router } = createTestEnv();

      // 导航到分类 A
      history.push("root.home_layout.article.category" as any, { cate_id: "a" });
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const content1 = findView(history, "root.home_layout.article.category.content")!;

      // 导航到分类 B
      history.push("root.home_layout.article.category" as any, { cate_id: "b" });
      flushTimers();
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "b",
        id: "2",
      });
      flushTimers();

      const content2 = findView(history, "root.home_layout.article.category.content")!;

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
    it("push 叶路由时，中间路由获得正确的 query", () => {
      const { history } = createTestEnv();

      // 直接 push 到 content（跳过 category 的显式 push）
      history.push("root.home_layout.article.category.content" as any, {
        cate_id: "b",
        id: "2",
      });

      const categoryView = findView(history, "root.home_layout.article.category");
      expect(categoryView).toBeDefined();
      // 中间路由应通过 ensureParent 获得子路由的 query
      expect(categoryView!.query.cate_id).toBe("b");
    });

    it("已存在的父级在 ensureParent 时也会更新 query", () => {
      const { history } = createTestEnv();

      // 先 push category
      history.push("root.home_layout.article.category" as any, {
        cate_id: "a",
      });

      const categoryView = findView(history, "root.home_layout.article.category")!;
      expect(categoryView.query.cate_id).toBe("a");

      // 再 push content（ensureParent 会找到已有的 category 并更新其 query）
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "a",
        id: "1",
      });

      // category 的 query 应该被更新
      expect(categoryView.query).toEqual({ cate_id: "a", id: "1" });
    });
  });

  describe("多次切换分类并返回", () => {
    it("A → B → C → back → back → forward → forward", () => {
      const { history, router } = createTestEnv();

      // 导航到 A
      history.push("root.home_layout.article.category" as any, { cate_id: "a" });
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "a",
        id: "1",
      });
      flushTimers();
      const content_a = findView(history, "root.home_layout.article.category.content")!;

      // 导航到 B
      history.push("root.home_layout.article.category" as any, { cate_id: "b" });
      flushTimers();
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "b",
        id: "2",
      });
      flushTimers();
      const content_b = findView(history, "root.home_layout.article.category.content")!;

      // 导航到 C
      history.push("root.home_layout.article.category" as any, { cate_id: "c" });
      flushTimers();
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "c",
        id: "3",
      });
      flushTimers();
      const content_c = findView(history, "root.home_layout.article.category.content")!;

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

      history.push("root.home_layout.article.category" as any, { cate_id: "a" });
      flushTimers();

      const categoryView = findView(history, "root.home_layout.article.category")!;
      expect(categoryView.visible).toBe(true);
    });

    it("replace content 后 content 和 category 都应该 visible", () => {
      const { history } = createTestEnv();

      history.push("root.home_layout.article.category" as any, { cate_id: "a" });
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const categoryView = findView(history, "root.home_layout.article.category")!;
      const contentView = findView(history, "root.home_layout.article.category.content")!;

      expect(categoryView.visible).toBe(true);
      expect(contentView.visible).toBe(true);
      expect(contentView.parent).toBe(categoryView);
    });

    it("切换到分类 B 后，分类 A 的 category 应该不可见", () => {
      const { history } = createTestEnv();

      // A
      history.push("root.home_layout.article.category" as any, { cate_id: "a" });
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const categoryA = findView(history, "root.home_layout.article.category")!;

      // B
      history.push("root.home_layout.article.category" as any, { cate_id: "b" });
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

      const { routes, views } = buildRoutes(routesConfigure);
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
      const history = new HistoryCore({
        view: rootview,
        router,
        routes,
        views: { root: rootview } as any,
      });

      return { history, router, rootview, routes };
    }

    it("general → article → category/content → back(article) 应清除 article 的 curView", () => {
      const { history, router } = createEnvWithSibling();

      // 1. 导航到 general（默认首页）
      history.push("root.home_layout.index.general" as any, {});
      flushTimers();

      const generalView = findView(history, "root.home_layout.index.general")!;
      expect(generalView).toBeDefined();
      expect(generalView.visible).toBe(true);

      // 2. 点击 article 导航
      history.push("root.home_layout.article" as any, {});
      flushTimers();

      const articleView = findView(history, "root.home_layout.article")!;
      expect(articleView).toBeDefined();
      expect(articleView.visible).toBe(true);

      // 3. 点击分类 → push category
      history.push("root.home_layout.article.category" as any, { cate_id: "a" });
      flushTimers();

      const categoryView = findView(history, "root.home_layout.article.category")!;
      expect(categoryView).toBeDefined();
      expect(categoryView.visible).toBe(true);
      expect(articleView.curView).toBe(categoryView);

      // 4. 自动 replace content（模拟自动选中第一篇文章）
      history.replace("root.home_layout.article.category.content" as any, {
        cate_id: "a",
        id: "1",
      });
      flushTimers();

      const contentView = findView(history, "root.home_layout.article.category.content")!;
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
      history.push("root.home_layout.index.general" as any, {});
      flushTimers();
      const generalView = findView(history, "root.home_layout.index.general")!;

      // 2. article
      history.push("root.home_layout.article" as any, {});
      flushTimers();
      const articleView = findView(history, "root.home_layout.article")!;

      // 3. category + replace content
      history.push("root.home_layout.article.category" as any, { cate_id: "a" });
      history.replace("root.home_layout.article.category.content" as any, {
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
});
