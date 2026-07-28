/**
 * @file 仅负责「地址」的核心类
 * 包括 URL 解析、应用等
 */
import { BaseDomain, Handler } from "@timeless/inner-base";
import { qs_parse } from "@timeless/inner-utils";
import { JSONObject } from "@timeless/inner-types";

function baseOrigin(origin: string) {
  if (origin) {
    return origin;
  }
  return "http://localhost";
}

function withPrefix(url: string) {
  const prefix = NavigatorCore.prefix || "";
  return (prefix + url).replace(/^\/\//, "/");
}

function parse(url: string) {
  let u: URL;
  const isAbsolute =
    url &&
    (url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("//"));
  try {
    u = new URL(url);
  } catch (e) {
    u = new URL(url, "http://localhost");
  }
  return {
    pathname: u.pathname,
    query: u.search,
    search: u.search,
    href: isAbsolute ? u.href : url,
    origin: isAbsolute ? u.origin : "",
    protocol: isAbsolute ? u.protocol : "",
    host: isAbsolute ? u.host : "",
    hostname: isAbsolute ? u.hostname : "",
    port: isAbsolute ? u.port : "",
    hash: u.hash,
    auth: u.username || u.password ? `${u.username}:${u.password}` : "",
  };
}

enum Events {
  PushState,
  ReplaceState,
  PopState,
  Back,
  Forward,
  Reload,
  Start,
  PathnameChange,
  /** 销毁所有页面并跳转至指定页面 */
  Relaunch,
  /** ???? */
  RedirectToHome,
  HistoriesChange,
}
type TheTypesOfEvents = {
  [Events.PathnameChange]: {
    pathname: string;
    search: string;
    type: RouteAction;
  };
  [Events.PushState]: {
    from: string | null;
    to: string | null;
    path: string;
    pathname: string;
  };
  [Events.ReplaceState]: {
    from: string | null;
    path: string;
    pathname: string;
  };
  [Events.PopState]: {
    type: string;
    href: string;
    pathname: string;
  };
  [Events.Back]: void;
  [Events.Forward]: void;
  [Events.Reload]: void;
  [Events.Start]: RouteLocation;
  [Events.Relaunch]: void;
  [Events.HistoriesChange]: {
    pathname: string;
    href: string;
  }[];
};
type RouteLocation = {
  host: string;
  protocol: string;
  origin: string;
  pathname: string;
  href: string;
  search: string;
};
type ParamConfigure = {
  name: string;
  prefix: string;
  suffix: string;
  pattern: string;
  modifier: string;
};
type RouteConfigure = {
  title: string;
  component: unknown;
  /** 子路由 */
  child?: NavigatorCore;
};
type NavigatorState = {
  pathname: string;
  query: JSONObject;
  params: JSONObject;
  search: string;
  location: string;
};

export class NavigatorCore extends BaseDomain<TheTypesOfEvents> {
  static prefix: string | null = null;
  static parse(url: string) {
    const { pathname, query: query_str, ...rest } = parse(url);
    const query = qs_parse(query_str, { ignoreQueryPrefix: true }) as Record<
      string,
      string
    >;
    if (NavigatorCore.prefix && pathname.startsWith(NavigatorCore.prefix)) {
      return {
        ...rest,
        query,
        pathname: pathname.replace(NavigatorCore.prefix, ""),
      };
    }
    return {
      ...rest,
      query,
      pathname,
    };
  }

  unique_id = "NavigatorCore";
  debug = false;

  name = "root";
  /** 当前 pathname */
  pathname: string = "/";
  /** 当前路由的 query */
  query: Record<string, string> = {};
  /** 当前路由的 params */
  params: Record<string, string> = {};
  /** 当前 URL */
  location: Partial<RouteLocation> = {};
  href: string = "/";
  histories: { pathname: string; href: string }[] = [];
  prevHistories: { pathname: string; href: string }[] = [];
  /** 发生跳转前的 pathname */
  prevPathname: string | null = null;

  /** router 基础信息 */
  // host: string;
  // protocol: string;
  origin = "";
  host = "";

  _pending: {
    pathname: string;
    search: string;
    type: RouteAction;
  } = {
    pathname: "/",
    search: "",
    type: "initialize",
  };

  get state() {
    return {
      pathname: this.pathname,
      search: this._pending.search,
      params: this.params,
      query: this.query,
      location: this.location,
    };
  }

  /** 启动路由监听 */
  async prepare(location: RouteLocation) {
    const { host, pathname, href, search, origin } = location;
    // console.log("[DOMAIN]router - prepare", location);
    let clean_pathname = pathname;
    if (
      NavigatorCore.prefix &&
      NavigatorCore.prefix.match(/^\/[a-z0-9A-Z]{1,}/)
    ) {
      clean_pathname = pathname.replace(NavigatorCore.prefix!, "");
    }
    this.setPathname(clean_pathname);
    this.origin = origin;
    this.host = host;
    this.location = location;
    // this.pathname = pathname;
    const query = buildQuery(href);
    this.query = query;
    this._pending = {
      pathname: clean_pathname,
      search,
      type: "initialize",
    };
    this.histories = [
      {
        pathname: clean_pathname,
        href: search ? clean_pathname + search : clean_pathname,
      },
    ];
  }
  start() {
    const { pathname, search } = this._pending;
    this.setPathname(pathname);
    this.histories = [
      {
        pathname,
        href: search ? pathname + search : pathname,
      },
    ];
    this.emit(Events.PathnameChange, { ...this._pending });
  }
  private setPrevPathname(p: string) {
    this.prevPathname = p;
  }
  private setPathname(p: string) {
    this.pathname = p;
  }
  /** 调用该方法来「改变地址」 */
  pushState(url: string) {
    const u =
      url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"))
        ? url
        : withPrefix(url);
    const r = new URL(u, baseOrigin(this.origin));
    const { pathname: browserPathname, search } = r;
    const prevPathname = this.pathname;
    this.setPrevPathname(prevPathname);
    const cleanPathname = (() => {
      const prefix = NavigatorCore.prefix;
      if (
        prefix &&
        prefix.match(/^\/[a-z0-9A-Z]{1,}/) &&
        browserPathname.startsWith(prefix)
      ) {
        const next = browserPathname.replace(prefix, "");
        return next || "/";
      }
      return browserPathname;
    })();
    this.setPathname(cleanPathname);
    const targetHref = search ? cleanPathname + search : cleanPathname;
    // this.prevHistories = [...this.histories];
    // console.log("[DOMAIN]navigator - before push", prevPathname, realTargetPathname);
    this.histories.push({ pathname: cleanPathname, href: targetHref });
    this.emit(Events.PushState, {
      from: prevPathname,
      to: cleanPathname,
      path: browserPathname + search,
      pathname: cleanPathname,
    });
    this.emit(Events.HistoriesChange, [...this.histories]);
  }
  async replaceState(url: string) {
    const u =
      url && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"))
        ? url
        : withPrefix(url);
    const r = new URL(u, baseOrigin(this.origin));
    const { pathname: browserPathname, search } = r;
    this.setPrevPathname(this.pathname);
    const cleanPathname = (() => {
      const prefix = NavigatorCore.prefix;
      if (
        prefix &&
        prefix.match(/^\/[a-z0-9A-Z]{1,}/) &&
        browserPathname.startsWith(prefix)
      ) {
        const next = browserPathname.replace(prefix, "");
        return next || "/";
      }
      return browserPathname;
    })();
    this.setPathname(cleanPathname);
    const targetHref = search ? cleanPathname + search : cleanPathname;
    if (this.histories.length === 0) {
      this.histories = [{ pathname: cleanPathname, href: targetHref }];
    } else {
      this.histories[this.histories.length - 1] = {
        pathname: cleanPathname,
        href: targetHref,
      };
    }
    this.emit(Events.ReplaceState, {
      from: this.prevPathname,
      path: browserPathname + search,
      pathname: cleanPathname,
    });
    this.emit(Events.HistoriesChange, [...this.histories]);
    // this.emit(Events.PathnameChange, { ...this._pending });
  }
  // /** 跳转到指定路由 */
  // async push(targetPathname: string, targetQuery?: Record<string, string>) {
  //   // console.log("[DOMAIN]navigator - push", this.query);
  //   // this.log("push", targetPathname, this.prevPathname);
  //   const url = (() => {
  //     if (targetPathname.startsWith("http")) {
  //       return targetPathname;
  //     }
  //     const p = `${NavigatorCore.prefix}${targetPathname}`;
  //     return `${this.origin}${p}`;
  //   })();
  //   const r = new URL(url);
  //   const { pathname: realTargetPathname, search } = r;
  //   const query = targetQuery || buildQuery(search);
  //   const remainingFields = extractDefinedKeys(this.query, ["token"]);
  //   this.query = {
  //     ...query,
  //     ...remainingFields,
  //   };
  //   if (this.pathname === realTargetPathname) {
  //     console.log("cur pathname has been", targetPathname);
  //     return;
  //   }
  //   const prevPathname = this.pathname;
  //   this.setPrevPathname(prevPathname);
  //   this.setPathname(realTargetPathname);
  //   this.histories.push({ pathname: realTargetPathname });
  //   // this.emit(Events.PushState, {
  //   //   from: this.prevPathname,
  //   //   to: realTargetPathname,
  //   //   // 这里似乎不用 this.origin，只要是 / 开头的，就会拼接在后面
  //   //   path: (() => {
  //   //     let url = `${this.origin}${realTargetPathname}`;
  //   //     url += "?" + query_stringify(this.query);
  //   //     return url;
  //   //   })(),
  //   //   pathname: realTargetPathname,
  //   // });
  //   this._pending = {
  //     pathname: realTargetPathname,
  //     search,
  //     type: "push",
  //   };
  //   this.emit(Events.PathnameChange, { ...this._pending });
  // }
  // back = () => {
  //   // this.emit(Events.Back);
  // };
  // reload = () => {
  //   // this.emit(Events.Reload);
  // };
  // popstate({ type, href, pathname }: { type: string; href: string; pathname: string }) {
  //   this.emit(Events.PopState, { type, href, pathname });
  // }
  /** 外部路由改变（点击浏览器前进、后退），作出响应 */
  handlePopState({
    type,
    pathname,
    href,
  }: {
    type: string;
    href: string;
    pathname: string;
  }) {
    console.log(
      "[DOMAIN]navigator/index - handlePopState",
      type,
      this.pathname,
      this.prevHistories,
    );
    if (type !== "popstate") {
      return;
    }
    // 移除 prefix 以获取正确的 pathname
    let targetPathname = pathname;
    if (NavigatorCore.prefix && pathname.startsWith(NavigatorCore.prefix)) {
      targetPathname = pathname.replace(NavigatorCore.prefix, "");
    }
    // 从完整 URL 中提取 search，构建与 RouteViewCore.href 匹配的相对 href
    const parsedUrl = (() => {
      try {
        return new URL(href);
      } catch (e) {
        return new URL(href, "http://localhost");
      }
    })();
    const search = parsedUrl.search;
    const targetHref = search ? targetPathname + search : targetPathname;

    const prevPathname = this.pathname;
    this.setPrevPathname(prevPathname);
    this.setPathname(targetPathname);
    this.href = targetHref;
    const isForward = (() => {
      if (this.prevHistories.length === 0) {
        return false;
      }
      const lastStackWhenBack =
        this.prevHistories[this.prevHistories.length - 1];
      // 使用 href 而非 pathname 判断前进/后退，因为同一路由不同 query 的 pathname 相同
      if (lastStackWhenBack?.href === targetHref) {
        return true;
      }
      return false;
    })();
    this._pending = {
      pathname,
      search: "",
      type: (() => {
        if (isForward) {
          return "forward";
        }
        return "back";
      })(),
    };
    // this.emit(Events.PathnameChange, { ...this._pending });
    // forward
    if (isForward) {
      this.setPrevPathname(this.pathname);
      this.setPathname(targetPathname);
      const lastStackWhenBack = this.prevHistories.pop();
      if (lastStackWhenBack) {
        this.histories = this.histories.concat([lastStackWhenBack]);
      }
      this.emit(Events.Forward);
      this.emit(Events.HistoriesChange, [...this.histories]);
      this.emit(Events.PopState, { type: "forward", pathname, href });
      return;
    }
    // back
    this.emit(Events.Back);
    const theHistoryDestroy = this.histories[this.histories.length - 1];
    this.prevHistories = this.prevHistories
      .concat([theHistoryDestroy])
      .filter(Boolean);
    this.setPrevPathname(this.pathname);
    this.setPathname(targetPathname);
    console.log(
      "[DOMAIN]navigator - before pop",
      this.histories.map((h) => h.pathname),
    );
    const cloneStacks = this.histories.slice(0, this.histories.length - 1);
    this.histories = cloneStacks.filter(Boolean);
    this.emit(Events.HistoriesChange, [...this.histories]);
    this.emit(Events.PopState, { type: "back", pathname, href });
  }

  onStart(handler: Handler<TheTypesOfEvents[Events.Start]>) {
    return this.on(Events.Start, handler);
  }
  onHistoryChange(handler: Handler<TheTypesOfEvents[Events.HistoriesChange]>) {
    return this.on(Events.HistoriesChange, handler);
  }
  onPushState(handler: Handler<TheTypesOfEvents[Events.PushState]>) {
    return this.on(Events.PushState, handler);
  }
  onReplaceState(handler: Handler<TheTypesOfEvents[Events.ReplaceState]>) {
    return this.on(Events.ReplaceState, handler);
  }
  onPopState(handler: Handler<TheTypesOfEvents[Events.PopState]>) {
    return this.on(Events.PopState, handler);
  }
  onReload(handler: Handler<TheTypesOfEvents[Events.Reload]>) {
    return this.on(Events.Reload, handler);
  }
  onPathnameChange(handler: Handler<TheTypesOfEvents[Events.PathnameChange]>) {
    return this.on(Events.PathnameChange, handler);
  }
  onBack(handler: Handler<TheTypesOfEvents[Events.Back]>) {
    return this.on(Events.Back, handler);
  }
  onForward(handler: Handler<TheTypesOfEvents[Events.Forward]>) {
    return this.on(Events.Forward, handler);
  }
  onRelaunch(handler: Handler<TheTypesOfEvents[Events.Relaunch]>) {
    return this.on(Events.Relaunch, handler);
  }
  onHistoriesChange(
    handler: Handler<TheTypesOfEvents[Events.HistoriesChange]>,
  ) {
    return this.on(Events.HistoriesChange, handler);
  }
}

export type RouteAction =
  | "initialize"
  | "push"
  | "replace"
  | "back"
  | "forward";

function buildQuery(path: string) {
  const [, search] = path.split("?");
  if (!search) {
    return {} as Record<string, string>;
  }
  return qs_parse(search) as Record<string, string>;
}

type ExtractDefinedKeys<T, K extends keyof T> = {
  [key in K]: T[key] extends undefined ? never : T[key];
};
function extractDefinedKeys<T extends any, K extends keyof T>(
  obj: T,
  keys: K[],
): ExtractDefinedKeys<T, K> {
  const result = {} as ExtractDefinedKeys<T, K>;
  for (const key of keys) {
    // @ts-ignore
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      result[key] = obj[key] as ExtractDefinedKeys<T, K>[typeof key];
    }
  }
  return result;
}
