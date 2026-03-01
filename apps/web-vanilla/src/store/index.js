/**
 * @file Store 入口 - 路由管理
 */
import LoginPage from "@/pages/login/index.js";
import NotFoundPageView from "@/pages/notfound/index.js";
import HomeLayoutView from "@/pages/home/layout.js";
import HomeIndexPageView from "@/pages/home/index.js";
import HomeIndexGeneralView from "@/pages/home/index.general.js";

const routesConfigure = {
  home_layout: {
    title: "首页",
    pathname: "/home",
    component: HomeLayoutView,
    children: {
      index: {
        title: "组件库",
        pathname: "/home/index",
        component: HomeIndexPageView,
        children: {
          general: {
            default: true,
            title: "通用组件",
            pathname: "/home/index/general",
            component: HomeIndexGeneralView,
          },
          form: {
            title: "表单组件",
            pathname: "/home/index/form",
            component: lazy("@/pages/home/index.form.js"),
          },
          data: {
            title: "数据展示组件",
            pathname: "/home/index/data",
            component: lazy("@/pages/home/index.data.js"),
          },
          feedback: {
            title: "反馈组件",
            pathname: "/home/index/feedback",
            component: lazy("@/pages/home/index.feedback.js"),
          },
          nav: {
            title: "导航组件",
            pathname: "/home/index/nav",
            component: lazy("@/pages/home/index.nav.js"),
          },
          overlay: {
            title: "浮层组件",
            pathname: "/home/index/overlay",
            component: lazy("@/pages/home/index.overlay.js"),
          },
        },
      },
      settings: {
        title: "设置",
        pathname: "/settings",
        component: lazy("@/pages/settings/index.js"),
      },
    },
    options: {
      require: [],
    },
  },
  login: {
    title: "登录",
    pathname: "/login",
    component: LoginPage,
  },
  notfound: {
    title: "404",
    pathname: "/notfound",
    component: NotFoundPageView,
    notfound: true,
  },
};

const {
  routes,
  routesWithPathname,
  views: generatedViews,
  defaultRouteName: generatedDefaultRouteName,
  notfoundRouteName: generatedNotfoundRouteName,
} = Timeless.buildRoutes(routesConfigure);

export const views = generatedViews;
export const defaultRouteName = generatedDefaultRouteName;
export const notfoundRouteName = generatedNotfoundRouteName;

// LocalStorage
const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    email: "",
    token: "",
    avatar: "",
  },
  theme: "system",
};
const key = "timeless";
const e = globalThis.localStorage.getItem(key);
export const storage = new Timeless.StorageCore({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: (() => {
    const prev = JSON.parse(e || "{}");
    return {
      ...prev,
    };
  })(),
  client: globalThis.localStorage,
});
// HttpClient
export const client = new Timeless.HttpClientCore({
  headers: {
    "Content-Type": "application/json",
  },
});
Timeless.web.provide_http_client(client);
export const user = /** @type {any} */ ({});
// History
Timeless.NavigatorCore.prefix = "/timeless";
export const router = new Timeless.NavigatorCore();
export const rootview = new Timeless.RouteViewCore({
  name: "root",
  pathname: "/",
  title: "ROOT",
  visible: true,
  parent: null,
  views: [],
});
rootview.isRoot = true;
export const history = new Timeless.HistoryCore({
  view: rootview,
  router,
  routes,
  views: {
    root: rootview,
  },
});
Timeless.web.provide_history(history);

export const app = new Timeless.ApplicationModel({
  user,
  storage,
  async beforeReady() {
    const { pathname, query } = router;
    const route = routesWithPathname[pathname];
    console.log("[Store] beforeReady", pathname, route, routesWithPathname);
    if (!route) {
      history.push(notfoundRouteName, { replace: true });
      return Timeless.Result.Err("not found");
    }
    // if (!route.options?.require?.includes("login")) {
    //   if (!history.isLayout(route.name)) {
    //     console.log("[Store] beforeReady push to fallback route", route.name);
    //     history.push(route.name, query, { ignore: true });
    //     return Timeless.Result.Ok(null);
    //   }
    //   return Timeless.Result.Err("can't goto layout");
    // }
    // if (!user.isLogin) {
    //   app.tip?.({ text: ["请先登录"] });
    //   history.push("root.login", { redirect: route.pathname });
    //   return Timeless.Result.Err("need login");
    // }
    if (!history.isLayout(route.name)) {
      history.push(route.name, query, { ignore: true });
      return Timeless.Result.Ok(null);
    }
    history.push(defaultRouteName, {}, { ignore: true });
    return Timeless.Result.Ok(null);
  },
});
Timeless.web.provide_app(app);

history.onRouteChange(({ reason, view, href, ignore }) => {
  const { title } = view || {};
  if (title) {
    app.setTitle(title);
  }
  if (ignore) {
    return;
  }
  if (reason === "push") {
    router.pushState(href);
  }
  if (reason === "replace") {
    router.replaceState(href);
  }
});
history.onClickLink(({ href, target }) => {
  const { pathname, query } = Timeless.NavigatorCore.parse(href);
  const route = routesWithPathname[pathname];
  if (!route) {
    app.tip?.({ text: ["没有匹配的页面"] });
    return;
  }
  if (target === "_blank") {
    window.open(href);
    return;
  }
  history.push(route.name, query);
});
