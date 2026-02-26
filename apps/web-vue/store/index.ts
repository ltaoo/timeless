import { Application } from "@/domains/app/index";
import { ListCore } from "@/domains/list/index";
import { NavigatorCore } from "@/domains/navigator/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { StorageCore } from "@/domains/storage/index";
import { RouteConfig } from "@/domains/route_view/utils";
import { provide_app, provide_history, provide_ui_image } from "@timeless/provider-web";
import { HistoryCore, ui, onRequestCreated, onCreateScrollView, RequestCore } from "@timeless/core";

const { ImageCore } = ui;
import { Result } from "@/domains/result/index";
import { UserCore } from "@/biz/user";

import { client } from "./http_client";
import { storage } from "./storage";
import { PageKeys, routes, routesWithPathname } from "./routes";

class MockRequest extends RequestCore<any, { list: any[]; total: number }> {
  constructor() {
    super(() => ({ url: "", method: "GET" }));
  }
  async run() {
    return Result.Ok({
      list: [],
      total: 0,
    });
  }
}
export const messageList = new ListCore(new MockRequest());

onRequestCreated((ins) => {
  ins.onFailed((e) => {
    app.tip({
      text: [e.message],
    });
    if (e.code === 900) {
      history.push("root.login");
    }
  });
  if (!ins.client) {
    ins.client = client;
  }
});
onCreateScrollView((ins) => ins.os === app.env);
NavigatorCore.prefix = import.meta.env.BASE_URL;
ImageCore.prefix = window.location.origin;

const router = new NavigatorCore();
class ExtendsUser extends UserCore {
  say() {
    console.log(`My name is ${this.nickname}`);
  }
  async loginWithTokenId(params: { token: string; tmp?: number }) {
    this.token = params.token;
    // this.emit(Events.Login); // If UserCore has Events
    return Result.Ok(null);
  }
}
const user = new ExtendsUser(storage.get("user"), client);
const view = new RouteViewCore({
  name: "root" as PageKeys,
  pathname: "/",
  title: "ROOT",
  visible: true,
  parent: null,
  views: [],
});
view.isRoot = true;
class ExtendsHistory<
  K extends string,
  R extends Record<string, any>
> extends HistoryCore<K, R> {
  extra_query: Record<string, any> = {};
}
export const history = new ExtendsHistory<PageKeys, RouteConfig<PageKeys>>({
  view,
  router,
  routes,
  views: {
    root: view,
  } as Record<PageKeys, RouteViewCore>,
});
class ExtendsApplication<
  T extends { storage: StorageCore<any> }
> extends Application<T> {
  hideCursor() {
    document.documentElement.style.cursor = "none";
  }
  showCursor(type: "default" = "default") {
    document.documentElement.style.cursor = type;
  }
}
export const app = new ExtendsApplication({
  user,
  storage,
  async beforeReady() {
    const { pathname, query } = history.$router;
    const route = routesWithPathname[pathname];
    console.log("[ROOT]onMount", pathname, route, app.$user.isLogin);
    if (!route) {
      history.push("root.notfound");
      return Result.Err("not found");
    }
    if (!route.options?.require?.includes("login")) {
      if (!history.isLayout(route.name)) {
        // 页面无需登录
        history.push(route.name, query, { ignore: true });
        return Result.Ok(null);
      }
      return Result.Err("can't goto layout");
    }
    // 页面需要登录
    await user.loginWithTokenId({
      token: router.query.token,
      tmp: Number(router.query.tmp),
    });
    if (!user.isLogin) {
      app.tip({
        text: ["请先登录"],
      });
      history.push("root.login", { redirect: route.pathname });
      return Result.Err("need login");
    }
    history.extra_query = { token: router.query.token, tmp: router.query.tmp };
    if (!user.isLogin) {
      app.tip({
        text: ["请先登录"],
      });
      history.push("root.login", { redirect: route.pathname });
      return Result.Err("need login");
    }
    client.appendHeaders({
      Authorization: app.$user.token,
    });
    messageList.init();
    if (!history.isLayout(route.name)) {
      history.push(route.name, query, { ignore: true });
      return Result.Ok(null);
    }
    history.push("root.home_layout.home_index", {}, { ignore: true });
    return Result.Ok(null);
  },
});
app.setEnv({
  prod: import.meta.env.PROD,
  dev: import.meta.env.DEV,
});
provide_app(app);
provide_history(history);
history.onClickLink(({ href, target }) => {
  const { pathname, query } = NavigatorCore.parse(href);
  const route = routesWithPathname[pathname];
  // console.log("[ROOT]history.onClickLink", pathname, query, route);
  if (!route) {
    app.tip({
      text: ["没有匹配的页面"],
    });
    return;
  }
  if (target === "_blank") {
    const u = history.buildURLWithPrefix(route.name, query);
    window.open(u);
    return;
  }
  history.push(route.name, query);
  return;
});
history.onRouteChange(({ ignore, reason, view, href }) => {
  console.log("[ROOT]rootView.onRouteChange", href, history.$router.href);
  const { title } = view;
  app.setTitle(title);
  if (ignore) {
    return;
  }
  if (app.env.ios) {
    return;
  }
  if (reason === "push") {
    history.$router.pushState(href);
  }
  if (reason === "replace") {
    history.$router.replaceState(href);
  }
});
user.onLogin((profile) => {
  client.appendHeaders({
    Authorization: user.token,
  });
  storage.set("user", profile);
});
user.onLogout(() => {
  storage.clear("user");
  history.push("root.login");
});
user.onExpired(() => {
  storage.clear("user");
  app.tip({
    text: ["token 已过期，请重新登录"],
  });
  // router.replace("/login");
});
user.onTip((msg) => {
  app.tip(msg);
});
user.onNeedUpdate(() => {
  app.tipUpdate();
});
