# 路由系统

Timeless 使用 `Timeless.buildRoutes()` + `NavigatorCore` + `HistoryCore` 构建路由系统。

---

## 路由配置

在 `src/store/index.js` 中定义路由树：

```js
import HomeLayoutView from "@/pages/home/layout.js";
import HomeIndexPageView from "@/pages/home/index.js";

Timeless.NavigatorCore.prefix = "/";

const routes_configure = {
  home_layout: {
    title: "首页",
    pathname: "/home",
    component: HomeLayoutView,              // 直接 import 的组件
    children: {
      index: {
        title: "组件库",
        pathname: "/home/index",
        component: HomeIndexPageView,
        children: {
          general: {
            is_default: true,               // 默认子路由
            title: "通用组件",
            pathname: "/home/index/general",
            component: HomeIndexGeneralView,
          },
          form: {
            title: "表单组件",
            pathname: "/home/index/form",
            component: Timeless.lazy("@/pages/home/index.form.js"),  // 懒加载
          },
        },
      },
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
    notfound: true,                         // 404 页面标记
  },
};
```

### 路由配置字段

| 字段 | 说明 |
|------|------|
| `title` | 页面标题 |
| `pathname` | URL 路径 |
| `component` | 页面组件（直接 import 或 `Timeless.lazy()` 懒加载） |
| `children` | 嵌套子路由 |
| `is_default` | 标记为父路由的默认子路由 |
| `notfound` | 标记为 404 页面 |
| `options.require` | 权限要求数组，如 `["login"]` |

---

## 路由核心对象初始化

```js
const router = Timeless.buildRoutes(routes_configure);
const routes = router.routes;
export const views = router.views;

export const router$ = new Timeless.NavigatorCore();
export const view$ = new Timeless.RouteViewCore({
  name: "root", pathname: "/", title: "ROOT",
  visible: true, parent: null, views: [],
});
view$.isRoot = true;

export const history$ = new Timeless.HistoryCore({
  view: view$, router: router$, routes,
  views: { root: view$ },
});
Timeless.web.provide_history(history$);
```

### 核心对象说明

| 对象 | 说明 |
|------|------|
| `router` | `buildRoutes()` 返回值，包含 `routes`（路由表）、`views`、`routesWithPathname`（按 pathname 索引） |
| `router$` | `NavigatorCore` 实例，管理浏览器 URL（pushState / replaceState） |
| `view$` | `RouteViewCore` 根视图节点 |
| `history$` | `HistoryCore` 实例，核心路由控制器，负责视图切换 |

---

## 路由导航

```js
// push 跳转（会更新浏览器地址栏）
history$.push("root.home_layout.index.form", {});

// 带 query 参数
history$.push("root.home_layout.index", { tab: "general", page: 1 });

// replace 替换（不产生历史记录）
history$.replace("root.login", { redirect: "root.home_layout" });

// push 时 ignore 选项：只切换视图，不更新浏览器 URL
history$.push("root.home_layout", {}, { ignore: true });
```

### 路由名称规则

路由名称为从根到目标的路径，用 `.` 连接，前缀为 `root`：
- `root.home_layout` → `/home`
- `root.home_layout.index.form` → `/home/index/form`
- `root.login` → `/login`

---

## 路由守卫（权限控制）

通过路由配置的 `options.require` 实现：

```js
admin_layout: {
  title: "管理后台",
  pathname: "/admin",
  component: AdminLayoutView,
  children: { /* ... */ },
  options: {
    require: ["login"],   // 需要登录才能访问
  },
},
```

在 `beforeReady` 和 `onRouteChange` 中检查权限：

```js
// 辅助函数：沿父链检查 require
function routeHasRequirement(route, requireKey) {
  let cur = route;
  while (cur) {
    const requires = cur.options?.require;
    if (Array.isArray(requires) && requires.includes(requireKey)) return true;
    const parentName = cur.parent?.name;
    if (!parentName) return false;
    cur = routes[parentName];
  }
  return false;
}

// beforeReady — 应用启动时
if (routeHasRequirement(route, "login") && !user$.isLogin) {
  history$.push("root.login", { redirect: route.name });
  return Timeless.Result.Err("need login");
}

// onRouteChange — 路由切换时
history$.onRouteChange(({ reason, view, href, ignore }) => {
  const route = router.routesWithPathname[view?.pathname];
  if (route && routeHasRequirement(route, "login") && !user$.isLogin) {
    history$.replace("root.login", { redirect: route.name });
    return;
  }
});
```

---

## 链接点击处理

```js
history$.onClickLink(({ href, target }) => {
  const { pathname, query } = Timeless.NavigatorCore.parse(String(href));
  const route = router.routesWithPathname[pathname];
  if (!route) { app.tip?.({ text: ["没有匹配的页面"] }); return; }
  if (target === "_blank") { window.open(href); return; }
  history$.push(route.name, query);
});
```

---

## 应用初始化（ApplicationModel）

```js
export const app = new Timeless.ApplicationModel({
  storage: storage$,
  async beforeReady() {
    const { pathname, query } = router$;
    const route = router.routesWithPathname[pathname];
    if (!route) {
      history$.push("root.home_layout", {}, { ignore: true });
      return Timeless.Result.Ok(null);
    }
    if (routeHasRequirement(route, "login") && !user$.isLogin) {
      history$.push("root.login", { redirect: route.name });
      return Timeless.Result.Err("need login");
    }
    history$.push(route.name, query, { ignore: true });
    return Timeless.Result.Ok(null);
  },
});
Timeless.web.provide_app(app);
```

---

## 完整参考

实际项目路由配置见 `apps/web-shadcn/src/store/index.js`。
