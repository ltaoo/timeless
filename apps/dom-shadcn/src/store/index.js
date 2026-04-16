/**
 * @file Store 入口 - 路由管理
 */
import { refobj, Result } from "@timeless/timeless";
import {
  buildRoutes,
  HttpClientCore,
  NavigatorCore,
  StorageCore,
  RouteViewCore,
  HistoryCore,
  ClipboardModel,
  ApplicationModel,
} from "@timeless/kit";
import {
  InputPrimitive,
  ScrollViewPrimitive,
  TextareaPrimitive,
} from "@timeless/shadcn";
import * as web from "@timeless/provider-web";

import HomeLayoutView from "@/pages/home/layout.js";
import HomeIndexPageView from "@/pages/home/index.js";
import HomeIndexGeneralView from "@/pages/home/index.general.js";
import AdminLayoutView from "@/pages/admin/layout.js";
import AdminDashboardView from "@/pages/admin/dashboard.js";
import NotFoundPageView from "@/pages/notfound/index.js";
import LoginView from "@/pages/login/index.js";
import HomeIndexOverlayView from "@/pages/home/index.overlay.js";

ScrollViewPrimitive.setScrollViewProvider(web);
InputPrimitive.setInputProvider(web);
TextareaPrimitive.setTextareaProvider(web);
NavigatorCore.prefix = "/";

// const viewMap = {
//   "home-layout": HomeLayoutView,
//   "home-index": HomeIndexPageView,
//   "home-general": HomeIndexGeneralView,
//   "admin-layout": AdminLayoutView,
//   "admin-dashboard": AdminDashboardView,
//   notfound: NotFoundPageView,
//   login: LoginView,
// };

const routes_configure = {
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
            is_default: true,
            title: "通用组件",
            pathname: "/home/index/general",
            component: HomeIndexGeneralView,
          },
          overlay: {
            title: "Overlay",
            pathname: "/home/index/overlay",
            component: HomeIndexOverlayView,
          },
        },
      },
    },
  },
  admin_layout: {
    title: "管理后台",
    pathname: "/admin",
    component: AdminLayoutView,
    children: {
      dashboard: {
        title: "仪表盘",
        pathname: "/admin/dashboard",
        component: AdminDashboardView,
      },
    },
  },
  login: {
    title: "登录",
    pathname: "/login",
    component: LoginView,
  },
  notfound: {
    title: "404",
    pathname: "/notfound",
    component: NotFoundPageView,
    notfound: true,
  },
};

const router = buildRoutes(routes_configure);
export const views = router.views;
export const defaultRouteName = router.defaultRouteName;
export const notfoundRouteName = router.notfoundRouteName;
export const routes = router.routes;
export const routesWithPathname = router.routesWithPathname;

function routeHasRequirement(route, requireKey) {
  let cur = route;
  while (cur) {
    const requires = cur.options?.require;
    if (Array.isArray(requires) && requires.includes(requireKey)) {
      return true;
    }
    const parentName = cur.parent?.name;
    if (!parentName) {
      return false;
    }
    cur = routes[parentName];
  }
  return false;
}

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
export const storage$ = new StorageCore({
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
export const client$ = new HttpClientCore({
  headers: {
    "Content-Type": "application/json",
  },
});
export const user$ = (() => {
  let profile = storage$.get("user");
  const loginListeners = [];
  const logoutListeners = [];

  storage$.onStateChange(() => {
    profile = storage$.get("user");
  });

  function removeListener(list, cb) {
    const idx = list.indexOf(cb);
    if (idx >= 0) list.splice(idx, 1);
  }

  return {
    get profile() {
      return profile;
    },
    get token() {
      return profile?.token || "";
    },
    get isLogin() {
      return !!(profile && profile.token);
    },
    login(nextProfile) {
      const merged = {
        ...profile,
        ...(nextProfile || {}),
      };
      profile = merged;
      storage$.set("user", merged);
      client$.appendHeaders({ Authorization: merged.token || "" });
      for (const cb of loginListeners) cb(merged);
    },
    logout() {
      storage$.clear("user");
      profile = storage$.get("user");
      client$.appendHeaders({ Authorization: "" });
      for (const cb of logoutListeners) cb();
    },
    onLogin(cb) {
      loginListeners.push(cb);
      return () => removeListener(loginListeners, cb);
    },
    onLogout(cb) {
      logoutListeners.push(cb);
      return () => removeListener(logoutListeners, cb);
    },
  };
})();
client$.appendHeaders({ Authorization: user$.token });
web.provide_http_client(client$);
export const router$ = new NavigatorCore();
export const view$ = new RouteViewCore({
  name: "root",
  pathname: "/",
  title: "ROOT",
  visible: true,
  parent: null,
  views: [],
});
view$.isRoot = true;
export const history$ = new HistoryCore({
  view: view$,
  router: router$,
  routes,
  views: {
    root: view$,
  },
});
web.provide_history(history$);

const clipboard = ClipboardModel();
export const app = new ApplicationModel({
  clipboard,
  storage: storage$,
  async beforeReady() {
    const { pathname, query } = router$;
    const route = router.routesWithPathname[pathname];
    console.log("[Store] beforeReady", pathname, route, defaultRouteName);
    if (!route) {
      history$.push("root.home_layout", {}, { ignore: true });
      return Result.Ok(null);
    }
    if (routeHasRequirement(route, "login") && !user$.isLogin) {
      history$.push("root.login", {
        redirect: route.name,
        redirect_query: encodeURIComponent(JSON.stringify(query || {})),
      });
      return Result.Err("need login");
    }
    history$.push(route.name, query, { ignore: true });
    return Result.Ok(null);
  },
});
web.provide_app(app);

history$.onRouteChange(({ reason, view, href, ignore }) => {
  if (!ignore) {
    const pathname = String(view?.pathname || "");
    const route = router.routesWithPathname[pathname];
    if (route && routeHasRequirement(route, "login") && !user$.isLogin) {
      history$.replace("root.login", {
        redirect: route.name,
        redirect_query: encodeURIComponent(JSON.stringify(view?.query || {})),
      });
      return;
    }
  }
  const { title } = view || {};
  if (title) {
    app.setTitle(title);
  }
  if (ignore) {
    return;
  }
  if (reason === "push") {
    router$.pushState(String(href));
  }
  if (reason === "replace") {
    router$.replaceState(String(href));
  }
});
history$.onClickLink(({ href, target }) => {
  const hrefText = String(href || "");
  const { pathname, query } = NavigatorCore.parse(hrefText);
  const route = router.routesWithPathname[pathname];
  if (!route) {
    app.tip?.({ text: ["没有匹配的页面"] });
    return;
  }
  if (target === "_blank") {
    window.open(hrefText);
    return;
  }
  history$.push(/** @type {PageKey} */ (route.name), query);
});
