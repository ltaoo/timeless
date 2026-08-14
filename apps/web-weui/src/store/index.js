/**
 * @file Store 入口
 */
import HomePageView from "@/pages/home/index.js";

Timeless.ui.ScrollViewPrimitive.setScrollViewProvider(Timeless.web);
Timeless.ui.InputPrimitive.setInputProvider(Timeless.web);
Timeless.ui.TextareaPrimitive.setTextareaProvider(Timeless.web);
Timeless.kit.NavigatorCore.prefix = "/";

const routes_configure = /** @type {const} */ ({
  home: {
    title: "首页",
    pathname: "/home",
    component: HomePageView,
  },
});

const router = Timeless.kit.buildRoutes(routes_configure);
const routes = router.routes;
export const views = router.views;

export const storage$ = new Timeless.kit.StorageCore({
  key: "timeless-weui",
  defaultValues: { theme: "light" },
  values: (() => {
    const e = globalThis.localStorage.getItem("timeless-weui");
    return JSON.parse(e || "{}");
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
    history$.push("root.home", {}, { ignore: true });
    return Timeless.Result.Ok(null);
  },
});
Timeless.web.provide_app(app);

history$.onRouteChange(({ reason, view, href, ignore }) => {
  if (ignore) return;
  if (reason === "push") router$.pushState(String(href));
  if (reason === "replace") router$.replaceState(String(href));
});
