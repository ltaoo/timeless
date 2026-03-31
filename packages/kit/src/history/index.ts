import { BaseDomain, Handler } from "@timeless/base";
import { qs_parse, qs_stringify } from "@timeless/utils";

import { RouteViewCore } from "@/route_view";
import { NavigatorCore } from "@/navigator";

enum Events {
  TopViewChange,
  RouteChange,
  ClickLink,
  Back,
  Forward,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.TopViewChange]: RouteViewCore;
  [Events.ClickLink]: {
    href: string;
    target: string | null;
  };
  [Events.Back]: void;
  [Events.Forward]: void;
  [Events.RouteChange]: {
    view: RouteViewCore;
    name: string;
    href: string;
    pathname: string;
    query: Record<string, string>;
    reason: "back" | "forward" | "push" | "replace";
    /** 用于在页面间传递标记、数据等 */
    data?: any;
    /** 调用方希望忽略这次 route change */
    ignore?: boolean;
  };
  [Events.StateChange]: HistoryCoreState;
};

type HistoryCoreProps<K extends string, R extends Record<string, any>> = {
  view: RouteViewCore;
  router: NavigatorCore;
  routes: Record<K, R>;
  views: Record<string, RouteViewCore>;
  /** 是否采用虚拟路由（不改变浏览器历史） */
  virtual?: boolean;
};
type HistoryCoreState = {
  href: string;
  stacks: {
    id: string;
    key: string;
    title: string;
    visible: boolean;
    query: string;
  }[];
  cursor: number;
};

export class HistoryCore<
  K extends string,
  R extends Record<string, any>,
