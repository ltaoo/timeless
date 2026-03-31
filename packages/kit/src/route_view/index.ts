/**
 * @file 根据路由判断是否可见的视图块
 */
import { refobj } from "@timeless/reactive";
import { base, BaseDomain, Handler, BizError } from "@timeless/base";
import { PresenceCore } from "@timeless/ui";
import { qs_parse, qs_stringify } from "@timeless/utils";

import { NavigatorCore } from "@/navigator/index";
import { HistoryCore } from "@/history";

import {
  build,
  buildUrl,
  OriginalRouteConfigure,
  PageKeysType,
  PathnameKey,
  RouteConfig,
} from "./utils";

enum Events {
  SubViewChanged,
  SubViewRemoved,
  SubViewAppended,
  /** 子视图改变（数量 */
  SubViewsChange,
  /** 当前展示的子视图改变 */
  CurSubViewChange,
  /** 有视图变为可见状态 */
  ViewShow,
  /** 视图加载好 */
  Ready,
  /** 当前视图载入页面 */
  Mounted,
  BeforeShow,
  /** 当前视图变为可见，稍晚于 Mounted 事件 */
  Show,
  BeforeHide,
  /** 当前视图变为隐藏 */
  Hidden,
  /** 当前视图从页面卸载 */
  Unmounted,
  /** 被其他视图覆盖 */
  Layered,
  /** 覆盖自身的视图被移开 */
  Uncover,
  Start,
  StateChange,
  /** 子视图匹配上了 */
  Match,
  NotFound,
}
type TheTypesOfEvents = {
  [Events.SubViewChanged]: RouteViewCore;
  [Events.SubViewRemoved]: RouteViewCore;
  [Events.SubViewAppended]: RouteViewCore;
  [Events.SubViewsChange]: RouteViewCore[];
  [Events.CurSubViewChange]: RouteViewCore;
  [Events.Ready]: void;
  [Events.Mounted]: void;
  [Events.ViewShow]: RouteViewCore[];
  [Events.BeforeShow]: void;
  [Events.Show]: void;
  [Events.BeforeHide]: void;
  [Events.Hidden]: void;
  [Events.Layered]: void;
  [Events.Uncover]: void;
  [Events.Unmounted]: void;
  [Events.Start]: { pathname: string };
  [Events.StateChange]: RouteViewCoreState;
  [Events.Match]: RouteViewCore;
  [Events.NotFound]: void;
};

type RouteViewCoreState = {
  /** 是否加载到页面上（如果有动画，在隐藏动画播放时该值仍为 true，在 animation end 后从视图上卸载后，该值被置为 false） */
  mounted: boolean;
  /** 是否可见，用于判断是「进入动画」还是「退出动画」 */
  visible: boolean;
  /** 被另一视图覆盖 */
  layered: boolean;
};
type RouteViewCoreProps = {
  /** 唯一标志 */
  name: string;
  pathname: string;
  title: string;
  // component: unknown;
  parent?: RouteViewCore | null;
  query?: Record<string, string>;
  visible?: boolean;
  /** 该视图是布局视图 */
  layout?: boolean;
  defaultName?: string;
  notfoundFallbackName?: string;
  is_default?: boolean;
  is_notfound_fallback?: boolean;
  animation?: Partial<{
    in: string;
    out: string;
    show: string;
    hide: string;
  }>;
  children?: RouteViewCore[];
  views?: RouteViewCore[];

  // destroyAfterHide?: boolean;
};

export class RouteViewCore extends BaseDomain<TheTypesOfEvents> {
  unique_id = "ViewCore";
  debug = false;
  id = this.uid();

  /** 一些配置项 */
  name: string;
  pathname: string;
  title: string;
  layout = false;
  defaultName: string | undefined;
  notfoundFallbackName: string | undefined;
  is_default = false;
  is_notfound_fallback = false;
  animation: Partial<{
    in: string;
    out: string;
    show: string;
    hide: string;
  }> = {
    in: "fade-in",
    out: "fade-out",
  };
  /** 当前视图的 query */
  query: Record<string, string> = {};
  /** 当前视图的 params */
  params: Record<string, string> = {};
  // visible = false;
  _showed = false;
  loaded = false;
  mounted = true;
  layered = false;
  isRoot = false;

