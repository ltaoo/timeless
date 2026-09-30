/**
 * @file Store 入口 —— Fluent 2 组件画廊
 */
import HomePageView from "@/pages/home/index.js";
import HomeGeneralView from "@/pages/home/index.general.js";
import HomeLayoutView from "@/pages/home/index.layout.js";
import HomeNavigationView from "@/pages/home/index.navigation.js";
import HomeDataEntryView from "@/pages/home/index.data_entry.js";
import HomeDataDisplayView from "@/pages/home/index.data_display.js";
import HomeFeedbackView from "@/pages/home/index.feedback.js";
import HomeExtensionView from "@/pages/home/index.extension.js";
import DesignSpecView from "@/pages/design/index.js";

Timeless.ui.ScrollViewPrimitive.setScrollViewProvider(Timeless.web);
Timeless.ui.InputPrimitive.setInputProvider(Timeless.web);
Timeless.ui.TextareaPrimitive.setTextareaProvider(Timeless.web);
Timeless.kit.NavigatorCore.prefix = "/";

// home 是**布局路由**（有 children → 自动 layout:true + defaultName=is_default 的子路由），
// 每个 antd 分类一个子路由页；「设计规范」从顶层并进来，与各分类同级。
// children 的 key 必须与 pages/home/categories.js 里的 homeRoute(key) 同名。
const routes_configure = /** @type {const} */ ({
  home: {
    title: "首页",
    pathname: "/home",
    component: HomePageView,
    children: {
      general: {
        is_default: true,
        title: "通用",
        pathname: "/home/general",
        component: HomeGeneralView,
      },
      layout: {
        title: "布局",
        pathname: "/home/layout",
        component: HomeLayoutView,
      },
      navigation: {
        title: "导航",
        pathname: "/home/navigation",
        component: HomeNavigationView,
      },
      data_entry: {
        title: "数据录入",
        pathname: "/home/data_entry",
        component: HomeDataEntryView,
      },
      data_display: {
        title: "数据展示",
        pathname: "/home/data_display",
        component: HomeDataDisplayView,
      },
      feedback: {
        title: "反馈",
        pathname: "/home/feedback",
        component: HomeFeedbackView,
      },
      extension: {
        title: "其他",
        pathname: "/home/extension",
        component: HomeExtensionView,
      },
      design: {
        title: "设计规范",
        pathname: "/home/design",
        component: DesignSpecView,
      },
    },
  },
});

const router = Timeless.kit.buildRoutes(routes_configure);
const routes = router.routes;
export const views = router.views;

export const storage$ = new Timeless.kit.StorageCore({
  key: "timeless-fluent",
  defaultValues: { theme: "light" },
  values: (() => {
    try {
      return JSON.parse(
        globalThis.localStorage.getItem("timeless-fluent") || "{}",
      );
    } catch {
      return {};
    }
  })(),
  client: globalThis.localStorage,
});

export const client$ = new Timeless.kit.HttpClientCore({
  headers: { "Content-Type": "application/json" },
});
Timeless.web.provide_http_client(client$);

export const router$ = new Timeless.kit.NavigatorCore();
export const view$ = new Timeless.kit.RouteViewCore({
  name: "root",
  pathname: "/",
  title: "ROOT",
  visible: true,
  parent: null,
  views: [],
});
view$.isRoot = true;
export const history$ = new Timeless.kit.HistoryCore({
  view: view$,
  router: router$,
  routes,
  views: { root: view$ },
});
Timeless.web.provide_history(history$);

export const app = new Timeless.kit.ApplicationModel({
  storage: storage$,
  async beforeReady() {
    // 支持深链：/home/data_entry、/home/design … 直接落到对应分类页。
    // push("root.home") 会自动重定向到 is_default 的子路由（root.home.general）。
    const { pathname, query } = router$;
    // routesWithPathname 挂在 buildRoutes 的返回值上（不是 NavigatorCore）。
    const route = router.routesWithPathname[pathname];
    if (!route) {
      history$.push("root.home", {}, { ignore: true });
      return Timeless.Result.Ok(null);
    }
    history$.push(route.name, query, { ignore: true });
    return Timeless.Result.Ok(null);
  },
});
// 挂载 app.setTheme / app.toggleTheme（provider-web 的 connect）。
Timeless.web.provide_app(app);

history$.onRouteChange(({ reason, view, href, ignore }) => {
  if (ignore) return;
  if (reason === "push") router$.pushState(String(href));
  if (reason === "replace") router$.replaceState(String(href));
});