> extends BaseDomain<TheTypesOfEvents> {
  virtual = false;

  /** 路由配置 */
  routes: Record<K, R>;
  /** 加载的所有视图 */
  views: Record<string, RouteViewCore>;
  /** 按顺序依次 push 的视图 */
  stacks: RouteViewCore[] = [];
  /** 栈指针 */
  cursor: number = -1;

  /** 浏览器 url 管理 */
  $router: NavigatorCore;
  /** 根视图 */
  $view: RouteViewCore;

  get state(): HistoryCoreState {
    return {
      href: this.$router.href,
      stacks: this.stacks.map((view) => {
        const { id, pathname: key, title, query, visible } = view;
        return {
          // id: String(id),
          id: [key, qs_stringify(query)].filter(Boolean).join("?"),
          key,
          title,
          query: JSON.stringify(query, null, 2),
          visible,
        };
      }),
      cursor: this.cursor,
    };
  }

  constructor(props: Partial<{ _name: string }> & HistoryCoreProps<K, R>) {
    super(props);

    const { virtual = false, view, router, routes, views } = props;

    this.$view = view;
    this.$router = router;
    this.routes = routes;
    this.views = views;
    this.virtual = virtual;
  }

  resolveLayoutDefaultName(name: K) {
    const route = this.routes[name];
    if (!route) {
      return name;
    }
    if (route.layout && route.defaultName && route.defaultName !== name) {
      return route.defaultName as K;
    }
    return name;
  }

  push(
    name: K,
    query: Record<string, string> = {},
    options: Partial<{
      /** 不变更 history stack */
      ignore: boolean;
    }> = {},
  ) {
    const resolvedName = this.resolveLayoutDefaultName(name);
    if (resolvedName !== name) {
      return this.push(resolvedName, query, options);
    }
    // console.log("-----------");
    // console.log("[DOMAIN]history/index - push target url is", name, "and cur href is", this.$router.href);
    const { ignore } = options;
    // if (this.isLayout(name)) {
    //   console.log("[DOMAIN]history/index - the target url is layout", name);
    //   return;
    // }
    const route1 = this.routes[name];
    if (!route1) {
      console.log("[DOMAIN]history/index - push 2. no matched route", name);
      return;
    }
    const uniqueKey = [route1.pathname, qs_stringify(query)]
      .filter(Boolean)
      .join("?");
    if (uniqueKey === this.$router.href) {
      // console.log("[DOMAIN]history/index - push target url is", uniqueKey, "and cur href is", this.$router.href);
      return;
    }
    const view = this.views[uniqueKey];
    if (view) {
      this.ensureParent(view, query);
      view.query = query;
      view.layout = !!route1.layout;
      view.defaultName = route1.defaultName;
      view.notfoundFallbackName = route1.notfoundFallbackName;
      view.is_default = !!route1.is_default;
      view.is_notfound_fallback = !!route1.is_notfound_fallback;
      if (!view.parent) {
        console.log("[DOMAIN]history/index - error1");
        return;
      }
      this.$router.href = view.href;
      this.$router.name = view.name;
      // const viewAfter = this.stacks.slice(this.cursor + 1);
      // for (let i = 0; i < viewAfter.length; i += 1) {
      //   const v = viewAfter[i];
      //   v.parent?.removeView(v, {
      //     reason: "show_sibling",
      //     callback: () => {
      //       delete this.views[v.href];
      //     },
      //   });
      // }
      // @todo 切换 tab 的 push 行为，应该不变更栈
      this.stacks = this.stacks.slice(0, this.cursor + 1).concat(view);
      this.cursor += 1;
      view.parent.showView(view, { reason: "show_sibling", destroy: false });
      this.emit(Events.RouteChange, {
        reason: "push",
        view,
        name,
        href: view.href,
        pathname: view.pathname,
        query: view.query,
        ignore,
      });
      // this.emit(Events.TopViewChange, view);
      this.emit(Events.StateChange, { ...this.state });
      return;
    }
    const route = (() => {
      const m = this.routes[name];
      if (!m) {
        return null;
      }
      return m;
    })();
    if (!route) {
      console.log(
        "[DOMAIN]history/index - push 2. no matched route",
        uniqueKey,
      );
      return null;
    }
    const created = new RouteViewCore({
      name: route.name,
      pathname: route.pathname,
      title: route.title,
      query,
      animation: route.options?.animation,
      layout: !!route.layout,
      defaultName: route.defaultName,
      notfoundFallbackName: route.notfoundFallbackName,
      is_default: !!route.is_default,
      is_notfound_fallback: !!route.is_notfound_fallback,
      parent: null,
    });
    // created.onUnmounted(() => {
    //   this.stacks = this.stacks.filter((s) => s.key !== created.key);
    //   delete this.views[uniqueKey];
    // });
    this.views[uniqueKey] = created;
    this.views[name as string] = created;
    this.ensureParent(created, query);
    if (!created.parent) {
      console.log("[DOMAIN]history/index - push 3. ", route.name);
      return;
    }
    this.$router.href = created.href;
    this.$router.name = created.name;
    // const viewsAfter = this.stacks.slice(this.cursor);
    // for (let i = 0; i < viewsAfter.length; i += 1) {
    //   const v = viewsAfter[i];
    //   v.hide();
    // }
    this.stacks = this.stacks.slice(0, this.cursor + 1).concat(created);
    console.log(
      "[DOMAIN]history/index - push 4.",
      this.stacks.map((v) => v.href),
    );
    this.cursor += 1;
    created.parent.showView(created, {
      reason: "show_sibling",
      destroy: false,
    });
    this.emit(Events.RouteChange, {
      reason: "push",
      view: created,
      name,
      href: created.href,
      pathname: created.pathname,
      query: created.query,
      ignore,
    });
    // this.emit(Events.TopViewChange, created);
    this.emit(Events.StateChange, { ...this.state });
  }
  replace(name: K, query: Record<string, string> = {}) {
    const resolvedName = this.resolveLayoutDefaultName(name);
    if (resolvedName !== name) {
      return this.replace(resolvedName, query);
    }
    const route = this.routes[name];
    if (!route) {
      console.log("[DOMAIN]history/index - replace 2. no matched route");
      return;
    }
    // 与 push 保持一致：用 pathname 构建 key，否则 push 存的 view 在 replace 中找不到
    const uniqueKey = [route.pathname, qs_stringify(query)]
      .filter(Boolean)
      .join("?");
    if (uniqueKey === this.$router.href) {
      console.log(
        "[DOMAIN]history/index - replace target url is",
        uniqueKey,
        "and cur href is",
        this.$router.href,
      );
      return;
    }
    const view = this.views[uniqueKey];
    if (view) {
      this.ensureParent(view, query);
      view.query = query;
      view.layout = !!route.layout;
      view.defaultName = route.defaultName;
      view.notfoundFallbackName = route.notfoundFallbackName;
      view.is_default = !!route.is_default;
      view.is_notfound_fallback = !!route.is_notfound_fallback;
      if (!view.parent) {
        console.log("[DOMAIN]history/index - replace 1");
        return;
      }
      this.$router.href = view.href;
      this.$router.name = view.name;
      this.stacks[this.stacks.length - 1] = view;
      view.parent.showView(view);
      this.emit(Events.RouteChange, {
        reason: "replace",
        view,
        name: view.name,
        href: view.href,
        pathname: view.pathname,
        query: view.query,
      });
      this.emit(Events.StateChange, { ...this.state });
      return;
    }
    const created = new RouteViewCore({
      name: route.name,
      pathname: route.pathname,
      title: route.title,
      query,
      animation: route.options?.animation,
      layout: !!route.layout,
      defaultName: route.defaultName,
      notfoundFallbackName: route.notfoundFallbackName,
      is_default: !!route.is_default,
      is_notfound_fallback: !!route.is_notfound_fallback,
      parent: null,
    });
    this.views[uniqueKey] = created;
    this.views[name as string] = created;
    this.ensureParent(created, query);
    if (!created.parent) {
      console.log("[DOMAIN]history/index - replace 3. ");
      return;
    }
    this.$router.href = created.href;
    this.$router.name = created.name;
    this.stacks[this.stacks.length - 1] = created;
    created.parent.showView(created);
    this.emit(Events.RouteChange, {
      reason: "replace",
      view: created,
      name: created.name,
      href: created.href,
      pathname: created.pathname,
      query: created.query,
    });
    this.emit(Events.StateChange, { ...this.state });
  }
  back(opt: Partial<{ data: any }> = {}) {
    if (this.cursor <= 0) {
      console.log("[DOMAIN]history - back, cursor is 0, cannot go back");
      return;
    }

    const targetIndex = this.cursor - 1;
    const view_prepare_to_show = this.stacks[targetIndex];

    if (!view_prepare_to_show) {
      console.log(
        "[DOMAIN]history - back, no view at targetIndex",
        targetIndex,
      );
      return;
    }
    if (!view_prepare_to_show.parent) {
      console.log("[DOMAIN]history - back, no parent");
      return;
    }

    this.$router.href = view_prepare_to_show.href;
    this.$router.name = view_prepare_to_show.name;
    this.cursor = targetIndex;

    const viewsAfter = this.stacks.slice(targetIndex + 1);
    for (const v of viewsAfter) {
      v.parent?.removeView(v, { reason: "back", destroy: false });
    }

    if (view_prepare_to_show.visible && view_prepare_to_show.curView) {
      view_prepare_to_show.clearCurView({ reason: "back", destroy: false });
    }
    view_prepare_to_show.parent.showView(view_prepare_to_show, {
      reason: "back",
      destroy: false,
    });
    this.emit(Events.RouteChange, {
      reason: "back",
      view: view_prepare_to_show,
      name: view_prepare_to_show.name,
      href: view_prepare_to_show.href,
      pathname: view_prepare_to_show.pathname,
      query: view_prepare_to_show.query,
      data: opt.data,
    });
    this.emit(Events.Back);
    this.emit(Events.StateChange, { ...this.state });
  }
  forward() {
    if (this.cursor >= this.stacks.length - 1) {
      console.log(
        "[DOMAIN]history - forward, cursor at end, cannot go forward",
      );
      return;
    }

    const targetIndex = this.cursor + 1;
    const viewPrepareShow = this.stacks[targetIndex];

    if (!viewPrepareShow) {
      console.log(
        "[DOMAIN]history - forward, no view at targetIndex",
        targetIndex,
      );
      return;
    }
    if (!viewPrepareShow.parent) {
      console.log("[DOMAIN]history - forward, no parent");
      return;
    }

    this.$router.href = viewPrepareShow.href;
    this.$router.name = viewPrepareShow.name;
    this.cursor = targetIndex;

    const viewsAfter = this.stacks.slice(targetIndex + 1);
    for (const v of viewsAfter) {
      v.parent?.removeView(v, { reason: "forward", destroy: false });
    }
    viewPrepareShow.parent.showView(viewPrepareShow, {
      reason: "forward",
      destroy: false,
    });
    this.emit(Events.RouteChange, {
      reason: "forward",
      view: viewPrepareShow,
      name: viewPrepareShow.name,
      href: viewPrepareShow.href,
      pathname: viewPrepareShow.pathname,
      query: viewPrepareShow.query,
    });
    this.emit(Events.Forward);
    this.emit(Events.StateChange, { ...this.state });
  }
  reload() {
    // 销毁再初始化？
  }
  /** 销毁所有页面，然后前往指定路由 */
  destroyAllAndPush(
    name: K,
    query: Record<string, string> = {},
    options: Partial<{
      /** 不变更 history stack */
      ignore: boolean;
    }> = {},
  ) {
    const resolvedName = this.resolveLayoutDefaultName(name);
    if (resolvedName !== name) {
      return this.destroyAllAndPush(resolvedName, query, options);
    }
    // console.log("-----------");
    // console.log("[DOMAIN]history/index - push target url is", name, "and cur href is", this.$router.href);
    const { ignore } = options;
    // if (this.isLayout(name)) {
    //   console.warn("[timeless]history/index - the target url is layout", name);
    //   return;
    // }
    const route1 = this.routes[name];
    if (!route1) {
      console.warn("[timeless]history/index - push 2. no matched route", name);
      return;
    }
    const unique_key = [route1.pathname, qs_stringify(query)]
      .filter(Boolean)
      .join("?");
    if (unique_key === this.$router.href) {
      console.warn(
        "[timeless]history/index - push target url",
        unique_key,
        this.$router.href,
      );
      return;
    }
    // @todo 这里不能写死 root
    const v1 = this.views["root"];
    const v2 = this.views["root.home_layout"];
    const kk = Object.keys(this.views);
    for (let i = 0; i < kk.length; i += 1) {
      (() => {
        const v = kk[i];
        if (["root", "root.home_layout"].includes(v)) {
          return;
        }
        const view = this.views[v];
        view.unmount();
      })();
    }
    this.views = {
      ["root"]: v1,
      ["root.home_layout"]: v2,
    };
    const route = (() => {
      const m = this.routes[name];
      if (!m) {
        return null;
      }
      return m;
    })();
    if (!route) {
      console.log(
        "[DOMAIN]history/index - push 2. no matched route",
        unique_key,
      );
      return null;
    }
    const created = new RouteViewCore({
      name: route.name,
      pathname: route.pathname,
      title: route.title,
      query,
      animation: route.options?.animation,
      layout: !!route.layout,
      defaultName: route.defaultName,
      notfoundFallbackName: route.notfoundFallbackName,
      is_default: !!route.is_default,
      is_notfound_fallback: !!route.is_notfound_fallback,
      parent: null,
    });
    // created.onUnmounted(() => {
    //   this.stacks = this.stacks.filter((s) => s.key !== created.key);
    //   delete this.views[uniqueKey];
    // });
    this.views[unique_key] = created;
    this.views[route.name] = created;
    this.ensureParent(created, query);
    if (!created.parent) {
      console.log("[DOMAIN]history/index - push 3. ", route.name);
      return;
    }
    this.$router.href = created.href;
    this.$router.name = created.name;
    // const viewsAfter = this.stacks.slice(this.cursor);
    // for (let i = 0; i < viewsAfter.length; i += 1) {
    //   const v = viewsAfter[i];
    //   v.hide();
    // }
    this.stacks = this.stacks.slice(0, this.cursor + 1).concat(created);
    this.cursor += 1;
    created.parent.showView(created, {
      reason: "show_sibling",
      destroy: false,
    });
    this.emit(Events.RouteChange, {
      reason: "push",
      view: created,
      name,
      href: created.href,
      pathname: created.pathname,
      query: created.query,
      ignore,
    });
    // this.emit(Events.TopViewChange, created);
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 跳转到兄弟页面 */
  // pushSibling() {

  // }
  ensureParent(view: RouteViewCore, query?: Record<string, string>) {
    const { name } = view;
    if (view.parent) {
      if (view.parent.pathname === "/") {
        return;
      }
      this.ensureParent(view.parent);
      return;
    }
    const route = this.routes[name as K];
    if (!route) {
      return;
    }
    const { parent } = route;
    // 父视图不应受子视图 query 影响，使用父视图的 name 作为稳定查找 key
    const parentLookupKey = parent.name;

    if (this.views[parentLookupKey]) {
      view.parent = this.views[parentLookupKey];
      if (parent.name === "root") {
        return;
      }
      this.ensureParent(this.views[parentLookupKey]);
      return;
    }
    const parent_route = this.routes[parent.name as K];
    if (!parent_route) {
      return null;
    }
    const created_parent = new RouteViewCore({
      name: parent_route.name,
      pathname: parent_route.pathname,
      title: parent_route.title,
      // 父视图保持自身稳定的 query（与子视图解耦）
      query: {},
      layout: !!parent_route.layout,
      defaultName: parent_route.defaultName,
      notfoundFallbackName: parent_route.notfoundFallbackName,
      is_default: !!parent_route.is_default,
      is_notfound_fallback: !!parent_route.is_notfound_fallback,
      parent: null,
    });
    // 仅用稳定 key 存储父视图，确保所有子视图复用同一个父视图实例
    this.views[parentLookupKey] = created_parent;
    view.parent = created_parent;
    this.ensureParent(created_parent);
  }
  buildURL(name: K, query: Record<string, string> = {}) {
    const resolvedName = this.resolveLayoutDefaultName(name);
    if (resolvedName !== name) {
      return this.buildURL(resolvedName, query);
    }
    const route = (() => {
      const m = this.routes[name];
      if (!m) {
        return null;
      }
      return m;
    })();
    if (!route) {
      console.log("[DOMAIN]history/index - push 2. no matched route", name);
      return this.routes["root.notfound" as K]!.pathname as string;
    }
    const created = new RouteViewCore({
      name: route.name,
      pathname: route.pathname,
      title: route.title,
      query,
      layout: !!route.layout,
      defaultName: route.defaultName,
      notfoundFallbackName: route.notfoundFallbackName,
      is_default: !!route.is_default,
      is_notfound_fallback: !!route.is_notfound_fallback,
      parent: null,
    });
    return created.buildUrl(query);
  }
  buildURLWithPrefix(name: K, query: Record<string, string> = {}) {
    const resolvedName = this.resolveLayoutDefaultName(name);
    if (resolvedName !== name) {
      return this.buildURLWithPrefix(resolvedName, query);
    }
    const route = (() => {
      const m = this.routes[name];
      if (!m) {
        return null;
      }
      return m;
    })();
    if (!route) {
      console.log("[DOMAIN]history/index - push 2. no matched route", name);
      return this.routes["root.notfound" as K]!.pathname as string;
    }
    const created = new RouteViewCore({
      name: route.name,
      pathname: route.pathname,
      title: route.title,
      query,
      layout: !!route.layout,
      defaultName: route.defaultName,
      notfoundFallbackName: route.notfoundFallbackName,
      is_default: !!route.is_default,
      is_notfound_fallback: !!route.is_notfound_fallback,
      parent: null,
    });
    return created.buildUrlWithPrefix(query);
  }
  isRoot(name: K) {
    const route = this.routes[name];
    if (!route) {
      return null;
    }
    return !route.parent;
  }
  isLayout(name: K) {
    const route = this.routes[name];
    if (!route) {
      return null;
    }
    return route.layout;
  }
  handleClickLink(params: { href: string; target: null | string }) {
    const { href, target } = params;
    this.emit(Events.ClickLink, { href, target });
  }

  onTopViewChange(handler: Handler<TheTypesOfEvents[Events.TopViewChange]>) {
    return this.on(Events.TopViewChange, handler);
  }
  onRouteChange(handler: Handler<TheTypesOfEvents[Events.RouteChange]>) {
    return this.on(Events.RouteChange, handler);
  }
  onBack(handler: Handler<TheTypesOfEvents[Events.Back]>) {
    return this.on(Events.Back, handler);
  }
  onForward(handler: Handler<TheTypesOfEvents[Events.Forward]>) {
    return this.on(Events.Forward, handler);
  }
  onClickLink(handler: Handler<TheTypesOfEvents[Events.ClickLink]>) {
    return this.on(Events.ClickLink, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