  parent: RouteViewCore | null;
  /** 当前子视图 */
  curView: RouteViewCore | null = null;
  /** 当前所有的子视图 */
  subViews: RouteViewCore[] = [];

  $presence = new PresenceCore();

  get state(): RouteViewCoreState {
    return {
      mounted: this.mounted,
      visible: this.visible,
      layered: this.layered,
    };
  }
  get href() {
    return [this.pathname, qs_stringify(this.query)].filter(Boolean).join("?");
  }
  get visible() {
    return this.$presence.visible;
  }
  // get animation() {
  //   return this.options?.animation;
  // }

  constructor(options: Partial<{ _name: string }> & RouteViewCoreProps) {
    super(options);
    const {
      name,
      pathname,
      title,
      query = {},
      visible = false,
      layout = false,
      defaultName,
      notfoundFallbackName,
      is_default = false,
      is_notfound_fallback = false,
      animation = {},
      parent = null,
      views = [],
    } = options;
    this.name = name;
    this.pathname = pathname;
    this.parent = parent;
    this.title = title;
    this.unique_id = title;
    this.layout = !!layout;
    this.defaultName = defaultName;
    this.notfoundFallbackName = notfoundFallbackName;
    this.is_default = !!is_default;
    this.is_notfound_fallback = !!is_notfound_fallback;
    this.animation = animation;
    this.subViews = views;
    // console.log("[DOMAIN]route_view - constructor", title, { destroyAfterHide });
    if (views.length) {
      this.curView = views[0];
    }
    // this.visible = visible;
    this.query = query;
    if (visible) {
      this.mounted = true;
    }
    for (let i = 0; i < views.length; i += 1) {
      const view = views[i];
      view.parent = this;
    }

    this.$presence.onStateChange((nextState) => {
      const { visible, mounted } = nextState;
      // console.log("[ROUTE_VIEW]this.presence.onStateChange", this.title, this.state.visible, open, mounted);
      // console.log(performance.now());
      const prevVisible = this.state.visible;
      // this.visible = open;
      if (prevVisible === false && visible) {
        this.setShow();
      }
      if (prevVisible && visible === false) {
        this.setHidden();
      }
      this.mounted = !!mounted;
      this.emit(Events.StateChange, { ...this.state });
    });
    this.$presence.onUnmounted(() => {
      this.emit(Events.Unmounted);
    });
    emitViewCreated(this);
  }
  appendView(view: RouteViewCore) {
    view.parent = this;
    if (this.subViews.length === 0 && view.visible) {
      // console.log("[DOMAIN]route_view - before this.curView = view 1", view.title);
      this.curView = view;
    }
    if (!this.subViews.includes(view)) {
      this.emit(Events.SubViewAppended, view);
      this.subViews.push(view);
    }
    // console.log("[DOMAIN]route_view - appendView", this.title, this.subViews, view);
    this.emit(Events.SubViewsChange, [...this.subViews]);
  }
  replaceViews(views: RouteViewCore[]) {
    this.subViews = views;
    this.emit(Events.SubViewsChange, [...this.subViews]);
  }
  /** 移除（卸载）一个子视图 */
  removeView(
    view: RouteViewCore,
    options: Partial<{
      reason: "show_sibling" | "back" | "forward";
      destroy: boolean;
      callback: () => void;
    }> = {},
  ) {
    // const { reason, destroy, callback } = options;
    // console.log("[DOMAIN]route_view - removeView", this.title, view.title);
    // console.log("[DOMAIN]route_view - removeView", this.title, view.title);
    if (!this.subViews.includes(view)) {
      console.warn("the view is not the child view");
      return;
    }
    view.onUnmounted(() => {
      // console.log("[DOMAIN]route_view - removeView in removeView.onUnmounted", this.title, view.title);
      // console.log(performance.now());
      view.destroy();
      // view.setUnmounted();
      this.subViews = this.subViews.filter((v) => v !== view);
      if (options.callback) {
        options.callback();
      }
      // console.log("[DOMAIN]route_view - removeView before Events.ViewsChange", this.title, view.title);
      this.emit(Events.SubViewRemoved, view);
      this.emit(Events.SubViewsChange, [...this.subViews]);
    });
    // console.log();
    // console.log("[DOMAIN]route_view - removeView before view.hide", this.title, view.title, performance.now());
    view.hide({
      reason: options.reason,
      destroy: options.destroy,
    });
    // destroy=false 时 PresenceCore 不会触发 Unmounted，不会走上面的 onUnmounted 回调
    // 需要主动清除 curView 引用，避免后续 showView 返回 early 时 curView 仍指向已隐藏的子视图
    if (options.destroy === false && this.curView === view) {
      this.curView = null;
      this.emit(Events.CurSubViewChange, null as any);
    }
    this.emit(Events.SubViewChanged, view);
    this.emit(Events.SubViewsChange, [...this.subViews]);
  }
  findCurView(): RouteViewCore | null {
    if (!this.curView) {
      return this;
    }
    return this.curView.findCurView();
  }
  ready() {
    this.emit(Events.Ready);
  }
  /** 让自身的一个子视图变为可见 */
  showView(
    sub_view: RouteViewCore,
    options: Partial<{
      reason: "show_sibling" | "back" | "forward";
      destroy: boolean;
    }> = {},
  ) {
    // console.log("[DOMAIN]route_view - showView", "parent:", this.title, "sub_view:", sub_view.title, "curView:", this.curView?.title, "sub_view.visible:", sub_view.visible, "options:", options);
    if (sub_view === this) {
      console.warn("cannot show self");
      return;
    }
    if (sub_view.visible) {
      console.warn("the sub view has been visible", sub_view.name);
      // 即使子视图已可见，也需要将旧的 curView 隐藏，避免 curView 引用过期
      if (
        (options.reason === "show_sibling" ||
          options.reason === "back" ||
          options.reason === "forward") &&
        this.curView &&
        this.curView !== sub_view
      ) {
        this.curView.hide(options);
        this.curView = null;
      }
      return;
    }
    (() => {
      if (!this.visible) {
        // 如果自身是不可见状态，先让自身的父视图将自己 show
        // console.log("[DOMAIN]route_view - show self by parent", this.title, this.parent?.title);
        if (!this.parent) {
          if (!this.isRoot) {
            console.warn("no parent");
          }
          return;
        }
        this.parent.showView(this, options);
      }
    })();
    // 在显示新视图之前，隐藏当前视图
    if (
      (options.reason === "show_sibling" ||
        options.reason === "back" ||
        options.reason === "forward") &&
      this.curView
    ) {
      console.log("[DOMAIN]route_view - hiding curView", this.curView.title);
      this.curView.hide(options);
    }
    this.appendView(sub_view);
    this.emit(Events.BeforeShow);
    // console.log("[DOMAIN]route_view - before this.curView = view", sub_view.title);
    this.curView = sub_view;
    sub_view.show();
    this.emit(Events.CurSubViewChange, this.curView);
  }
  /** 清除当前子视图（隐藏并通知） */
  clearCurView(
    options: Partial<{
      reason: "show_sibling" | "back" | "forward";
      destroy: boolean;
    }> = {},
  ) {
    if (!this.curView) {
      return;
    }
    this.curView.hide(options);
    this.curView = null;
    this.emit(Events.CurSubViewChange, null as any);
  }
  /** 主动展示视图 */
  show() {
    // console.log("[ROUTE_VIEW]show", this.title, "visible:", this.visible, "mounted:", this.mounted);
    if (this.visible) {
      // 为了让 presence 内部 hide 时判断 mounted 为 true
      this.$presence.state.mounted = true;
      // console.log("[ROUTE_VIEW]show - already visible, return");
      return;
    }
    this.$presence.show();
  }
  /** 主动隐藏自身视图 */
  hide(
    options: Partial<{
      reason: "show_sibling" | "back" | "forward";
      destroy: boolean;
    }> = {},
  ) {
    // console.log("[DOMAIN]route_view - hide", this.title, options);
    if (this.visible === false) {
      console.warn("has been hide");
      return;
    }
    for (let i = 0; i < this.subViews.length; i += 1) {
      const view = this.subViews[i];
      // 子视图先隐藏
      view.hide(options);
    }
    this.emit(Events.BeforeHide);
    this.$presence.hide({
      reason: options.reason,
      destroy: options.destroy,
    });
  }
  /** 视图在页面上展示（变为可见） */
  setShow() {
    // console.log("[DOMAIN]route_view/index - showed", this.title, this._showed);
    if (this._showed) {
      return;
    }
    this._showed = true;
    // console.log("[ROUTE_VIEW]emit showed", this._name);
    this.emit(Events.Show);
  }
  /** 视图在页面上隐藏（变为不可见） */
  setHidden() {
    console.log("[DOMAIN]route_view/index - hidden", this.title, this._showed);
    this._showed = false;
    this.emit(Events.Hidden);
  }
  mount() {
    this.setMounted();
  }
  /** 卸载自身 */
  unmount() {
    // console.log("[]unmount", this.subViews);
    this.subViews = [];
    this.emit(Events.StateChange, { ...this.state });
    // console.log("[DOMAIN]route_view - unmount", this.title);
    this.onHidden(() => {
      this.destroy();
      this.setUnmounted();
    });
    this.hide();
  }
  /** 视图被装载到页面 */
  setMounted() {
    if (this.mounted) {
      return;
    }
    this.mounted = true;
    this.emit(Events.Mounted);
  }
  /** 视图从页面被卸载 */
  setUnmounted() {
    this.mounted = false;
    this.emit(Events.Unmounted);
  }
  /** 页面组件已加载 */
  setLoaded() {
    this.loaded = true;
  }
  /** 页面组件未加载 */
  setUnload() {
    this.loaded = false;
  }
  buildUrl(query: Record<string, string | number>) {
    const url = buildUrl(this.pathname, this.params, query);
    return url;
  }
  buildUrlWithPrefix(query: Record<string, string | number>) {
    const url = buildUrl(this.pathname, this.params, query);
    return [NavigatorCore.prefix, url].join("");
  }

  onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
    return this.on(Events.Start, handler);
  }
  onReady(handler: Handler<TheTypesOfEvents[Events.Ready]>) {
    return this.on(Events.Ready, handler);
  }
  onMounted(handler: Handler<TheTypesOfEvents[Events.Mounted]>) {
    return this.on(Events.Mounted, handler);
  }
  onViewShow(handler: Handler<TheTypesOfEvents[Events.ViewShow]>) {
    return this.on(Events.ViewShow, handler);
  }
  onBeforeShow(handler: Handler<TheTypesOfEvents[Events.BeforeShow]>) {
    return this.on(Events.BeforeShow, handler);
  }
  onShow(handler: Handler<TheTypesOfEvents[Events.Show]>) {
    return this.on(Events.Show, handler);
  }
  onBeforeHide(handler: Handler<TheTypesOfEvents[Events.BeforeHide]>) {
    return this.on(Events.BeforeHide, handler);
  }
  onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>) {
    return this.on(Events.Hidden, handler);
  }
  onLayered(handler: Handler<TheTypesOfEvents[Events.Layered]>) {
    return this.on(Events.Layered, handler);
  }
  onUncover(handler: Handler<TheTypesOfEvents[Events.Uncover]>) {
    return this.on(Events.Uncover, handler);
  }
  onUnmounted(handler: Handler<TheTypesOfEvents[Events.Unmounted]>) {
    return this.on(Events.Unmounted, handler);
  }
  onSubViewChanged(handler: Handler<TheTypesOfEvents[Events.SubViewChanged]>) {
    return this.on(Events.SubViewChanged, handler);
  }
  onSubViewAppended(
    handler: Handler<TheTypesOfEvents[Events.SubViewAppended]>,
  ) {
    return this.on(Events.SubViewAppended, handler);
  }
  onSubViewRemoved(handler: Handler<TheTypesOfEvents[Events.SubViewRemoved]>) {
    return this.on(Events.SubViewRemoved, handler);
  }
  onSubViewsChange(handler: Handler<TheTypesOfEvents[Events.SubViewsChange]>) {
    return this.on(Events.SubViewsChange, handler);
  }
  onCurViewChange(handler: Handler<TheTypesOfEvents[Events.CurSubViewChange]>) {
    return this.on(Events.CurSubViewChange, handler);
  }
  onMatched(handler: Handler<TheTypesOfEvents[Events.Match]>) {
    return this.on(Events.Match, handler);
  }
  onNotFound(handler: Handler<TheTypesOfEvents[Events.NotFound]>) {
    return this.on(Events.NotFound, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
// type ParamConfigure = {
//   name: string;
//   prefix: string;
//   suffix: string;
//   pattern: string;
//   modifier: string;
// };
// function buildParams(opt: { regexp: RegExp; targetPath: string; keys: ParamConfigure[] }) {
//   const { regexp, keys, targetPath } = opt;
//   const match = regexp.exec(targetPath);
//   if (match) {
//     const params: Record<string, string> = {};
//     for (let i = 1; i < match.length; i++) {
//       params[keys[i - 1].name] = match[i];
//     }
//     return params;
//   }
//   return {};
// }
// function buildQuery(path: string) {
//   const [, search] = path.split("?");
//   if (!search) {
//     return {} as Record<string, string>;
//   }
//   return qs.parse(search) as Record<string, string>;
// }

let handler: ((views: RouteViewCore) => void) | null = null;
export function onViewCreated(fn: (views: RouteViewCore) => void) {
  handler = fn;
}
function emitViewCreated(view: RouteViewCore) {
  if (!handler) {
    return;
  }
  handler(view);
}

export function RouteMenusModel<
  T extends {
    title: string;
    name?: unknown;
    url?: unknown;
    query?: Record<string, string>;
    children?: T["name"][];
    onClick?: (m: T) => void;
  },
>(props: { view: RouteViewCore; history: HistoryCore<any, any>; menus: T[] }) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };

  let _cur = refobj(props.view.curView);
  let _menus = props.menus || [];
  let _state = {
    get menus() {
      return _menus;
    },
    cur: _cur,
  };
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  // const unlisten = props.view.onCurViewChange((view) => {
  //   _cur = view;
  // });
  const unlisten = props.history.onRouteChange(({ view }) => {
    console.log("[]RouteMenusModel", view);
    _cur.as(view);
  });

  return {
    methods,
    state: _state,
    get menus() {
      return _menus;
    },
    cur: _cur,
    isSubRoute(name: string) {
      const v = _cur.value;
      return v ? v.name.startsWith(name) : false;
    },
    isActive(name: string) {
      const v = _cur.value;
      return v ? v.name === name : false;
    },
    isSelected(t: RouteViewCore | null, menu: T) {
      if (!t) {
        return false;
      }
      const isSameRoute = t.name === menu.name;
      const isSubRoute = t.name.startsWith(menu.name as string);
      const isCustomSubRoute = menu.children?.includes(t.name);
      return isSameRoute || !!isSubRoute || !!isCustomSubRoute;
    },
    handleClick(menu: T, query?: Record<string, string>) {
      props.history.push(menu.name, query || menu.query);
    },
    ready() {},
    destroy() {
      unlisten();
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}

export { build, buildUrl };
export type { OriginalRouteConfigure, PageKeysType, PathnameKey, RouteConfig };
