import { ScrollViewPrimitive } from "@timeless/ui-primitive";
import { InputPrimitive } from "@timeless/ui-primitive";
import { TextareaPrimitive } from "@timeless/ui-primitive";

// Set platform providers
ScrollViewPrimitive.setProvider("web");
InputPrimitive.setProvider("web");
TextareaPrimitive.setProvider("web");

// Set Navigator prefix
Timeless.NavigatorCore.prefix = "/";

// Route configuration
const routes_configure = {
  root: {
    home_layout: {
      path: "/home",
      view: () => import("../pages/home/layout.js"),
      children: {
        index: {
          path: "/home/index",
          view: () => import("../pages/home/index.js"),
          children: {
            general: {
              path: "/home/index/general",
              view: () => import("../pages/home/index.general.js"),
            },
            form: {
              path: "/home/index/form",
              view: () => import("../pages/home/index.form.js"),
            },
            validate: {
              path: "/home/index/validate",
              view: () => import("../pages/home/index.validate.js"),
            },
            llm: {
              path: "/home/index/llm",
              view: () => import("../pages/home/index.llm.js"),
            },
            data: {
              path: "/home/index/data",
              view: () => import("../pages/home/index.data.js"),
            },
            scroll: {
              path: "/home/index/scroll",
              view: () => import("../pages/home/index.scroll.js"),
            },
            feedback: {
              path: "/home/index/feedback",
              view: () => import("../pages/home/index.feedback.js"),
            },
            nav: {
              path: "/home/index/nav",
              view: () => import("../pages/home/index.nav.js"),
            },
            overlay: {
              path: "/home/index/overlay",
              view: () => import("../pages/home/index.overlay.js"),
            },
            debug: {
              path: "/home/index/debug",
              view: () => import("../pages/home/index.debug.js"),
            },
            lifecycle: {
              path: "/home/index/lifecycle",
              view: () => import("../pages/home/index.lifecycle.js"),
            },
            command: {
              path: "/home/index/command",
              view: () => import("../pages/home/index.command.js"),
            },
            download_task: {
              path: "/home/index/download_task",
              view: () => import("../pages/home/index.download_task.js"),
            },
            flow: {
              path: "/home/index/flow",
              view: () => import("../pages/home/index.flow.js"),
            },
          },
        },
        settings: {
          path: "/settings",
          view: () => import("../pages/settings/index.js"),
        },
        article: {
          path: "/article",
          view: () => import("../pages/article/index.js"),
          children: {
            category: {
              path: "/article/category",
              view: () => import("../pages/article/category.js"),
              children: {
                detail: {
                  path: "/article/category/detail",
                  view: () => import("../pages/article/content.js"),
                },
              },
            },
          },
        },
        project: {
          path: "/home/project",
          view: () => import("../pages/project/index.js"),
          children: {
            workspace: {
              path: "/home/project/workspace",
              view: () => import("../pages/project/workspace.js"),
            },
            history: {
              path: "/home/project/history",
              view: () => import("../pages/project/history.js"),
            },
          },
        },
        chat: {
          path: "/chat",
          view: () => import("../pages/home/chat.js"),
        },
      },
    },
    admin_layout: {
      path: "/admin",
      view: () => import("../pages/admin/layout.js"),
      meta: { requiresAuth: "login" },
      children: {
        dashboard: {
          path: "/admin/dashboard",
          view: () => import("../pages/admin/dashboard.js"),
        },
        users: {
          path: "/admin/users",
          view: () => import("../pages/admin/users.js"),
        },
        user_detail: {
          path: "/admin/users/detail",
          view: () => import("../pages/admin/user.detail.js"),
        },
        roles: {
          path: "/admin/roles",
          view: () => import("../pages/admin/roles.js"),
        },
        logs: {
          path: "/admin/logs",
          view: () => import("../pages/admin/logs.js"),
        },
        system: {
          path: "/admin/system",
          view: () => import("../pages/admin/system.js"),
        },
      },
    },
    login: {
      path: "/login",
      view: () => import("../pages/login/index.js"),
    },
    notfound: {
      path: "/notfound",
      view: () => import("../pages/notfound/index.js"),
      meta: { notfound: true },
    },
  },
};

// Create core instances
const router = Timeless.buildRoutes(routes_configure);

const storage$ = Timeless.StorageCore({
  storage: localStorage,
  key: "timeless",
  initialValue: {
    user: null,
    theme: "light",
  },
});

const client$ = Timeless.HttpClientCore({
  headers: {
    "Content-Type": "application/json",
  },
  baseURL: "",
});

const user$ = {
  login(username, password) {
    if (username === "admin" && password === "123456") {
      const user = { username, name: "Admin", role: "admin", token: "mock-token-" + Date.now() };
      storage$.set("user", user);
      client$.appendHeaders({ Authorization: "Bearer " + user.token });
      return { ok: true, user };
    }
    return { ok: false, error: "Invalid credentials" };
  },
  logout() {
    storage$.set("user", null);
    client$.appendHeaders({ Authorization: "" });
  },
  getProfile() {
    return storage$.get("user");
  },
  isLoggedIn() {
    return !!storage$.get("user");
  },
};

const router$ = Timeless.NavigatorCore({});

const views = Timeless.RouteViewCore({ root: "root" });
const history$ = Timeless.HistoryCore({ routes, views, router: router$ });

const app = Timeless.ApplicationModel({
  clipboard: {},
  storage: storage$,
  beforeReady() {
    const user = user$.getProfile();
    if (user) {
      client$.appendHeaders({ Authorization: "Bearer " + user.token });
    }
  },
});

// Handle route changes
history$.on("change", ({ detail }) => {
  const { pathname, query, hash } = detail;
  const method = history$.state.replace ? "replaceState" : "pushState";
  window.history[method]({}, "", pathname + query + hash);
});

// Handle link clicks
window.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  const href = target.getAttribute("href");
  if (!href || href.startsWith("http") || href.startsWith("//")) return;
  e.preventDefault();
  const matched = router.match(href);
  if (matched) {
    history$.push(href);
  }
});

export { app, history$, client$, views, storage$, user$, router };
