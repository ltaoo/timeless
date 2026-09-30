/**
 * @file Store 入口 - 路由管理
 */
import NotFoundPageView from "@/pages/notfound/index.js";
import HomeLayoutView from "@/pages/home/layout.js";
import HomeIndexPageView from "@/pages/home/index.js";
import HomeIndexGeneralView from "@/pages/home/index.general.js";
import HomeIndexLayoutView from "@/pages/home/index.layout.js";
import HomeIndexNavigationView from "@/pages/home/index.navigation.js";
import HomeIndexDataEntryView from "@/pages/home/index.data_entry.js";
import HomeIndexDataDisplayView from "@/pages/home/index.data_display.js";
import HomeIndexFeedbackView from "@/pages/home/index.feedback.js";
import HomeIndexExtensionView from "@/pages/home/index.extension.js";
import AdminLayoutView from "@/pages/admin/layout.js";

Timeless.ui.ScrollViewPrimitive.setScrollViewProvider(Timeless.web);
Timeless.ui.InputPrimitive.setInputProvider(Timeless.web);
Timeless.ui.TextareaPrimitive.setTextareaProvider(Timeless.web);
Timeless.kit.NavigatorCore.prefix = "/";

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
            title: "通用",
            pathname: "/home/index/general",
            component: HomeIndexGeneralView,
          },
          layout: {
            title: "布局",
            pathname: "/home/index/layout",
            component: HomeIndexLayoutView,
          },
          navigation: {
            title: "导航",
            pathname: "/home/index/navigation",
            component: HomeIndexNavigationView,
          },
          data_entry: {
            title: "数据录入",
            pathname: "/home/index/data_entry",
            component: HomeIndexDataEntryView,
          },
          data_display: {
            title: "数据展示",
            pathname: "/home/index/data_display",
            component: HomeIndexDataDisplayView,
          },
          feedback: {
            title: "反馈",
            pathname: "/home/index/feedback",
            component: HomeIndexFeedbackView,
          },
          extension: {
            title: "其他",
            pathname: "/home/index/extension",
            component: HomeIndexExtensionView,
          },
          design: {
            title: "设计规范",
            pathname: "/home/index/design",
            component: Timeless.lazy("@/pages/home/index.design.js"),
          },
          validate: {
            title: "表单校验",
            pathname: "/home/index/validate",
            component: Timeless.lazy("@/pages/home/index.validate.js"),
          },
          llm: {
            title: "LLM",
            pathname: "/home/index/llm",
            component: Timeless.lazy("@/pages/home/index.llm.js"),
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
          flow: {
            title: "流程图",
            pathname: "/home/index/flow",
            component: Timeless.lazy("@/pages/home/index.flow.js"),
          },
          kanban: {
            title: "看板",
            pathname: "/home/index/kanban",
            component: Timeless.lazy("@/pages/home/home_kanban.js"),
          },
          tree: {
            title: "树形拖拽",
            pathname: "/home/index/tree",
            component: Timeless.lazy("@/pages/home/index.tree.js"),
          },
          locale: {
            title: "多语言 Context",
            pathname: "/home/index/locale",
            component: Timeless.lazy("@/pages/home/index.locale.js"),
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
      chat: {
        title: "聊天",
        pathname: "/chat",
        component: Timeless.lazy("@/pages/home/chat.js"),
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

const router = Timeless.kit.buildRoutes(routes_configure);

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
export const storage$ = new Timeless.kit.StorageCore({
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
export const client$ = new Timeless.kit.HttpClientCore({
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
  views: {
    root: view$,
  },
});
Timeless.web.provide_history(history$);

const clipboard = Timeless.kit.ClipboardModel();
export const app = new Timeless.kit.ApplicationModel({
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
  const { pathname, query } = Timeless.kit.NavigatorCore.parse(hrefText);
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
