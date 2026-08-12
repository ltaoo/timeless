/**
 * @file Store 入口 - SSR 版本
 * 复刻 web-vanilla 的核心基础设施：路由、本地存储、接口请求、用户状态
 */
import {
  StorageCore,
  HttpClientCore,
  NavigatorCore,
  HistoryCore,
  RouteViewCore,
  ApplicationModel,
  ClipboardModel,
  buildRoutes,
  request_factory,
  Result,
} from "@timeless/timeless";

// ============================================================
// Routes (SSR file-based, but 也支持 client 端 history 路由跳转)
// ============================================================
NavigatorCore.prefix = "/";

const routes_configure = /** @type {const} */ ({
  home: {
    title: "首页",
    pathname: "/",
    component: null,
    children: {
      components: {
        is_default: true,
        title: "组件库",
        pathname: "/components",
        component: null,
      },
      settings: {
        title: "设置",
        pathname: "/settings",
        component: null,
      },
    },
  },
  login: {
    title: "登录",
    pathname: "/login",
    component: null,
  },
  notfound: {
    title: "404",
    pathname: "/notfound",
    component: null,
    notfound: true,
  },
});

const router = buildRoutes(routes_configure);
const routes = router.routes;
export const views = router.views;

// ============================================================
// LocalStorage (SSR safe: server 端使用 noop client)
// ============================================================
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
const key = "timeless_ssr";
// const isServer = typeof window === "undefined";
// const noopClient = {
//   getItem: () => null,
//   setItem: () => {},
//   removeItem: () => {},
//   clear: () => {},
// };
// const storageClient = isServer ? noopClient : globalThis.localStorage;
// console.log("isServer:", isServer, storageClient);
// const cached = storageClient.getItem(key);
export const storage$ = new StorageCore({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: {},
  // values: (() => {
  //   try {
  //     const prev = JSON.parse(cached || "{}");
  //     return { ...prev };
  //   } catch {
  //     return {};
  //   }
  // })(),
});

// ============================================================
// HttpClient
// ============================================================
export const client$ = new HttpClientCore({
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// User
// ============================================================
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
      const merged = { ...profile, ...(nextProfile || {}) };
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

// ============================================================
// Router & History (client-side navigation)
// ============================================================
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
  views: { root: view$ },
});

// ============================================================
// Application
// ============================================================
const clipboard = ClipboardModel();
export const app = new ApplicationModel({
  clipboard,
  storage: storage$,
  async beforeReady() {
    const { pathname, query } = router$;
    const route = router.routesWithPathname[pathname];
    if (!route) {
      history$.push("root.home", {}, { ignore: true });
      return Result.Ok(null);
    }
    history$.push(route.name, query, { ignore: true });
    return Result.Ok(null);
  },
});

// client-side route change -> navigate via page reload (SSR)
history$.onRouteChange(({ reason, view, href, ignore }) => {
  const { title } = view || {};
  if (title) {
    app.setTitle(title);
  }
  if (ignore) return;
  if (!isServer) {
    // SSR 项目用全量页面导航
    const target = String(href || "/");
    globalThis.location.href = target;
  }
});
