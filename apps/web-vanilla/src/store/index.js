/**
 * @file Store 入口 - 路由管理
 */
import NotFoundPageView from "@/pages/notfound/index.js";
import HomeLayoutView from "@/pages/home/layout.js";
import HomeIndexPageView from "@/pages/home/index.js";
import HomeIndexGeneralView from "@/pages/home/index.general.js";
import AdminLayoutView from "@/pages/admin/layout.js";

ScrollViewPrimitive.setScrollViewProvider(Timeless.web);
InputPrimitive.setInputProvider(Timeless.web);
TextareaPrimitive.setTextareaProvider(Timeless.web);
Timeless.NavigatorCore.prefix = "/";

const routes_configure = /** @type {const} */ ({
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
          form: {
            title: "表单组件",
            pathname: "/home/index/form",
            component: Timeless.lazy("@/pages/home/index.form.js"),
          },
          validate: {
            title: "表单组件",
            pathname: "/home/index/validate",
            component: Timeless.lazy("@/pages/home/index.validate.js"),
          },
          llm: {
            title: "LLM",
            pathname: "/home/index/llm",
            component: Timeless.lazy("@/pages/home/index.llm.js"),
          },
          data: {
            title: "数据展示组件",
            pathname: "/home/index/data",
            component: Timeless.lazy("@/pages/home/index.data.js"),
          },
          scroll: {
            title: "滚动容器",
            pathname: "/home/index/scroll",
            component: Timeless.lazy("@/pages/home/index.scroll.js"),
          },
          feedback: {
            title: "反馈组件",
            pathname: "/home/index/feedback",
            component: Timeless.lazy("@/pages/home/index.feedback.js"),
          },
          nav: {
            title: "导航组件",
            pathname: "/home/index/nav",
            component: Timeless.lazy("@/pages/home/index.nav.js"),
          },
          overlay: {
            title: "浮层组件",
            pathname: "/home/index/overlay",
            component: Timeless.lazy("@/pages/home/index.overlay.js"),
          },
          debug: {
            title: "调试",
            pathname: "/home/index/debug",
            component: Timeless.lazy("@/pages/home/index.debug.js"),
          },
          lifecycle: {
            title: "生命周期",
            pathname: "/home/index/lifecycle",
            component: Timeless.lazy("@/pages/home/index.lifecycle.js"),
          },
          command: {
            title: "命令面板",
            pathname: "/home/index/command",
            component: Timeless.lazy("@/pages/home/index.command.js"),
          },
          download_task: {
            title: "下载任务",
            pathname: "/home/index/download_task",
            component: Timeless.lazy("@/pages/home/index.download_task.js"),
          },
        },
      },
      settings: {
        title: "设置",
        pathname: "/settings",
        component: Timeless.lazy("@/pages/settings/index.js"),
      },
      article: {
        title: "博客",
        pathname: "/article",
        component: Timeless.lazy("@/pages/article/category.js"),
        children: {
          category: {
            title: "博客",
            pathname: "/article/category",
            component: Timeless.lazy("@/pages/article/index.js"),
            children: {
              content: {
                title: "博客详情",
                pathname: "/article/category/detail",
                component: Timeless.lazy("@/pages/article/content.js"),
              },
            },
          },
        },
      },
      project: {
        title: "项目",
        pathname: "/home/project",
        component: Timeless.lazy("@/pages/project/index.js"),
        children: {
          workspace: {
            title: "项目工作台",
            pathname: "/home/project/workspace",
            component: Timeless.lazy("@/pages/project/workspace.js"),
          },
          history: {
            title: "项目历史",
            pathname: "/home/project/history",
            component: Timeless.lazy("@/pages/project/history.js"),
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
        component: Timeless.lazy("@/pages/admin/dashboard.js"),
      },
      users: {
        title: "用户管理",
        pathname: "/admin/users",
        component: Timeless.lazy("@/pages/admin/users.js"),
      },
      user_detail: {
        title: "用户详情",
        pathname: "/admin/users/detail",
        component: Timeless.lazy("@/pages/admin/user.detail.js"),
      },
      roles: {
        title: "角色权限",
        pathname: "/admin/roles",
        component: Timeless.lazy("@/pages/admin/roles.js"),
      },
      logs: {
        title: "操作日志",
        pathname: "/admin/logs",
        component: Timeless.lazy("@/pages/admin/logs.js"),
      },
      system: {
        title: "系统设置",
        pathname: "/admin/system",
        component: Timeless.lazy("@/pages/admin/system.js"),
      },
    },
    options: {
      require: /** @type {string[]} */ (["login"]),
    },
  },
  login: {
    title: "登录",
    pathname: "/login",
    component: Timeless.lazy("@/pages/login/index.js"),
  },
  notfound: {
    title: "404",
    pathname: "/notfound",
    component: NotFoundPageView,
    notfound: true,
  },
});

const router = Timeless.buildRoutes(routes_configure);

const routes = router.routes;
export const views = router.views;
export const defaultRouteName = router.defaultRouteName;
export const notfoundRouteName = router.notfoundRouteName;

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
export const storage$ = new Timeless.StorageCore({
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
export const client$ = new Timeless.HttpClientCore({
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
Timeless.web.provide_http_client(client$);
export const router$ = new Timeless.NavigatorCore();
export const view$ = new Timeless.RouteViewCore({
  name: "root",
  pathname: "/",
  title: "ROOT",
  visible: true,
  parent: null,
  views: [],
});
view$.isRoot = true;
export const history$ = new Timeless.HistoryCore({
  view: view$,
  router: router$,
  routes,
  views: {
    root: view$,
  },
});
Timeless.web.provide_history(history$);

const clipboard = Timeless.ClipboardModel();
export const app = new Timeless.ApplicationModel({
  clipboard,
  storage: storage$,
  async beforeReady() {
    const { pathname, query } = router$;
    const route = router.routesWithPathname[pathname];
    console.log(
      "[Store] beforeReady",
      pathname,
      route,
      router.routesWithPathname,
    );
    if (!route) {
      history$.push("root.home_layout", {}, { ignore: true });
      return Timeless.Result.Ok(null);
    }
    if (routeHasRequirement(route, "login") && !user$.isLogin) {
      history$.push("root.login", {
        redirect: route.name,
        redirect_query: encodeURIComponent(JSON.stringify(query || {})),
      });
      return Timeless.Result.Err("need login");
    }
    history$.push(route.name, query, { ignore: true });
    return Timeless.Result.Ok(null);
  },
});
Timeless.web.provide_app(app);

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
  const { pathname, query } = Timeless.NavigatorCore.parse(hrefText);
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
