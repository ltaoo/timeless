declare namespace Timeless {
// From biz/oss/index.d.ts
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
export declare function OSSManager(): {
    methods: {
        refresh(): void;
        compress(): void;
    };
    ui: {};
    state: {};
    ready(): void;
    onStateChange(handler: Handler<{}>): () => void;
};
export type OSS = {
    upload: (file: File) => void;
    onStart(handler: Handler<void>): () => void;
    onProgress(handler: Handler<{
        percent: number;
    }>): (opt: {
        percent: number;
    }) => void;
    onError(handler: Handler<BizError>): () => void;
    onSuccess(handler: Handler<{
        hash: string;
        key: string;
    }>): () => void;
    onCompleted(handler: Handler<void>): () => void;
};


// From biz/user/index.d.ts
import { BaseDomain } from "@/domains/base";
export declare class UserCore extends BaseDomain<any> {
    constructor();
}


// From domains/app/index.d.ts
/**
 * @file 应用，包含一些全局相关的事件、状态
 */
import { BaseDomain, Handler } from "@/domains/base";
import { UserCore } from "@/biz/user/index";
import { StorageCore } from "@/domains/storage/index";
import { Result } from "@/domains/result/index";
import { JSONObject } from "@/domains/types/index";
import { ThemeTypes } from "./types";
export declare enum OrientationTypes {
    Horizontal = "horizontal",
    Vertical = "vertical"
}
declare const mediaSizes: {
    sm: number;
    /** 中等设备宽度阈值 */
    md: number;
    /** 大设备宽度阈值 */
    lg: number;
    /** 特大设备宽度阈值 */
    xl: number;
    /** 特大设备宽度阈值 */
    "2xl": number;
};
export type DeviceSizeTypes = keyof typeof mediaSizes;
declare enum Events {
    Tip = 0,
    Loading = 1,
    HideLoading = 2,
    Error = 3,
    Login = 4,
    Logout = 5,
    ForceUpdate = 6,
    DeviceSizeChange = 7,
    /** 生命周期 */
    Ready = 8,
    Show = 9,
    Hidden = 10,
    /** 平台相关 */
    Resize = 11,
    Blur = 12,
    Keydown = 13,
    OrientationChange = 14,
    EscapeKeyDown = 15,
    StateChange = 16
}
type TheTypesOfEvents = {
    [Events.Ready]: void;
    [Events.Error]: Error;
    [Events.Tip]: {
        icon?: unknown;
        text: string[];
    };
    [Events.Loading]: {
        text: string[];
    };
    [Events.HideLoading]: void;
    [Events.Login]: {};
    [Events.Logout]: void;
    [Events.ForceUpdate]: void;
    [Events.Resize]: {
        width: number;
        height: number;
    };
    [Events.DeviceSizeChange]: DeviceSizeTypes;
    [Events.Keydown]: {
        code: string;
        preventDefault: () => void;
    };
    [Events.EscapeKeyDown]: void;
    [Events.Blur]: void;
    [Events.Show]: void;
    [Events.Hidden]: void;
    [Events.OrientationChange]: "vertical" | "horizontal";
    [Events.StateChange]: ApplicationState;
};
type ApplicationState = {
    ready: boolean;
    env: JSONObject;
    theme: ThemeTypes;
    deviceSize: DeviceSizeTypes;
    height: number;
};
type ApplicationProps<T extends {
    storage: StorageCore<any>;
}> = {
    user: UserCore;
    storage: T["storage"];
    /**
     * 应用加载前的声明周期，只有返回 Result.Ok() 页面才会展示内容
     */
    beforeReady?: () => Promise<Result<null>>;
    onReady?: () => void;
};
export declare class ApplicationModel<T extends {
    storage: StorageCore<any>;
}> extends BaseDomain<TheTypesOfEvents> {
    /** 用户 */
    $user: UserCore;
    $storage: T["storage"];
    lifetimes: Pick<ApplicationProps<T>, "beforeReady" | "onReady">;
    ready: boolean;
    screen: {
        statusBarHeight?: number;
        menuButton?: {
            width: number;
            left: number;
            right: number;
        };
        width: number;
        height: number;
    };
    env: {
        wechat: boolean;
        ios: boolean;
        android: boolean;
        pc: boolean;
        weapp: boolean;
        prod: "develop" | "trial" | "release";
    };
    orientation: OrientationTypes;
    curDeviceSize: DeviceSizeTypes;
    height: number;
    theme: ThemeTypes;
    safeArea: boolean;
    Events: typeof Events;
    get state(): ApplicationState;
    constructor(props: ApplicationProps<T>);
    /** 启动应用 */
    start(size: {
        width: number;
        height: number;
    }): Promise<import("@/domains/result/index").Resp<null>>;
    /** 应用指定主题 */
    setTheme(theme: ThemeTypes): import("@/domains/result/index").Resp<null>;
    getTheme(): string;
    tipUpdate(): void;
    tip(arg: {
        icon?: unknown;
        text: string[];
    }): string;
    loading(arg: {
        text: string[];
    }): {
        hideLoading: () => void;
    };
    hideLoading(): void;
    /** 手机震动 */
    vibrate(): void;
    setSize(size: {
        width: number;
        height: number;
    }): void;
    /** 设置页面 title */
    setTitle(title: string): void;
    openWindow(url: string): void;
    setEnv(env: JSONObject): void;
    setHeight(v: number): void;
    /** 复制文本到粘贴板 */
    copy(text: string): void;
    getComputedStyle(el: unknown): {};
    /** 发送推送 */
    notify(msg: {
        title: string;
        body: string;
    }): void;
    disablePointer(): void;
    enablePointer(): void;
    /** 平台相关的全局事件 */
    keydown(event: {
        code: string;
        preventDefault: () => void;
    }): void;
    escape(): void;
    resize(size: {
        width: number;
        height: number;
    }): void;
    blur(): void;
    handleScreenOrientationChange(orientation: number): void;
    handleResize(size: {
        width: number;
        height: number;
    }): void;
    onReady(handler: Handler<TheTypesOfEvents[Events.Ready]>): () => void;
    onDeviceSizeChange(handler: Handler<TheTypesOfEvents[Events.DeviceSizeChange]>): () => void;
    onUpdate(handler: Handler<TheTypesOfEvents[Events.ForceUpdate]>): () => void;
    /** 平台相关全局事件 */
    onOrientationChange(handler: Handler<TheTypesOfEvents[Events.OrientationChange]>): () => void;
    onResize(handler: Handler<TheTypesOfEvents[Events.Resize]>): () => void;
    onBlur(handler: Handler<TheTypesOfEvents[Events.Blur]>): () => void;
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>): () => void;
    onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>): () => void;
    onKeydown(handler: Handler<TheTypesOfEvents[Events.Keydown]>): () => void;
    onEscapeKeyDown(handler: Handler<TheTypesOfEvents[Events.EscapeKeyDown]>): () => void;
    onTip(handler: Handler<TheTypesOfEvents[Events.Tip]>): () => void;
    onLoading(handler: Handler<TheTypesOfEvents[Events.Loading]>): () => void;
    onHideLoading(handler: Handler<TheTypesOfEvents[Events.HideLoading]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    /**
     * ----------------
     * Event
     * ----------------
     */
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>): () => void;
}
export {};


// From domains/app/types.d.ts
export type ThemeTypes = "dark" | "light" | "system";


// From domains/base.d.ts
/**
 * 注册的监听器
 */
import { EventType, Handler } from "mitt";
export declare enum BaseEvents {
    Loading = "__loading",
    Destroy = "__destroy"
}
type TheTypesOfBaseEvents = {
    [BaseEvents.Destroy]: void;
};
type BaseDomainEvents<E> = TheTypesOfBaseEvents & E;
export declare function base<Events extends Record<EventType, unknown>>(): {
    off<Key extends keyof BaseDomainEvents<Events>>(event: Key, handler: Handler<BaseDomainEvents<Events>[Key]>): void;
    on<Key extends keyof BaseDomainEvents<Events>>(event: Key, handler: Handler<BaseDomainEvents<Events>[Key]>): () => void;
    uid: () => number;
    emit<Key extends keyof BaseDomainEvents<Events>>(event: Key, value?: BaseDomainEvents<Events>[Key]): void;
    destroy(): void;
};
export declare class BaseDomain<Events extends Record<EventType, unknown>> {
    /** 用于自己区别同名 Domain 不同实例的标志 */
    unique_id: string;
    debug: boolean;
    _emitter: import("mitt").Emitter<BaseDomainEvents<Events>>;
    listeners: Record<keyof BaseDomainEvents<Events>, (() => void)[]>;
    constructor(props?: {});
    uid(): number;
    log(...args: unknown[]): unknown[];
    errorTip(...args: unknown[]): void;
    off<Key extends keyof BaseDomainEvents<Events>>(event: Key, handler: Handler<BaseDomainEvents<Events>[Key]>): void;
    offEvent<Key extends keyof BaseDomainEvents<Events>>(k: Key): void;
    on<Key extends keyof BaseDomainEvents<Events>>(event: Key, handler: Handler<BaseDomainEvents<Events>[Key]>): () => void;
    emit<Key extends keyof BaseDomainEvents<Events>>(event: Key, value?: BaseDomainEvents<Events>[Key]): void;
    /** 主动销毁所有的监听事件 */
    destroy(): void;
    onDestroy(handler: Handler<TheTypesOfBaseEvents[BaseEvents.Destroy]>): () => void;
    get [Symbol.toStringTag](): string;
}
export declare function applyMixins(derivedCtor: any, constructors: any[]): void;
export type { Handler };
/**
 * 代码片段

import { ViewComponentProps } from "@/store/types";
import { useViewModel } from "@/hooks";
import { base, Handler } from "@/domains/base";

function HomeActionCreatePageViewModel(props: ViewComponentProps) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
  };
  const ui = {};
  let _state = {};
  enum Events {
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
    [Events.Error]: BizError;
  };
  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    ui,
    state: _state,
    ready() {},
    destroy() {
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

export function HomeActionCreatePage(props: ViewComponentProps) {
  const vm = useViewModel(HomeActionCreatePageViewModel, [props]);

  return <div>Hello</div>;
}

 */


// From domains/error/index.d.ts
export declare class BizError extends Error {
    messages: string[];
    code?: string | number;
    data: unknown | null;
    constructor(msg: string[], code?: string | number, data?: unknown);
}


// From domains/history/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { RouteViewCore } from "@/domains/route_view";
import { NavigatorCore } from "@/domains/navigator";
declare enum Events {
    TopViewChange = 0,
    RouteChange = 1,
    ClickLink = 2,
    Back = 3,
    Forward = 4,
    StateChange = 5
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
    views: Record<K, RouteViewCore>;
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
export declare class HistoryCore<K extends string, R extends Record<string, any>> extends BaseDomain<TheTypesOfEvents> {
    virtual: boolean;
    /** 路由配置 */
    routes: Record<K, R>;
    /** 加载的所有视图 */
    views: Record<string, RouteViewCore>;
    /** 按顺序依次 push 的视图 */
    stacks: RouteViewCore[];
    /** 栈指针 */
    cursor: number;
    /** 浏览器 url 管理 */
    $router: NavigatorCore;
    /** 根视图 */
    $view: RouteViewCore;
    get state(): HistoryCoreState;
    constructor(props: Partial<{
        _name: string;
    }> & HistoryCoreProps<K, R>);
    push(name: K, query?: Record<string, string>, options?: Partial<{
        /** 不变更 history stack */
        ignore: boolean;
    }>): null | undefined;
    replace(name: K, query?: Record<string, string>): null | undefined;
    back(opt?: Partial<{
        data: any;
    }>): void;
    forward(): void;
    reload(): void;
    /** 销毁所有页面，然后前往指定路由 */
    destroyAllAndPush(name: K, query?: Record<string, string>, options?: Partial<{
        /** 不变更 history stack */
        ignore: boolean;
    }>): null | undefined;
    /** 跳转到兄弟页面 */
    ensureParent(view: RouteViewCore): null | undefined;
    buildURL(name: K, query?: Record<string, string>): string;
    buildURLWithPrefix(name: K, query?: Record<string, string>): string;
    isLayout(name: K): any;
    handleClickLink(params: {
        href: string;
        target: null | string;
    }): void;
    onTopViewChange(handler: Handler<TheTypesOfEvents[Events.TopViewChange]>): () => void;
    onRouteChange(handler: Handler<TheTypesOfEvents[Events.RouteChange]>): () => void;
    onBack(handler: Handler<TheTypesOfEvents[Events.Back]>): () => void;
    onForward(handler: Handler<TheTypesOfEvents[Events.Forward]>): () => void;
    onClickLink(handler: Handler<TheTypesOfEvents[Events.ClickLink]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/http_client/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { Result } from "@/domains/result/index";
import { JSONObject } from "@/domains/types/index";
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents = {
    [Events.StateChange]: void;
};
type HttpClientCoreProps = {
    hostname?: string;
    headers?: Record<string, string>;
    debug?: boolean;
};
export declare class HttpClientCore extends BaseDomain<TheTypesOfEvents> {
    hostname: string;
    headers: Record<string, string>;
    debug: boolean;
    constructor(props?: HttpClientCoreProps);
    get<T>(endpoint: unknown, query?: Record<string, string | number | undefined>, extra?: Partial<{
        headers: Record<string, string | number>;
        id: string;
    }>): Promise<Result<T>>;
    post<T>(endpoint: unknown, body?: JSONObject | FormData, extra?: Partial<{
        headers: Record<string, string | number>;
        id: string;
    }>): Promise<Result<T>>;
    fetch<T>(options: {
        url: unknown;
        method: "GET" | "POST";
        id?: string;
        data?: JSONObject | FormData;
        headers?: Record<string, string | number>;
    }): Promise<{
        data: T;
    }>;
    cancel(id: string): import("@/domains/result/index").Resp<null>;
    setHeaders(headers: Record<string, string>): void;
    appendHeaders(headers: Record<string, string>): void;
    setDebug(debug: boolean): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/index.d.ts
export { ApplicationModel } from "./app";
export * from "./error";
export { HistoryCore } from "./history";
export { HttpClientCore } from "./http_client";
export * from "./route_view";
export * from "./navigator";
export * as ui from "./ui";
export * from "./list";
export * from "./multiple";
export * from "./qrcode";
export * from "./request";
export * as rutil from "./request/utils";
export * from "./result";
export * from "./storage";
export * from "./system";
export * from "./slate/slate";
export * as SlateNode from "./slate/op.node";
export * as SlateDOM from "./slate/op.dom";
export * from "./shortcut/shortcut";
export * from "./base";


// From domains/list/constants.d.ts
/**
 * @file 常量
 */
import { Response } from "./typing";
export declare const DEFAULT_PAGE_SIZE = 10;
export declare const DEFAULT_CURRENT_PAGE = 1;
export declare const DEFAULT_TOTAL = 0;
export declare const DEFAULT_RESPONSE: Response<any>;
export declare const DEFAULT_PARAMS: {
    page: number;
    pageSize: number;
    next_marker: string;
};


// From domains/list/enums.d.ts
export declare enum PluginType {
    preset = "preset",
    plugin = "plugin"
}
export declare enum ServiceStage {
    uninitialized = 0,
    constructor = 1,
    init = 2,
    initPresets = 3,
    initPlugins = 4,
    initHooks = 5,
    pluginReady = 6,
    getConfig = 7,
    getPaths = 8,
    run = 9
}
export declare enum ConfigChangeType {
    reload = "reload",
    regenerateTmpFiles = "regenerateTmpFiles"
}
/**
 * 插件触发类型
 */
export declare enum ApplyPluginsType {
    /**
     * 新增
     */
    add = "add",
    /**
     * 修改参数，返回新的参数
     */
    modify = "modify",
    /**
     * 事件触发，会修改传入的参数
     */
    event = "event"
}
export declare enum EnableBy {
    register = "register",
    config = "config"
}


// From domains/list/index.d.ts
/**
 * @file 分页领域
 */
import { BaseDomain, Handler } from "@/domains/base";
import { RequestCore } from "@/domains/request/index";
import { RequestPayload } from "@/domains/request/utils";
import { Result } from "@/domains/result/index";
import { OriginalResponse, FetchParams, Response, Search, ListProps } from "./typing";
declare enum Events {
    LoadingChange = 0,
    BeforeSearch = 1,
    AfterSearch = 2,
    ParamsChange = 3,
    DataSourceChange = 4,
    DataSourceAdded = 5,
    StateChange = 6,
    Error = 7,
    /** 一次请求结束 */
    Completed = 8
}
type TheTypesOfEvents<T> = {
    [Events.LoadingChange]: boolean;
    [Events.BeforeSearch]: void;
    [Events.AfterSearch]: {
        params: any;
    };
    [Events.ParamsChange]: FetchParams;
    [Events.DataSourceAdded]: T[];
    [Events.DataSourceChange]: {
        dataSource: T[];
        reason: "init" | "goto" | "next" | "prev" | "clear" | "refresh" | "search" | "load_more" | "reload" | "reset" | "manually";
    };
    [Events.StateChange]: ListState<T>;
    [Events.Error]: Error;
    [Events.Completed]: void;
};
interface ListState<T> extends Response<T> {
}
/**
 * 分页类
 */
export declare class ListCore<S extends RequestCore<(...args: any[]) => RequestPayload<any>>, T = NonNullable<S["response"]>["list"][number]> extends BaseDomain<TheTypesOfEvents<T>> {
    debug: boolean;
    static defaultResponse: <T_1>() => Response<T_1>;
    static commonProcessor: <T_1>(originalResponse: OriginalResponse | null) => {
        dataSource: T_1[];
        page: number;
        pageSize: number;
        total: number;
        empty: boolean;
        noMore: boolean;
        error: Error | null;
    };
    /** 原始请求方法 */
    request: S;
    /** 支持请求前对参数进行处理（formToBody） */
    private beforeRequest;
    /** 响应处理器 */
    private processor;
    /** 初始查询参数 */
    private initialParams;
    private extraResponse;
    /** 额外的数据 */
    private extraDatSource;
    private insertExtraDataSource;
    params: FetchParams;
    response: Response<T>;
    rowKey: string;
    constructor(fetch: S, options?: ListProps<T>);
    private initialize;
    /**
     * 手动修改当前实例的查询参数
     * @param {import('./typing').FetchParams} nextParams 查询参数或设置函数
     */
    setParams(nextParams: Partial<FetchParams> | ((p: FetchParams) => FetchParams)): void;
    setDataSource(dataSources: T[]): void;
    /**
     * 调用接口进行请求
     * 外部不应该直接调用该方法
     * @param {import('./typing').FetchParams} nextParams - 查询参数
     */
    fetch(params: Partial<FetchParams>, ...restArgs: any[]): Promise<Result<Response<T>>>;
    /**
     * 使用初始参数请求一次，初始化时请调用该方法
     */
    init(params?: {}): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }>>;
    /** 无论如何都会触发一次 state change */
    initAny(): Promise<import("@/domains/result/index").Resp<null> | import("@/domains/result/index").Resp<Response<T>>>;
    /**
     * 下一页
     */
    next(): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }>>;
    /**
     * 返回上一页
     */
    prev(): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }>>;
    nextWithCursor(): void;
    /** 强制请求下一页，如果下一页没有数据，page 不改变 */
    loadMoreForce(): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }>>;
    /**
     * 无限加载时使用的下一页
     */
    loadMore(): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }> | undefined>;
    /**
     * 前往指定页码
     * @param {number} page - 要前往的页码
     * @param {number} [pageSize] - 每页数量
     */
    goto(targetPage: number, targetPageSize: number): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }>>;
    search(...args: Parameters<S["service"]>): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }>>;
    searchDebounce: (...args: Parameters<S["service"]>) => void;
    /**
     * 使用初始参数请求一次，「重置」操作时调用该方法
     */
    reset(params?: Partial<FetchParams>): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }>>;
    /**
     * 使用当前参数重新请求一次，PC 端「刷新」操作时调用该方法
     */
    reload(): Promise<Result<Response<T>>>;
    /**
     * 页码置为 1，其他参数保留，重新请求一次。移动端「刷新」操作时调用该方法
     */
    refresh(): Promise<Result<{
        dataSource: T[];
        page: number;
        pageSize: number;
        total: number;
        search: Search;
        initial: boolean;
        noMore: boolean;
        loading: boolean;
        empty: boolean;
        refreshing: boolean | null;
        error: Error | null;
    }>>;
    clear(): void;
    deleteItem(fn: (item: T) => boolean): void;
    /**
     * 移除列表中的多项（用在删除场景）
     * @param {T[]} items 要删除的元素列表
     */
    deleteItems(items: T[]): Promise<void>;
    modifyItem(fn: (item: T) => T): void;
    replaceDataSource(dataSource: T[]): void;
    /**
     * 手动修改当前 dataSource
     * @param fn
     */
    modifyDataSource(fn: (v: T) => T): void;
    /**
     * 手动修改当前 response
     * @param fn
     */
    modifyResponse(fn: (v: Response<T>) => Response<T>): void;
    /**
     * 手动修改当前 params
     */
    modifyParams(fn: (v: FetchParams) => FetchParams): void;
    /**
     * 手动修改当前 search
     */
    modifySearch(fn: (v: FetchParams) => FetchParams): void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
    onLoadingChange(handler: Handler<TheTypesOfEvents<T>[Events.LoadingChange]>): () => void;
    onBeforeSearch(handler: Handler<TheTypesOfEvents<T>[Events.BeforeSearch]>): () => void;
    onAfterSearch(handler: Handler<TheTypesOfEvents<T>[Events.AfterSearch]>): () => void;
    onDataSourceChange(handler: Handler<TheTypesOfEvents<T>[Events.DataSourceChange]>): () => void;
    onDataSourceAdded(handler: Handler<TheTypesOfEvents<T>[Events.DataSourceAdded]>): () => void;
    onError(handler: Handler<TheTypesOfEvents<T>[Events.Error]>): () => void;
    onComplete(handler: Handler<TheTypesOfEvents<T>[Events.Completed]>): () => void;
}
export * from "./utils";


// From domains/list/typing.d.ts
/**
 * 请求原始响应
 */
export type OriginalResponse = {
    list: unknown[];
};
/**
 * 查询参数
 */
export type Search = {
    [x: string]: string | number | boolean | null | undefined;
};
/**
 * 请求参数
 */
export interface FetchParams {
    page: number;
    pageSize: number;
    next_marker: string;
}
/**
 * 对外暴露的响应值
 */
export interface Response<T> {
    /**
     * 列表数据
     */
    dataSource: T[];
    /**
     * 当前页码
     * @default 0
     */
    page: number;
    /**
     * 每页数量
     * @default 10
     */
    pageSize: number;
    /**
     * 记录总数
     * @default 0
     */
    total: number;
    /**
     * 查询参数
     */
    search: Search;
    /**
     * 是否初始化（用于展示骨架屏）
     */
    initial: boolean;
    /**
     * 没有更多数据了
     */
    noMore: boolean;
    /**
     * 是否请求中，initial 时 loading 为 false
     */
    loading: boolean;
    /** 是否为空（用于展示空状态） */
    empty: boolean;
    /**
     * 是否正在刷新（用于移动端下拉刷新）
     */
    refreshing: boolean | null;
    /**
     * 请求是否出错
     */
    error: Error | null;
}
export type OriginalResponseProcessor = <T>(originalResponse: OriginalResponse) => Omit<Response<T>, "dataSource" | "page" | "pageSize" | "noMore" | "error">;
/**
 * 响应处理器
 */
export type ResponseProcessor = <T>(response: Omit<Response<T>, "dataSource" | "page" | "pageSize" | "noMore" | "error">, originalResponse: OriginalResponse) => Omit<Response<T>, "dataSource" | "page" | "pageSize" | "noMore" | "error">;
/**
 * 参数处理器
 */
export type ParamsProcessor = (params: FetchParams, currentParams: any) => FetchParams;
export interface ListProps<T> {
    /**
     * 是否打开 debug
     */
    debug?: boolean;
    /**
     * dataSource 中元素唯一 key
     * @default id
     */
    rowKey?: string;
    /**
     * 参数处理器
     * 建议在 service 函数中直接处理
     */
    beforeRequest?: ParamsProcessor;
    /**
     * 响应处理器
     * 建议在 service 函数中直接处理
     */
    processor?: <T>(response: Response<T>, originalResponse: OriginalResponse | null) => Response<T>;
    /**
     * 默认已存在的数据
     */
    dataSource?: T[];
    /**
     * 默认查询条件
     */
    search?: Search;
    /**
     * 默认当前页
     */
    page?: number;
    /**
     * 默认每页数量
     */
    pageSize?: number;
    /**
     * 额外的默认 response
     */
    extraDefaultResponse?: Record<string, unknown>;
    extraDataSource?: T[];
    /** 初始状态，默认该值为 true，可以通过该值判断是否展示骨架屏 */
    initial?: boolean;
    onLoadingChange?: (loading: boolean) => void;
    onStateChange?: (state: Response<T>) => void;
    beforeSearch?: () => void;
    afterSearch?: () => void;
}
export type TheItemTypeFromListCore<T extends {
    response: {
        dataSource: {}[];
    };
}> = T["response"]["dataSource"][number];


// From domains/list/utils.d.ts
/**
 * 移除指定字段
 * 这个方法 lodash 中有，但是为了 Pagination 不包含任何依赖，所以这里自己实现了
 * @param data
 * @param keys
 */
export declare function omit(data: {
    [key: string]: any;
}, keys: string[]): {
    [key: string]: any;
};
export declare function noop(): void;
export declare function merge<T extends Record<string, any> = {
    [key: string]: any;
}>(current: T, defaultObj: T, override?: boolean): {
    [x: string]: any;
};
export declare const qs: {
    parse(search: string): {
        [x: string]: string;
    };
    stringify(obj: Record<string, any>): string;
};


// From domains/multiple/index.d.ts
/**
 * @file 列表中多选
 */
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    Change = 0,
    StateChange = 1
}
type TheTypesOfEvents<T> = {
    [Events.Change]: T[];
    [Events.StateChange]: MultipleSelectionState<T>;
};
type SelectionProps<T> = {
    defaultValue: T[];
    options: {
        label: string;
        value: T;
    }[];
    onChange?: (v: T[]) => void;
};
type MultipleSelectionState<T> = {
    value: T[];
    options: {
        label: string;
        value: T;
    }[];
};
export declare class MultipleSelectionCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
    shape: "multiple-select";
    value: T[];
    defaultValue: T[];
    options: {
        label: string;
        value: T;
    }[];
    get state(): MultipleSelectionState<T>;
    constructor(props: SelectionProps<T>);
    setValue(value: T[]): void;
    toggle(value: T): void;
    select(value: T): void;
    remove(value: T): void;
    /** 暂存的值是否为空 */
    isEmpty(): boolean;
    clear(): void;
    onChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
}
export {};


// From domains/navigator/index.d.ts
import parse from "url-parse";
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    PushState = 0,
    ReplaceState = 1,
    PopState = 2,
    Back = 3,
    Forward = 4,
    Reload = 5,
    Start = 6,
    PathnameChange = 7,
    /** 销毁所有页面并跳转至指定页面 */
    Relaunch = 8,
    /** ???? */
    RedirectToHome = 9,
    HistoriesChange = 10
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
export declare class NavigatorCore extends BaseDomain<TheTypesOfEvents> {
    static prefix: string | null;
    static parse(url: string): {
        query: Record<string, string>;
        pathname: string;
        auth: string;
        hash: string;
        host: string;
        hostname: string;
        href: string;
        origin: string;
        password: string;
        port: string;
        protocol: string;
        slashes: boolean;
        username: string;
        set<Part extends parse.URLPart>(part: Part, value: parse<string>[Part] | undefined, fn?: false): parse<string>;
        set<Part extends parse.URLPart, T>(part: Part, value: parse<T>[Part] | undefined, fn?: parse.QueryParser<T> | undefined): parse<T>;
        toString(stringify?: parse.StringifyQuery): string;
    };
    unique_id: string;
    debug: boolean;
    name: string;
    /** 当前 pathname */
    pathname: string;
    /** 当前路由的 query */
    query: Record<string, string>;
    /** 当前路由的 params */
    params: Record<string, string>;
    /** 当前 URL */
    location: Partial<RouteLocation>;
    href: string;
    histories: {
        pathname: string;
    }[];
    prevHistories: {
        pathname: string;
    }[];
    /** 发生跳转前的 pathname */
    prevPathname: string | null;
    /** router 基础信息 */
    origin: string;
    host: string;
    _pending: {
        pathname: string;
        search: string;
        type: RouteAction;
    };
    get state(): {
        pathname: string;
        search: string;
        params: Record<string, string>;
        query: Record<string, string>;
        location: Partial<RouteLocation>;
    };
    /** 启动路由监听 */
    prepare(location: RouteLocation): Promise<void>;
    start(): void;
    private setPrevPathname;
    private setPathname;
    /** 调用该方法来「改变地址」 */
    pushState(url: string): void;
    replaceState(url: string): Promise<void>;
    /** 外部路由改变（点击浏览器前进、后退），作出响应 */
    handlePopState({ type, pathname, href, }: {
        type: string;
        href: string;
        pathname: string;
    }): void;
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>): () => void;
    onHistoryChange(handler: Handler<TheTypesOfEvents[Events.HistoriesChange]>): () => void;
    onPushState(handler: Handler<TheTypesOfEvents[Events.PushState]>): () => void;
    onReplaceState(handler: Handler<TheTypesOfEvents[Events.ReplaceState]>): () => void;
    onPopState(handler: Handler<TheTypesOfEvents[Events.PopState]>): () => void;
    onReload(handler: Handler<TheTypesOfEvents[Events.Reload]>): () => void;
    onPathnameChange(handler: Handler<TheTypesOfEvents[Events.PathnameChange]>): () => void;
    onBack(handler: Handler<TheTypesOfEvents[Events.Back]>): () => void;
    onForward(handler: Handler<TheTypesOfEvents[Events.Forward]>): () => void;
    onRelaunch(handler: Handler<TheTypesOfEvents[Events.Relaunch]>): () => void;
    onHistoriesChange(handler: Handler<TheTypesOfEvents[Events.HistoriesChange]>): () => void;
}
export type RouteAction = "initialize" | "push" | "replace" | "back" | "forward";
export {};


// From domains/provider/tauri/http_client.d.ts
import { HttpClientCore } from "@/domains/http_client";
export declare function connect(store: HttpClientCore): void;


// From domains/provider/tauri/index.d.ts
export { connect as provide_app } from "../web/app";
export { connect as provide_http_client } from "./http_client";


// From domains/provider/wails3/http_client.d.ts
import { HttpClientCore } from "@/domains/http_client";
export declare function connect(store: HttpClientCore): void;


// From domains/provider/wails3/index.d.ts
export { connect as provide_app } from "../web/app";
export { connect as provide_http_client } from "./http_client";


// From domains/provider/weapp/app.d.ts
import { ApplicationModel } from "@/domains/app/index";
import { StorageCore } from "@/domains/storage/index";
export declare function connect<T extends {
    storage: StorageCore<any>;
}>(app: ApplicationModel<T>): void;


// From domains/provider/weapp/http_client.d.ts
import { HttpClientCore } from "@/domains/http_client";
export declare function connect(store: HttpClientCore): void;


// From domains/provider/weapp/index.d.ts
export { connect as provide_app } from "./app";
export { connect as provide_http_client } from "./http_client";


// From domains/provider/web/app.d.ts
import { StorageCore } from "@/domains/storage/index";
import { ApplicationModel } from "@/domains/app/index";
export declare function connect<T extends {
    storage: StorageCore<any>;
}>(app: ApplicationModel<T>): void;


// From domains/provider/web/history.d.ts
import { HistoryCore } from "@/domains/history";
export declare function connect(history: HistoryCore<string, any>): void;


// From domains/provider/web/http_client.d.ts
import { HttpClientCore } from "@/domains/http_client/index";
export declare function connect(store: HttpClientCore): void;


// From domains/provider/web/index.d.ts
export { connect as provide_app } from "./app";
export { connect as provide_http_client } from "./http_client";
export { connect as provide_history } from "./history";
export { connect as provide_slate } from "./slate";
export { connect as provide_ui_image } from "./ui/image";
export { connect as provide_ui_node } from "./ui/node";
export { connectIndicator as provide_ui_scroll_view_indicator, connectScroll as provide_ui_scroll_view_scroll, } from "./ui/scroll_view";
export { connect as provide_ui_video_player } from "./ui/video_player";


// From domains/provider/web/slate.d.ts
import { SlateEditorModel } from "@/domains/slate/slate";
export declare function connect(vm: SlateEditorModel, $input: Element): void;


// From domains/provider/web/ui/image.d.ts
import { ImageCore } from "@/domains/ui/image/index";
export declare function connect($img: HTMLDivElement, store: ImageCore): void;


// From domains/provider/web/ui/node.d.ts
import { NodeCore } from "@/domains/ui/node";
export declare function connect($img: HTMLImageElement, store: NodeCore): void;


// From domains/provider/web/ui/scroll_view.d.ts
import { ScrollViewCore } from "@/domains/ui/scroll-view/index";
export declare function connectScroll(store: ScrollViewCore, $scroll: HTMLDivElement): void;
export declare function connectIndicator(store: ScrollViewCore, $indicator: HTMLDivElement): void;


// From domains/provider/web/ui/video_player.d.ts
import { VideoPlayerCore } from "@/domains/ui/video-player/index";
/** 连接 $video 标签和 player 领域 */
export declare function connect($video: HTMLVideoElement, player: VideoPlayerCore): void;


// From domains/qrcode/core.d.ts
declare var y: {
    new (t: any): {
        _htOption: {
            width: number;
            height: number;
            typeNumber: number;
            colorDark: string;
            colorLight: string;
            correctLevel: number;
            text: string;
        };
        _oQRCode: null;
        fetchModel(t: any, r?: {}): null;
    };
    CorrectLevel: {
        L: number;
        M: number;
        Q: number;
        H: number;
    };
};
export { y as QRCode };


// From domains/qrcode/index.d.ts
/**
 * 生成二维码
 */
import { QRCode } from "./core";
type CanvasDrawingProps = {
    width: number;
    height: number;
    ctx: CanvasRenderingContext2D;
};
interface QRCode {
    getModuleCount(): number;
    isDark(x: number, y: number): boolean;
}
/**
 * Drawing QRCode by using canvas
 *
 * @constructor
 * @param {Object} htOption QRCode Options
 */
export declare class CanvasDrawing {
    /** canvas 绘制上下文 */
    ctx: CanvasRenderingContext2D;
    /** 是否绘制完成 */
    isPainted: boolean;
    options: {
        width: number;
        height: number;
    };
    constructor(options: CanvasDrawingProps);
    /**
     * 绘制 logo
     */
    /**
     * Draw the QRCode
     *
     * @param {QRCode} model
     */
    draw(model: QRCode): void;
    /**
     * Make the image from Canvas if the browser supports Data URI.
     */
    /**
     * Clear the QRCode
     */
    clear(): void;
    /**
     * @private
     * @param {Number} nNumber
     */
    round(nNumber: number): number;
}
export declare function createQRCode(text: string, options: CanvasDrawingProps): Promise<void>;
export {};


// From domains/request/index.d.ts
/**
 * @file API 请求
 */
import { BaseDomain, Handler } from "@/domains/base";
import { BizError } from "@/domains/error/index";
import { HttpClientCore } from "@/domains/http_client/index";
import { Result, UnpackedResult } from "@/domains/result/index";
import { RequestPayload, UnpackedRequestPayload } from "./utils";
declare enum Events {
    BeforeRequest = 0,
    AfterRequest = 1,
    LoadingChange = 2,
    Success = 3,
    Failed = 4,
    Completed = 5,
    Canceled = 6,
    StateChange = 7,
    ResponseChange = 8
}
type TheTypesOfEvents<T> = {
    [Events.LoadingChange]: boolean;
    [Events.BeforeRequest]: void;
    [Events.AfterRequest]: void;
    [Events.Success]: T;
    [Events.Failed]: BizError;
    [Events.Completed]: void;
    [Events.Canceled]: void;
    [Events.StateChange]: RequestState<T>;
    [Events.ResponseChange]: T | null;
};
type RequestState<T> = {
    initial: boolean;
    loading: boolean;
    error: BizError | null;
    response: T | null;
};
type FetchFunction = (...args: any[]) => RequestPayload<any>;
type ProcessFunction<V, P> = (value: V) => Result<P>;
type RequestProps<F extends FetchFunction, P> = {
    _name?: string;
    client?: HttpClientCore;
    loading?: boolean;
    delay?: null | number;
    defaultResponse?: P;
    process?: ProcessFunction<Result<UnpackedRequestPayload<ReturnType<F>>>, P>;
    onSuccess?: (v: UnpackedResult<P>) => void;
    onFailed?: (error: BizError) => void;
    onCompleted?: () => void;
    onCanceled?: () => void;
    beforeRequest?: () => void;
    onLoading?: (loading: boolean) => void;
};
export declare function onRequestCreated(h: (v: RequestCore<any>) => void): void;
export type TheResponseOfRequestCore<T extends RequestCore<any, any>> = NonNullable<T["response"]>;
export type TheResponseOfFetchFunction<T extends FetchFunction> = UnpackedRequestPayload<ReturnType<T>>;
/**
 * 用于接口请求的核心类
 */
export declare class RequestCore<F extends FetchFunction, P = UnpackedRequestPayload<ReturnType<F>>> extends BaseDomain<TheTypesOfEvents<any>> {
    _name: string;
    debug: boolean;
    defaultResponse: P | null;
    /**
     * 就是
     *
     * ```js
     * function test() {
     *   return request.post('/api/ping');
     * }
     * ```
     *
     * 函数返回 RequestPayload，描述该次请求的地址、参数等
     */
    service: F;
    process?: ProcessFunction<Result<UnpackedRequestPayload<ReturnType<F>>>, P>;
    client?: HttpClientCore;
    delay: number | null;
    loading: boolean;
    initial: boolean;
    /** 处于请求中的 promise */
    pending: Promise<Result<P>> | null;
    /** 调用 run 方法暂存的参数 */
    args: Parameters<F>;
    /** 请求的响应 */
    response: P | null;
    /** 请求失败，保存错误信息 */
    error: BizError | null;
    id: string;
    get state(): RequestState<P>;
    constructor(fn: F, props?: RequestProps<F, P>);
    /** 执行 service 函数 */
    run(...args: Parameters<F>): Promise<Result<P>>;
    /** 使用当前参数再请求一次 */
    reload(): void;
    cancel(): import("@/domains/result/index").Resp<null> | undefined;
    clear(): void;
    setError(err: BizError): void;
    modifyResponse(fn: (resp: P) => P): void;
    onLoadingChange(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.LoadingChange]>): () => void;
    beforeRequest(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.BeforeRequest]>): () => void;
    onSuccess(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.Success]>): () => void;
    onFailed(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.Failed]>, opt?: Partial<{
        /** 清除其他 failed 监听 */
        override: boolean;
    }>): () => void;
    onCanceled(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.Canceled]>): () => void;
    /** 建议使用 onFailed */
    onError(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.Failed]>): () => void;
    onCompleted(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.Completed]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.StateChange]>): () => void;
    onResponseChange(handler: Handler<TheTypesOfEvents<UnpackedResult<P>>[Events.ResponseChange]>): () => void;
}
export {};


// From domains/request/loop.d.ts
/**
 * @file 轮询器
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { RequestCore } from "./index";
export declare function RequestLoop(props: {
    request: RequestCore<any>;
    onComplete: () => void;
    onError: (error: BizError) => void;
}): {
    start(...args: Parameters<(...args: unknown[]) => Promise<import("../src").Result<any>>>): void;
    setFinish(): void;
    onError: (handler: Handler<BizError>) => void;
};


// From domains/request/utils.d.ts
/**
 * @file 构建 http 请求载荷
 */
import { Result, UnpackedResult } from "@/domains/result/index";
import { Unpacked } from "@/domains/types/index";
export type RequestPayload<T> = {
    hostname?: string;
    url: string;
    method: "POST" | "GET" | "DELETE" | "PUT";
    query?: any;
    params?: any;
    body?: any;
    headers?: Record<string, string | number>;
    process?: (v: any) => T;
};
/**
 * GetRespTypeFromRequestPayload
 * T extends RequestPayload
 */
export type UnpackedRequestPayload<T> = NonNullable<T extends RequestPayload<infer U> ? (U extends null ? U : U) : T>;
export type RequestedResource<T extends (...args: any[]) => any> = UnpackedResult<Unpacked<ReturnType<T>>>;
export type TmpRequestResp<T extends (...args: any[]) => any> = Result<UnpackedRequestPayload<RequestedResource<T>>>;
export declare function onCreatePostPayload(h: (v: RequestPayload<any>) => void): void;
export declare function onCreateGetPayload(h: (v: RequestPayload<any>) => void): void;
/**
 * 并不是真正发出网络请求，仅仅是「构建请求信息」然后交给 HttpClient 发出请求
 * 所以这里构建的请求信息，就要包含
 * 1. 请求地址
 * 2. 请求参数
 * 3. headers
 */
export declare const request: {
    get<T>(endpoint: string, query?: Record<string, string | number | boolean | null | undefined>, extra?: Partial<{
        headers: Record<string, string | number>;
    }>): RequestPayload<T>;
    /** 构建请求参数 */
    post<T>(url: unknown, body?: any, extra?: Partial<{
        headers: Record<string, string | number>;
    }>): RequestPayload<T>;
};
export declare function request_factory(opt?: Partial<{
    hostnames: Partial<{
        dev: string;
        test: string;
        beta: string;
        prod: string;
    }>;
    debug: boolean;
    headers: Record<string, string | number>;
    process: (v: any) => any;
}>): {
    getHostname(): string;
    setHostname(hostname: string): void;
    setHeaders(headers: Record<string, string | number>): void;
    deleteHeaders(key: string): void;
    appendHeaders(extra: Record<string, string | number>): void;
    setEnv(env: "prod" | "dev" | "test" | "beta"): void;
    setDebug(debug: boolean): void;
    get<T>(endpoint: string, query?: Record<string, string | number | boolean | null | undefined> | undefined, extra?: Partial<{
        headers: Record<string, string | number>;
    }> | undefined): RequestPayload<T>;
    post<T>(url: unknown, body?: any, extra?: Partial<{
        headers: Record<string, string | number>;
    }> | undefined): RequestPayload<T>;
};


// From domains/result/index.d.ts
import { BizError } from "@/domains/error";
export type Resp<T> = {
    data: T extends null ? null : T;
    error: T extends null ? BizError : null;
};
export type Result<T> = Resp<T> | Resp<null>;
export type UnpackedResult<T> = NonNullable<T extends Resp<infer U> ? (U extends null ? U : U) : T>;
/** 构造一个结果对象 */
export declare const Result: {
    /** 构造成功结果 */
    Ok: <T>(value: T) => Result<T>;
    /** 构造失败结果 */
    Err: <T>(message: string | string[] | BizError | Error | Result<null>, code?: string | number, data?: unknown) => Resp<null>;
};


// From domains/route_view/index.d.ts
/**
 * @file 根据路由判断是否可见的视图块
 */
import { BaseDomain, Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PresenceCore } from "@/domains/ui/presence/index";
import { HistoryCore } from "@/domains/history";
import { buildUrl } from "./utils";
import { build, OriginalRouteConfigure, PageKeysType, PathnameKey, RouteConfig } from "./utils";
declare enum Events {
    SubViewChanged = 0,
    SubViewRemoved = 1,
    SubViewAppended = 2,
    /** 子视图改变（数量 */
    SubViewsChange = 3,
    /** 当前展示的子视图改变 */
    CurSubViewChange = 4,
    /** 有视图变为可见状态 */
    ViewShow = 5,
    /** 视图加载好 */
    Ready = 6,
    /** 当前视图载入页面 */
    Mounted = 7,
    BeforeShow = 8,
    /** 当前视图变为可见，稍晚于 Mounted 事件 */
    Show = 9,
    BeforeHide = 10,
    /** 当前视图变为隐藏 */
    Hidden = 11,
    /** 当前视图从页面卸载 */
    Unmounted = 12,
    /** 被其他视图覆盖 */
    Layered = 13,
    /** 覆盖自身的视图被移开 */
    Uncover = 14,
    Start = 15,
    StateChange = 16,
    /** 子视图匹配上了 */
    Match = 17,
    NotFound = 18
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
    [Events.Start]: {
        pathname: string;
    };
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
    parent?: RouteViewCore | null;
    query?: Record<string, string>;
    visible?: boolean;
    /** 该视图是布局视图 */
    layout?: boolean;
    animation?: Partial<{
        in: string;
        out: string;
        show: string;
        hide: string;
    }>;
    children?: RouteViewCore[];
    views?: RouteViewCore[];
};
export declare class RouteViewCore extends BaseDomain<TheTypesOfEvents> {
    unique_id: string;
    debug: boolean;
    id: number;
    /** 一些配置项 */
    name: string;
    pathname: string;
    title: string;
    animation: Partial<{
        in: string;
        out: string;
        show: string;
        hide: string;
    }>;
    /** 当前视图的 query */
    query: Record<string, string>;
    /** 当前视图的 params */
    params: Record<string, string>;
    _showed: boolean;
    loaded: boolean;
    mounted: boolean;
    layered: boolean;
    isRoot: boolean;
    parent: RouteViewCore | null;
    /** 当前子视图 */
    curView: RouteViewCore | null;
    /** 当前所有的子视图 */
    subViews: RouteViewCore[];
    $presence: PresenceCore;
    get state(): RouteViewCoreState;
    get href(): string;
    get visible(): boolean;
    constructor(options: Partial<{
        _name: string;
    }> & RouteViewCoreProps);
    appendView(view: RouteViewCore): void;
    replaceViews(views: RouteViewCore[]): void;
    /** 移除（卸载）一个子视图 */
    removeView(view: RouteViewCore, options?: Partial<{
        reason: "show_sibling" | "back" | "forward";
        destroy: boolean;
        callback: () => void;
    }>): void;
    findCurView(): RouteViewCore | null;
    ready(): void;
    /** 让自身的一个子视图变为可见 */
    showView(sub_view: RouteViewCore, options?: Partial<{
        reason: "show_sibling" | "back";
        destroy: boolean;
    }>): void;
    /** 主动展示视图 */
    show(): void;
    /** 主动隐藏自身视图 */
    hide(options?: Partial<{
        reason: "show_sibling" | "back" | "forward";
        destroy: boolean;
    }>): void;
    /** 视图在页面上展示（变为可见） */
    setShow(): void;
    /** 视图在页面上隐藏（变为不可见） */
    setHidden(): void;
    mount(): void;
    /** 卸载自身 */
    unmount(): void;
    /** 视图被装载到页面 */
    setMounted(): void;
    /** 视图从页面被卸载 */
    setUnmounted(): void;
    /** 页面组件已加载 */
    setLoaded(): void;
    /** 页面组件未加载 */
    setUnload(): void;
    buildUrl(query: Record<string, string | number>): string;
    buildUrlWithPrefix(query: Record<string, string | number>): string;
    onStart(handler: Handler<TheTypesOfEvents[Events.Start]>): () => void;
    onReady(handler: Handler<TheTypesOfEvents[Events.Ready]>): () => void;
    onMounted(handler: Handler<TheTypesOfEvents[Events.Mounted]>): () => void;
    onViewShow(handler: Handler<TheTypesOfEvents[Events.ViewShow]>): () => void;
    onBeforeShow(handler: Handler<TheTypesOfEvents[Events.BeforeShow]>): () => void;
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>): () => void;
    onBeforeHide(handler: Handler<TheTypesOfEvents[Events.BeforeHide]>): () => void;
    onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>): () => void;
    onLayered(handler: Handler<TheTypesOfEvents[Events.Layered]>): () => void;
    onUncover(handler: Handler<TheTypesOfEvents[Events.Uncover]>): () => void;
    onUnmounted(handler: Handler<TheTypesOfEvents[Events.Unmounted]>): () => void;
    onSubViewChanged(handler: Handler<TheTypesOfEvents[Events.SubViewChanged]>): () => void;
    onSubViewAppended(handler: Handler<TheTypesOfEvents[Events.SubViewAppended]>): () => void;
    onSubViewRemoved(handler: Handler<TheTypesOfEvents[Events.SubViewRemoved]>): () => void;
    onSubViewsChange(handler: Handler<TheTypesOfEvents[Events.SubViewsChange]>): () => void;
    onCurViewChange(handler: Handler<TheTypesOfEvents[Events.CurSubViewChange]>): () => void;
    onMatched(handler: Handler<TheTypesOfEvents[Events.Match]>): () => void;
    onNotFound(handler: Handler<TheTypesOfEvents[Events.NotFound]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export declare function onViewCreated(fn: (views: RouteViewCore) => void): void;
export declare function RouteMenusModel<T extends {
    title: string;
    url?: unknown;
    onClick?: (m: T) => void;
}>(props: {
    route: T["url"];
    menus: T[];
    $history: HistoryCore<any, any>;
}): {
    methods: {
        refresh(): void;
        setCurMenu(name: T["url"]): void;
    };
    ui: {};
    state: {
        readonly menus: T[];
        readonly route_name: T["url"];
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly menus: T[];
        readonly route_name: T["url"];
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export { build, buildUrl };
export type { OriginalRouteConfigure, PageKeysType, PathnameKey, RouteConfig };


// From domains/route_view/utils.d.ts
import { JSONObject } from "@/domains/types";
import { query_stringify } from "@/utils";
export declare function buildUrl(key: string, params?: JSONObject, query?: Parameters<typeof query_stringify>[0]): string;
export type OriginalRouteConfigure = Record<PathnameKey, {
    title: string;
    pathname: string;
    options?: Partial<{
        keep_alive?: boolean;
        animation?: Partial<{
            in: string;
            out: string;
            show: string;
            hide: string;
        }>;
        require?: string[];
    }>;
    children?: OriginalRouteConfigure;
}>;
export type PageKeysType<T extends OriginalRouteConfigure, K = keyof T> = K extends keyof T & (string | number) ? `${K}` | (T[K] extends object ? T[K]["children"] extends object ? `${K}.${PageKeysType<T[K]["children"]>}` : never : never) : never;
export type PathnameKey = string;
export type RouteConfig<T> = {
    /** 使用该值定位唯一 route/page */
    name: T;
    title: string;
    pathname: PathnameKey;
    /** 是否为布局 */
    layout?: boolean;
    parent: {
        name: string;
    };
    options?: Partial<{
        require?: string[];
        keep_alive?: boolean;
        animation?: {
            in: string;
            out: string;
            show: string;
            hide: string;
        };
    }>;
};
export declare function build<T>(configure: OriginalRouteConfigure): {
    routes: Record<string, RouteConfig<T>>;
    routesWithPathname: Record<string, RouteConfig<T>>;
};


// From domains/shortcut/shortcut.d.ts
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
type KeyboardEvent = {
    code: string;
    preventDefault: () => void;
};
export declare function ShortcutModel(props?: Partial<{
    mode?: "normal" | "recording";
}>): {
    methods: {
        refresh(): void;
        register(handlers: Record<string, (event: KeyboardEvent & {
            step?: "keydown" | "keyup";
        }) => void>): void;
        clearPressedKeys(): void;
        invokeHandlers(event: KeyboardEvent, key: string): void;
        buildShortcut(): {
            key1: string;
            key2: string;
        };
        setRecordingCodes(codes: string): void;
        reset(): void;
        testShortcut(opt: {
            /** 存在 pressing 时，进行拼接后的字符串，用于「组合快捷键」 */
            key1: string;
            /** 没有其他出于 pressing 状态的情况下，按下的按键拼接后的字符串，用于「单个快捷键或连按」 */
            key2: string;
            step: "keydown" | "keyup";
        }, event: KeyboardEvent): void;
        handleKeydown(event: {
            code: string;
            preventDefault: () => void;
        }): void;
        handleKeyup(event: {
            code: string;
            preventDefault: () => void;
        }, opt?: Partial<{
            fake: boolean;
        }>): void;
    };
    ui: {};
    state: {
        readonly codes: string[];
        readonly codes2: string[];
    };
    ready(): void;
    destroy(): void;
    onShortcut(handler: Handler<{
        key: string;
    }>): () => void;
    onShortcutComplete(handler: Handler<{
        codes: string[];
    }>): () => void;
    onStateChange(handler: Handler<{
        readonly codes: string[];
        readonly codes2: string[];
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export {};


// From domains/slate/descendant.d.ts
/**
 * @file 节点
 * 提供最基础的能力
 * Document、Block、Inline、Text 都会内部包含该节点模型，来实现调用该础能力
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { SlateDescendant, SlateDescendantType } from "./types";
export declare function SlateDescendantModel(props: {} & SlateDescendant): {
    ui: {};
    state: {} & SlateDescendant;
    type: SlateDescendantType;
    setText: (text: string) => void;
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{} & SlateDescendant>): () => void;
    onError(handler: Handler<BizError>): () => void;
};


// From domains/slate/element.d.ts
/**
 * @file 元素
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
export declare function SlateElementModel(props: {
    key: string;
    data: Record<string, unknown>;
    /** 节点类型 */
    object: unknown;
}): {
    methods: {
        refresh(): void;
        addMark(): void;
        getParent(): void;
        getPreviousNode(path: unknown): void;
        getNextNode(): void;
        findDescendant(predicate: unknown): void;
        insertNode(path: unknown, node: unknown): void;
        removeNode(path: unknown): void;
    };
    ui: {};
    state: {
        readonly text: string;
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly text: string;
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export declare namespace SlateElementModel {
    var create: () => void;
    var fromJSON: (value?: {}) => void;
    var toJSON: (options?: {}) => void;
}


// From domains/slate/history.d.ts
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { SlateOperation, SlateOperationType } from "./types";
import { SlatePoint } from "./point";
export declare function SlateHistoryModel(): {
    methods: {
        refresh(): void;
        mark(): void;
        push(ops: SlateOperation[], selection: {
            start: SlatePoint;
            end: SlatePoint;
        }): void;
        undo(): {
            operations: SlateOperation[];
            selection: {
                start: SlatePoint;
                end: SlatePoint;
            };
        };
    };
    ui: {};
    state: {
        readonly stacks: {
            type: SlateOperationType;
            created_at: string;
        }[];
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly stacks: {
            type: SlateOperationType;
            created_at: string;
        }[];
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export type SlateHistoryModel = ReturnType<typeof SlateHistoryModel>;


// From domains/slate/node.d.ts
/**
 * @file 节点
 * 提供最基础的能力
 * Document、Block、Inline、Text 都会内部包含该节点模型，来实现调用该础能力
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
export declare function SlateNodeModel(props: {
    key: string;
    data: Record<string, unknown>;
    /** 节点类型 */
    object: unknown;
}): {
    methods: {
        refresh(): void;
        getText(): void;
        getNode(): void;
        getPath(): void;
        normalize(): void;
        validate(): void;
    };
    ui: {};
    state: {
        readonly text: string;
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly text: string;
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export declare namespace SlateNodeModel {
    var create: () => void;
    var createList: (elements?: never[]) => void;
    var createProperties: (attrs?: {}) => void;
    var fromJSON: (value?: {}) => void;
    var toJSON: (options?: {}) => void;
}


// From domains/slate/op.dom.d.ts
import { SlatePoint } from "./point";
import { SlateDescendant, SlateOperation } from "./types";
export declare const SlateDOMOperations: {
    insertText($input: Element, op: SlateOperation): void;
    replaceText($input: Element, op: SlateOperation): void;
    removeText($input: Element, op: SlateOperation): void;
    splitNode($input: Element, op: SlateOperation): void;
    mergeNode($input: Element, op: SlateOperation): void;
    insertLines($input: Element, op: SlateOperation): void;
    removeLines($input: Element, op: SlateOperation): void;
    exec($input: Element, op: SlateOperation): void;
};
export declare function renderText(node: SlateDescendant & {
    key?: number;
}, extra?: {
    text?: boolean;
}): Element | null;
export declare function renderElement(node: SlateDescendant & {
    key?: number;
}, extra?: {
    text?: boolean;
}): Element | null;
export declare function buildInnerHTML(nodes: SlateDescendant[], parents?: number[], level?: number): DocumentFragment;
export declare function getNodeText($node: Element): string;
export declare function formatInnerHTML(v: string): string;
export declare function renderHTML(v: string): string;
export declare function renderNodeThenInsertLine($input: Element, op: {
    node: SlateDescendant;
    path: number[];
}): void;
export declare function renderLineNodesThenInsert($input: Element, op: {
    node: SlateDescendant[];
    path: number[];
}): void;
export declare function findInnerTextNode($node?: any): any;
export declare function getNodePath(targetNode: Element, rootNode: Element): number[];
export declare function findNodeByPathWithElement($elm: Element, path: number[]): Element | null;
export declare function refreshSelection($editor: Element, start: SlatePoint, end: SlatePoint): void;


// From domains/slate/op.node.d.ts
import { SlateDescendant, SlateOperation } from "./types";
export declare const SlateNodeOperations: {
    insertText(nodes: SlateDescendant[], op: SlateOperation): SlateDescendant[];
    replaceText(nodes: SlateDescendant[], op: SlateOperation): SlateDescendant[];
    removeText(nodes: SlateDescendant[], op: SlateOperation): SlateDescendant[];
    splitNode(nodes: SlateDescendant[], op: SlateOperation): SlateDescendant[];
    mergeNode(nodes: SlateDescendant[], op: SlateOperation): SlateDescendant[];
    insertLines(nodes: SlateDescendant[], op: SlateOperation): SlateDescendant[];
    removeLines(nodes: SlateDescendant[], op: SlateOperation): SlateDescendant[];
    exec(nodes: SlateDescendant[], op: SlateOperation): SlateDescendant[];
};
export declare function findNodeByPathWithNode(nodes: SlateDescendant[], path: number[]): SlateDescendant | null;


// From domains/slate/path.d.ts
/**
 * @file 路径
 * 可以根据给定的 number[] 从树上找到指定节点
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
export declare function SlatePathModel(props: {}): {
    methods: {
        refresh(): void;
    };
    ui: {};
    state: {};
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{}>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export declare namespace SlatePathModel {
    var isPath: (value: any) => boolean;
    var equals: (path: number[], another: number[]) => boolean;
    var previous: (path: number[]) => number[];
    var endsBefore: (path: number[], another: number[]) => boolean;
    var compare: (path: number[], another: number[]) => -1 | 0 | 1;
    var isAncestor: (path: number[], another: number[]) => boolean;
    var parent: (path: number[]) => number[];
    var isSameParent: (path: number[], another: number[]) => boolean;
}


// From domains/slate/point.d.ts
/**
 * @file 路径
 * 可以根据给定的 number[] 从树上找到指定节点
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
export type SlatePoint = {
    path: number[];
    offset: number;
};
export declare function SlatePointModel(props: {}): {
    methods: {
        refresh(): void;
    };
    ui: {};
    state: {};
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{}>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export declare namespace SlatePointModel {
    var isSamePoint: (point1: SlatePoint, point2: SlatePoint) => boolean;
    var isAtLineHead: (point: SlatePoint) => boolean;
    var isAtFirstLineHead: (point: SlatePoint) => boolean;
}
export type SlatePointModel = ReturnType<typeof SlatePointModel>;


// From domains/slate/range.d.ts
/**
 * @file 文档区间
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
export declare function SlateRangeModel(): {
    methods: {
        refresh(): void;
    };
    ui: {};
    state: {};
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{}>): () => void;
    onError(handler: Handler<BizError>): () => void;
};


// From domains/slate/selection.d.ts
/**
 * @file 选区
 * @doc https://developer.mozilla.org/en-US/docs/Web/API/Selection
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { SlatePoint } from "./point";
import { SlateDescendant } from "./types";
export declare function SlateSelectionModel(): {
    methods: {
        refresh(): void;
        /** 光标向前移动n步 */
        moveForward(param?: Partial<{
            step: number;
            min: number;
            collapse: boolean;
        }>): void;
        /** 光标向后移动n步 */
        moveBackward(param?: Partial<{
            step: number;
            min: number;
        }>): void;
        moveToPrevLineHead(): void;
        calcNextLineHead(): {
            start: {
                path: number[];
                offset: number;
            };
            end: {
                path: number[];
                offset: number;
            };
        };
        moveToNextLineHead(): void;
        /** 从选区变成位于起点的光标 */
        collapseToHead(): void;
        /** 从选区变成位于终点光标 */
        collapseToEnd(): void;
        collapseToOffset(param: {
            offset: number;
        }): void;
        setToHead(): void;
        setStartAndEnd(param: {
            start: SlatePoint;
            end: SlatePoint;
        }): void;
        handleChange(event: {
            start: SlatePoint;
            end: SlatePoint;
            collapsed: boolean;
        }): void;
    };
    ui: {};
    state: {
        readonly start: {
            line: number;
            path: number[];
            offset: number;
        };
        readonly end: {
            line: number;
            path: number[];
            offset: number;
        };
        readonly collapsed: boolean;
        readonly dirty: boolean;
    };
    readonly dirty: boolean;
    readonly start: {
        line: number;
        path: number[];
        offset: number;
    };
    readonly end: {
        line: number;
        path: number[];
        offset: number;
    };
    readonly collapsed: boolean;
    print(): {
        start: string;
        end: string;
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly start: {
            line: number;
            path: number[];
            offset: number;
        };
        readonly end: {
            line: number;
            path: number[];
            offset: number;
        };
        readonly collapsed: boolean;
        readonly dirty: boolean;
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export declare namespace SlateSelectionModel {
    var getLineLastPoint: (nodes: SlateDescendant[], line_idx: number) => {
        path: number[];
        offset: number;
    };
    var getLineLastNode: (nodes: SlateDescendant[], line_idx: number) => {
        path: number[];
        offset: number;
        node: SlateDescendant;
    };
    var getLineFirstNode: (nodes: SlateDescendant[], line_idx: number) => {
        path: number[];
        offset: number;
        node: SlateDescendant;
    };
    var isCaretAtLineEnd: (nodes: SlateDescendant[], start: SlatePoint) => boolean;
    var isCaretAtLineHead: (nodes: SlateDescendant[], start: SlatePoint) => boolean;
    var removeLine: (nodes: SlateDescendant[], idx: number) => SlateDescendant[];
    var removeLinesBetweenStartAndEnd: (nodes: SlateDescendant[], start: SlatePoint, end: SlatePoint) => SlateDescendant[];
    var removeNode: (nodes: SlateDescendant[], point: SlatePoint) => void;
}
export type SlateSelectionModel = ReturnType<typeof SlateSelectionModel>;


// From domains/slate/slate.d.ts
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { SlateText, SlateDescendant, SlateOperation, SlateOperationType } from "./types";
import { SlatePoint } from "./point";
type BeforeInputEvent = {
    preventDefault(): void;
    data: unknown;
};
type BlurEvent = {};
type FocusEvent = {};
type CompositionEndEvent = {
    data: unknown;
    preventDefault(): void;
};
type CompositionUpdateEvent = {
    preventDefault(): void;
};
type CompositionStartEvent = {
    preventDefault(): void;
};
type KeyDownEvent = {
    code: string;
    preventDefault(): void;
};
type KeyUpEvent = {
    code: string;
    preventDefault(): void;
};
type TextInsertTextOptions = {
    at?: any;
    voids?: boolean;
};
export declare function SlateEditorModel(props: {
    defaultValue?: SlateDescendant[];
}): {
    methods: {
        refresh(): void;
        emitSelectionChange(v: {
            type?: SlateOperationType;
        }): void;
        apply(operations: SlateOperation[]): void;
        findNodeByPath(path: number[]): SlateDescendant;
        getDefaultInsertLocation(): number[];
        /** 输入文本内容 */
        insertText(text: string, options?: TextInsertTextOptions): void;
        /** 前面新增行 */
        insertLineBefore(): void;
        /** 后面新增行 */
        insertLineAfter(): void;
        /** 拆分当前行 */
        splitLine(): void;
        mergeLines(start: SlatePoint): void;
        removeLines(start: SlatePoint): void;
        /** 删除指定位置的文本 */
        removeText(node: SlateText, point: SlatePoint): void;
        removeContentCrossLines(node1: SlateText, node2: SlateText, start: SlatePoint, end: SlatePoint): {
            op_start_delete_text: {
                type: SlateOperationType.RemoveText;
            } & import("./types").SlateOperationRemoveText;
            op_end_delete_text: {
                type: SlateOperationType.RemoveText;
            } & import("./types").SlateOperationRemoveText;
        };
        /** 跨行操作，删除、回车、输入 时，要不要删除中间的行，删除后 end 坐标应该在哪 */
        removeLinesCrossLines(start: SlatePoint, end: SlatePoint): {
            end: SlatePoint;
            op_remove_lines: {
                type: SlateOperationType.RemoveLines;
            } & import("./types").SlateOperationRemoveLines;
        } | null;
        /** 选中的文本后删除，可能是跨节点 */
        removeSelectedTextsCrossNodes(node: SlateText, arr: {
            start: SlatePoint;
            end: SlatePoint;
        }): void;
        handleBackward(param?: Partial<{
            unit: "character";
        }>): void;
        mapNodeWithKey(key?: string): SlateDescendant | null;
        checkIsSelectAll(): void;
        collapse(): void;
        /** 移动光标 */
        move(opts: {
            unit: "line";
            edge?: "focus";
            reverse?: boolean;
        }): void;
        getCaretPosition(): void;
        setCaretPosition(arg: {
            start: SlatePoint;
            end: SlatePoint;
        }): void;
        handleBeforeInput(event: BeforeInputEvent): void;
        handleInput(event: InputEvent): void;
        handleBlur(event: BlurEvent): void;
        handleFocus(event: FocusEvent): void;
        handleClick(): void;
        handleCompositionEnd(event: CompositionEndEvent): void;
        handleCompositionUpdate(event: CompositionUpdateEvent): void;
        handleCompositionStart(event: CompositionStartEvent): void;
        handleKeyDown(event: KeyDownEvent): void;
        handleKeyUp(event: KeyUpEvent): void;
        handleSelectionChange(): void;
    };
    ui: {
        $selection: {
            methods: {
                refresh(): void;
                moveForward(param?: Partial<{
                    step: number;
                    min: number;
                    collapse: boolean;
                }>): void;
                moveBackward(param?: Partial<{
                    step: number;
                    min: number;
                }>): void;
                moveToPrevLineHead(): void;
                calcNextLineHead(): {
                    start: {
                        path: number[];
                        offset: number;
                    };
                    end: {
                        path: number[];
                        offset: number;
                    };
                };
                moveToNextLineHead(): void;
                collapseToHead(): void;
                collapseToEnd(): void;
                collapseToOffset(param: {
                    offset: number;
                }): void;
                setToHead(): void;
                setStartAndEnd(param: {
                    start: SlatePoint;
                    end: SlatePoint;
                }): void;
                handleChange(event: {
                    start: SlatePoint;
                    end: SlatePoint;
                    collapsed: boolean;
                }): void;
            };
            ui: {};
            state: {
                readonly start: {
                    line: number;
                    path: number[];
                    offset: number;
                };
                readonly end: {
                    line: number;
                    path: number[];
                    offset: number;
                };
                readonly collapsed: boolean;
                readonly dirty: boolean;
            };
            readonly dirty: boolean;
            readonly start: {
                line: number;
                path: number[];
                offset: number;
            };
            readonly end: {
                line: number;
                path: number[];
                offset: number;
            };
            readonly collapsed: boolean;
            print(): {
                start: string;
                end: string;
            };
            ready(): void;
            destroy(): void;
            onStateChange(handler: Handler<{
                readonly start: {
                    line: number;
                    path: number[];
                    offset: number;
                };
                readonly end: {
                    line: number;
                    path: number[];
                    offset: number;
                };
                readonly collapsed: boolean;
                readonly dirty: boolean;
            }>): () => void;
            onError(handler: Handler<BizError>): () => void;
        };
        $history: {
            methods: {
                refresh(): void;
                mark(): void;
                push(ops: SlateOperation[], selection: {
                    start: SlatePoint;
                    end: SlatePoint;
                }): void;
                undo(): {
                    operations: SlateOperation[];
                    selection: {
                        start: SlatePoint;
                        end: SlatePoint;
                    };
                };
            };
            ui: {};
            state: {
                readonly stacks: {
                    type: SlateOperationType;
                    created_at: string;
                }[];
            };
            ready(): void;
            destroy(): void;
            onStateChange(handler: Handler<{
                readonly stacks: {
                    type: SlateOperationType;
                    created_at: string;
                }[];
            }>): () => void;
            onError(handler: Handler<BizError>): () => void;
        };
        $shortcut: {
            methods: {
                refresh(): void;
                register(handlers: Record<string, (event: {
                    code: string;
                    preventDefault: () => void;
                } & {
                    step?: "keydown" | "keyup";
                }) => void>): void;
                clearPressedKeys(): void;
                invokeHandlers(event: {
                    code: string;
                    preventDefault: () => void;
                }, key: string): void;
                buildShortcut(): {
                    key1: string;
                    key2: string;
                };
                setRecordingCodes(codes: string): void;
                reset(): void;
                testShortcut(opt: {
                    key1: string;
                    key2: string;
                    step: "keydown" | "keyup";
                }, event: {
                    code: string;
                    preventDefault: () => void;
                }): void;
                handleKeydown(event: {
                    code: string;
                    preventDefault: () => void;
                }): void;
                handleKeyup(event: {
                    code: string;
                    preventDefault: () => void;
                }, opt?: Partial<{
                    fake: boolean;
                }>): void;
            };
            ui: {};
            state: {
                readonly codes: string[];
                readonly codes2: string[];
            };
            ready(): void;
            destroy(): void;
            onShortcut(handler: Handler<{
                key: string;
            }>): () => void;
            onShortcutComplete(handler: Handler<{
                codes: string[];
            }>): () => void;
            onStateChange(handler: Handler<{
                readonly codes: string[];
                readonly codes2: string[];
            }>): () => void;
            onError(handler: Handler<BizError>): () => void;
        };
    };
    state: {
        readonly children: SlateDescendant[];
        readonly isFocus: boolean;
        readonly JSON: string;
    };
    readonly isFocus: boolean;
    ready(): void;
    destroy(): void;
    onAction(handler: Handler<SlateOperation[]>): () => void;
    onSelectionChange(handler: Handler<{
        type?: SlateOperationType;
        start: SlatePoint;
        end: SlatePoint;
    }>): () => void;
    onStateChange(handler: Handler<{
        readonly children: SlateDescendant[];
        readonly isFocus: boolean;
        readonly JSON: string;
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export type SlateEditorModel = ReturnType<typeof SlateEditorModel>;
export {};


// From domains/slate/text.d.ts
/**
 * @file 文本节点
 */
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
declare function SlateLeafModel(props: {
    text: string;
}): {
    methods: {
        refresh(): void;
    };
    ui: {};
    state: {
        readonly text: string;
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly text: string;
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export type SlateLeafModel = ReturnType<typeof SlateLeafModel>;
declare function SlateMarkModel(): void;
export type SlateMarkModel = ReturnType<typeof SlateMarkModel>;
export declare function SlateTextNodeModel(props: {
    key: string;
    data: Record<string, unknown>;
    /** 节点类型 */
    object: unknown;
}): {
    methods: {
        refresh(): void;
        addMark(): void;
        getParent(): void;
        getPreviousNode(path: unknown): void;
        getNextNode(): void;
        findDescendant(predicate: unknown): void;
        insertNode(path: unknown, node: unknown): void;
        removeNode(path: unknown): void;
    };
    ui: {};
    state: {
        readonly text: string;
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly text: string;
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export declare namespace SlateTextNodeModel {
    var create: () => void;
    var fromJSON: (value?: {}) => void;
    var toJSON: (options?: {}) => void;
}
export type SlateTextNodeModel = ReturnType<typeof SlateTextNodeModel>;
export {};


// From domains/slate/transforms/node.d.ts
export declare const a = "1";


// From domains/slate/types.d.ts
import { MutableRecord2 } from "@/domains/types";
import { SlatePoint } from "./point";
export type SlateNode = {};
export declare enum SlateDescendantType {
    Text = "text",
    Paragraph = "paragraph"
}
export type SlateParagraph = {
    children: SlateDescendant[];
};
export type SlateText = {
    text: string;
};
export type SlateDescendant = MutableRecord2<{
    [SlateDescendantType.Text]: SlateText;
    [SlateDescendantType.Paragraph]: SlateParagraph;
}>;
export declare enum SlateOperationType {
    InsertText = "insert_text",
    ReplaceText = "replace_text",
    RemoveText = "remove_text",
    InsertLines = "insert_line",
    RemoveLines = "remove_lines",
    MergeNode = "merge_node",
    SplitNode = "split_node",
    SetSelection = "set_selection",
    Unknown = "unknown"
}
export type SlateOperationInsertText = {
    /** 插入的文本 */
    text: string;
    original_text: string;
    path: number[];
    offset: number;
};
export type SlateOperationReplaceText = {
    /** 替换的文本 */
    text: string;
    original_text: string;
    path: number[];
    offset: number;
};
export type SlateOperationRemoveText = {
    /** 删除的文本 */
    text: string;
    original_text: string;
    ignore?: boolean;
    path: number[];
    offset: number;
};
export type SlateOperationInsertLines = {
    /** 插入的位置，取第一个元素，就是 line index */
    path: number[];
    node: (SlateDescendant & {
        key: number;
    })[];
};
export type SlateOperationRemoveLines = {
    /** 插入的位置，取第一个元素，就是 line index */
    path: number[];
    node: (SlateDescendant & {
        key: number;
    })[];
};
export type SlateOperationMergeNode = {
    /** 前一个节点的位置 */
    path: number[];
    offset: number;
    /** 当前光标的位置，只用 end */
    start: SlatePoint;
    end: SlatePoint;
    compositing?: boolean;
};
export type SlateOperationSplitNode = {
    path: number[];
    offset: number;
    /** 分割完成后的光标位置 */
    start: SlatePoint;
    /** 分割完成后的光标位置 */
    end: SlatePoint;
};
/** 设置选区/光标位置 */
export type SlateOperationSetSelection = {
    start: SlatePoint;
    end: SlatePoint;
};
export type SlateOperation = MutableRecord2<{
    [SlateOperationType.InsertText]: SlateOperationInsertText;
    [SlateOperationType.ReplaceText]: SlateOperationReplaceText;
    [SlateOperationType.RemoveText]: SlateOperationRemoveText;
    [SlateOperationType.InsertLines]: SlateOperationInsertLines;
    [SlateOperationType.RemoveLines]: SlateOperationRemoveLines;
    [SlateOperationType.MergeNode]: SlateOperationMergeNode;
    [SlateOperationType.SplitNode]: SlateOperationSplitNode;
    [SlateOperationType.SetSelection]: SlateOperationSetSelection;
}>;
type ExtendableTypes = "Editor" | "Element" | "Text" | "Selection" | "Range" | "Point" | "Operation" | "InsertNodeOperation" | "InsertTextOperation" | "MergeNodeOperation" | "MoveNodeOperation" | "RemoveNodeOperation" | "RemoveTextOperation" | "SetNodeOperation" | "SetSelectionOperation" | "SplitNodeOperation";
export interface CustomTypes {
    [key: string]: unknown;
}
export type ExtendedType<K extends ExtendableTypes, B> = unknown extends CustomTypes[K] ? B : CustomTypes[K];
export type LeafEdge = "start" | "end";
export type MaximizeMode = RangeMode | "all";
export type MoveUnit = "offset" | "character" | "word" | "line";
export type RangeDirection = TextDirection | "outward" | "inward";
export type RangeMode = "highest" | "lowest";
export type SelectionEdge = "anchor" | "focus" | "start" | "end";
export type SelectionMode = "all" | "highest" | "lowest";
export type TextDirection = "forward" | "backward";
export type TextUnit = "character" | "word" | "line" | "block";
export type TextUnitAdjustment = TextUnit | "offset";
export {};


// From domains/slate/utils/deep-equal.d.ts
export declare const isDeepEqual: (node: Record<string, any>, another: Record<string, any>) => boolean;


// From domains/slate/utils/is-object.d.ts
export declare const isObject: (value: any) => boolean;


// From domains/slate/utils/node.d.ts
import { SlateDescendant, SlateNode, SlateParagraph, SlateText } from "../types";
/**
 * 深度优先搜索 - 适合查找深层节点
 */
export declare function depthFirstSearch(nodes: (SlateDescendant & {
    key?: number;
})[], targetKey: number): SlateDescendant | null;
export declare function isText(value: any): value is SlateText;
export declare function isElement(value: any, extra?: Partial<{
    deep: boolean;
}>): value is SlateParagraph;
export declare function isNode(value: any, extra: {
    deep: boolean;
}): value is SlateNode;
export declare function isNodeList(value: any): value is SlateNode[];


// From domains/slate/utils/text.d.ts
export declare function deleteTextInRange(text: string, range: [number, number]): string;
export declare function deleteTextAtOffset(text: string, deleted: string, offset: number): string;
export declare function insertTextAtOffset(text: string, inserted: string, offset: number): string;


// From domains/slate/utils/uid.d.ts
export declare function uidFactory(): () => number;


// From domains/storage/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents<T> = {
    [Events.StateChange]: StorageCoreState<T>;
};
type StorageCoreProps<T> = {
    key: string;
    values: T;
    defaultValues: T;
    client: {
        setItem: (key: string, value: string) => void;
        getItem: (key: string) => void;
    };
};
type StorageCoreState<T> = {
    values: T;
};
export declare class StorageCore<T extends Record<string, unknown>> extends BaseDomain<TheTypesOfEvents<T>> {
    key: string;
    values: T;
    defaultValues: T;
    client: StorageCoreProps<T>["client"];
    get state(): {
        values: T;
    };
    constructor(props: Partial<{
        _name: string;
    }> & StorageCoreProps<T>);
    get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K];
    set: (key: keyof T, value: unknown) => void;
    merge: <K extends keyof T>(key: K, values: Partial<T[K]>, extra?: Partial<{
        reverse: boolean;
        limit: number;
    }>) => {};
    clear<K extends keyof T>(key: K): null | undefined;
    remove<K extends keyof T>(key: K): void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
}
export {};


// From domains/system/index.d.ts
export declare class CurSystem {
    connection: string;
    constructor();
    query_network(): any;
}
export declare const system: CurSystem;


// From domains/timer/index.d.ts
export declare class TimerCore {
    timer: null | NodeJS.Timeout;
    interval(fn: Function, delay: number): void;
    clear(): void;
}


// From domains/types/index.d.ts
export type Unpacked<T> = T extends (infer U)[] ? U : T extends (...args: any[]) => infer U ? U : T extends Promise<infer U> ? U : T;
export type MutableRecord<U> = {
    [SubType in keyof U]: {
        type: SubType;
        data: U[SubType];
    };
}[keyof U];
export type MutableRecord2<U> = {
    [SubType in keyof U]: {
        type: SubType;
    } & U[SubType];
}[keyof U];
export type Shift<T extends any[]> = ((...args: T) => void) extends (arg1: any, ...rest: infer R) => void ? R : never;
export type Rect = {
    width: number;
    height: number;
    x: number;
    y: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
};
export interface JSONArray extends Array<JSONValue> {
}
export type JSONValue = string | number | boolean | JSONObject | JSONArray | null;
export type JSONObject = {
    [Key in string]?: JSONValue;
};


// From domains/ui/affix/index.d.ts
/**
 * @file 固钉
 */
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    /** 变成固定 */
    Fixed = 0,
    /** 取消固定 */
    UnFixed = 1,
    Mounted = 2,
    /** 内容位置、宽高等信息改变 */
    SizeChange = 3,
    StateChange = 4
}
type TheTypesOfEvents = {
    [Events.Fixed]: void;
    [Events.UnFixed]: void;
    [Events.Mounted]: {
        height: number;
    };
    [Events.SizeChange]: void;
    [Events.StateChange]: AffixState;
};
type AffixProps = {
    top: number;
    defaultHeight?: number;
    onMounted?: () => void;
};
type AffixState = {
    height: number;
    fixed: boolean;
    top: number;
    style: unknown;
};
export declare class AffixCore extends BaseDomain<TheTypesOfEvents> {
    height: number;
    /** 当前 */
    curTop: number;
    /** 当距离顶部多少距离时固定 */
    targetTop: number;
    fixed: boolean;
    needRegisterAgain: boolean;
    shouldFixed: boolean;
    mounted: boolean;
    style: unknown;
    $node: null;
    get state(): AffixState;
    constructor(props: Partial<{
        _name: string;
    }> & AffixProps);
    handleMounted(rect: {
        top: number;
        height: number;
    }): void;
    handleScroll(values: {
        scrollTop: number;
    }): void;
    register(size: {
        top: number;
        height: number;
    }): void;
    registerAgain(): void;
    rect: () => {
        top: number;
        height: number;
    };
    setRect(fn: () => {
        top: number;
        height: number;
    }): void;
    fix(): void;
    unfix(): void;
    setTop: import("lodash").DebouncedFunc<(top: any) => void>;
    set(nextState: {
        fixed: boolean;
        top: number;
        style: unknown;
    }): void;
    onMounted(handler: Handler<TheTypesOfEvents[Events.Mounted]>): () => void;
    onSizeChange(handler: Handler<TheTypesOfEvents[Events.SizeChange]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/back-to-top/index.d.ts
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
export declare function BackToTopModel(props: {
    clientHeight?: number;
}): {
    methods: {
        refresh(): void;
        handleScroll(v: {
            top: number;
        }): void;
    };
    ui: {};
    state: {
        readonly showBackTop: boolean;
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly showBackTop: boolean;
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};


// From domains/ui/button/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { RefCore } from "@/domains/ui/cur";
declare enum Events {
    Click = 0,
    StateChange = 1
}
type TheTypesOfEvents<T = unknown> = {
    [Events.Click]: T | null;
    [Events.StateChange]: ButtonState;
};
type ButtonState = {
    text: string;
    loading: boolean;
    disabled: boolean;
};
type ButtonProps<T = unknown> = {
    disabled?: boolean;
    onClick: (record: T | null) => void;
};
export declare class ButtonCore<T = unknown> extends BaseDomain<TheTypesOfEvents<T>> {
    id: number;
    cur: RefCore<T>;
    state: ButtonState;
    constructor(props?: Partial<{
        _name: string;
    } & ButtonProps<T>>);
    /** 触发一次按钮点击事件 */
    click(): void;
    /** 禁用当前按钮 */
    disable(): void;
    /** 恢复按钮可用 */
    enable(): void;
    /** 当按钮处于列表中时，使用该方法保存所在列表记录 */
    bind(v: T): this;
    setLoading(loading: boolean): void;
    onClick(handler: Handler<TheTypesOfEvents<T>[Events.Click]>): void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): void;
}
type ButtonInListProps<T = unknown> = {
    onClick: (record: T) => void;
};
type TheTypesInListOfEvents<T> = {
    [Events.Click]: T;
    [Events.StateChange]: ButtonState;
};
export declare class ButtonInListCore<T> extends BaseDomain<TheTypesInListOfEvents<T>> {
    /** 列表中一类多个按钮 */
    btns: ButtonCore<T>[];
    /** 按钮点击后，该值被设置为触发点击的那个按钮 */
    cur: ButtonCore<T> | null;
    constructor(options?: Partial<{
        _name: string;
    } & ButtonInListProps<T>>);
    /** 当按钮处于列表中时，使用该方法保存所在列表记录 */
    bind(v: T): ButtonCore<T>;
    /** 清空触发点击事件时保存的按钮 */
    clear(): void;
    setLoading(loading: boolean): void;
    click(): void;
    onClick(handler: Handler<TheTypesInListOfEvents<T>[Events.Click]>): void;
    onStateChange(handler: Handler<TheTypesInListOfEvents<T>[Events.StateChange]>): void;
}
export {};


// From domains/ui/calendar/index.d.ts
import { Handler } from "@/domains/base";
type CalendarWeek = {
    id: number;
    dates: {
        id: number;
        text: string;
        yyyy: string;
        value: Date;
        time: number;
        is_prev_month: boolean;
        is_next_month: boolean;
        is_today: boolean;
    }[];
};
type CalendarCoreProps = {
    today: Date;
};
export declare function CalendarCore(props: CalendarCoreProps): {
    state: {
        readonly day: {
            text: string;
            value: Date;
            time: number;
        };
        readonly month: {
            /** 12月 */
            text: string;
            value: Date;
            time: number;
        };
        readonly year: {
            text: number;
            value: Date;
            time: number;
        };
        readonly weekdays: {
            id: number;
            text: string;
            yyyy: string;
            value: Date;
            time: number;
            is_prev_month: boolean;
            is_next_month: boolean;
            is_today: boolean;
        }[];
        readonly weeks: CalendarWeek[];
        readonly selectedDay: {
            text: string;
            value: Date;
            time: number;
        };
    };
    readonly value: Date | null;
    selectDay(day: Date): void;
    nextMonth(): void;
    prevMonth(): void;
    buildMonthText: (d: Date) => string;
    onSelectDay(handler: Handler<Date>): () => void;
    onChange(handler: Handler<{
        readonly day: {
            text: string;
            value: Date;
            time: number;
        };
        readonly month: {
            /** 12月 */
            text: string;
            value: Date;
            time: number;
        };
        readonly year: {
            text: number;
            value: Date;
            time: number;
        };
        readonly weekdays: {
            id: number;
            text: string;
            yyyy: string;
            value: Date;
            time: number;
            is_prev_month: boolean;
            is_next_month: boolean;
            is_today: boolean;
        }[];
        readonly weeks: CalendarWeek[];
        readonly selectedDay: {
            text: string;
            value: Date;
            time: number;
        };
    }>): () => void;
};
export type CalendarCore = ReturnType<typeof CalendarCore>;
export * from "./utils";


// From domains/ui/calendar/utils.d.ts
/**
 * @name toDate
 * @category Common Helpers
 * @summary Convert the given argument to an instance of Date.
 *
 * @description
 * Convert the given argument to an instance of Date.
 *
 * If the argument is an instance of Date, the function returns its clone.
 *
 * If the argument is a number, it is treated as a timestamp.
 *
 * If the argument is none of the above, the function returns Invalid Date.
 *
 * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param argument - The value to convert
 *
 * @returns The parsed date in the local time zone
 *
 * @example
 * // Clone the date:
 * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
 * //=> Tue Feb 11 2014 11:30:30
 *
 * @example
 * // Convert the timestamp to date:
 * const result = toDate(1392098430000)
 * //=> Tue Feb 11 2014 11:30:30
 */
export declare function toDate<DateType extends Date = Date>(argument: DateType | number): DateType;
/**
 * @name constructFrom
 * @category Generic Helpers
 * @summary Constructs a date using the reference date and the value
 *
 * @description
 * The function constructs a new date using the constructor from the reference
 * date and the given value. It helps to build generic functions that accept
 * date extensions.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The reference date to take constructor from
 * @param value - The value to create the date
 *
 * @returns Date initialized using the given date and value
 *
 * @example
 * import { constructFrom } from 'date-fns'
 *
 * // A function that clones a date preserving the original type
 * function cloneDate<DateType extends Date(date: DateType): DateType {
 *   return constructFrom(
 *     date, // Use contrustor from the given date
 *     date.getTime() // Use the date value to create a new date
 *   )
 * }
 */
export declare function constructFrom<DateType extends Date>(date: DateType | number, value: Date | number): DateType;
/**
 * @name addMonths
 * @category Month Helpers
 * @summary Add the specified number of months to the given date.
 *
 * @description
 * Add the specified number of months to the given date.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The date to be changed
 * @param amount - The amount of months to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 *
 * @returns The new date with the months added
 *
 * @example
 * // Add 5 months to 1 September 2014:
 * const result = addMonths(new Date(2014, 8, 1), 5)
 * //=> Sun Feb 01 2015 00:00:00
 *
 * // Add one month to 30 January 2023:
 * const result = addMonths(new Date(2023, 0, 30), 1)
 * //=> Tue Feb 28 2023 00:00:00
 */
export default function addMonths<DateType extends Date>(date: DateType | number, amount: number): DateType;
/**
 * @name startOfMonth
 * @category Month Helpers
 * @summary Return the start of a month for the given date.
 *
 * @description
 * Return the start of a month for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 *
 * @returns The start of a month
 *
 * @example
 * // The start of a month for 2 September 2014 11:55:00:
 * const result = startOfMonth(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Mon Sep 01 2014 00:00:00
 */
export declare function startOfMonth<DateType extends Date>(date: DateType | number): DateType;
/**
 * @name differenceInCalendarMonths
 * @category Month Helpers
 * @summary Get the number of calendar months between the given dates.
 *
 * @description
 * Get the number of calendar months between the given dates.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param dateLeft - The later date
 * @param dateRight - The earlier date
 *
 * @returns The number of calendar months
 *
 * @example
 * // How many calendar months are between 31 January 2014 and 1 September 2014?
 * const result = differenceInCalendarMonths(
 *   new Date(2014, 8, 1),
 *   new Date(2014, 0, 31)
 * )
 * //=> 8
 */
export declare function differenceInCalendarMonths<DateType extends Date>(dateLeft: DateType | number, dateRight: DateType | number): number;
/**
 * The era:
 * - 0 - Anno Domini (AD)
 * - 1 - Before Christ (BC)
 */
export type Era = 0 | 1;
/**
 * The year quarter. Goes from 1 to 4.
 */
export type Quarter = 1 | 2 | 3 | 4;
/**
 * The day of the week type alias. Unlike the date (the number of days since
 * the beginning of the month), which begins with 1 and is dynamic (can go up to
 * 28, 30, or 31), the day starts with 0 and static (always ends at 6). Look at
 * it as an index in an array where Sunday is the first element and Saturday
 * is the last.
 */
export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/**
 * The month type alias. Goes from 0 to 11, where 0 is January and 11 is
 * December.
 */
export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
/**
 * The locale object with all functions and data needed to parse and format
 * dates. This is what each locale implements and exports.
 */
export interface Locale {
    /** The locale code (ISO 639-1 + optional country code) */
    code: string;
    /** The function to format distance */
    /** The function to relative time */
    /** The object with functions used to localize various values */
    /** The object with functions that return localized formats */
    /** The object with functions used to match and parse various localized values */
    /** An object with locale options */
    options?: LocaleOptions;
}
/**
 * The week function options. Used to build function options.
 */
interface WeekOptions {
    /** Which day the week starts on. */
    weekStartsOn?: Day;
}
/**
 * FirstWeekContainsDate is used to determine which week is the first week of
 * the year, based on what day the January, 1 is in that week.
 *
 * The day in that week can only be 1 (Monday) or 4 (Thursday).
 *
 * Please see https://en.wikipedia.org/wiki/Week#Week_numbering for more information.
 */
export type FirstWeekContainsDate = 1 | 4;
/**
 * The first week contains date options. Used to build function options.
 */
interface FirstWeekContainsDateOptions {
    /** See {@link FirstWeekContainsDate} for more details. */
    firstWeekContainsDate?: FirstWeekContainsDate;
}
/**
 * The locale options.
 */
interface LocaleOptions extends WeekOptions, FirstWeekContainsDateOptions {
}
/** Represents a week in the month.*/
type MonthWeek = {
    /** The week number from the start of the year. */
    weekNumber: number;
    /** The dates in the week. */
    dates: Date[];
};
/** Return the weeks between two dates.  */
export declare function daysToMonthWeeks(fromDate: Date, toDate: Date, options?: {
    ISOWeek?: boolean;
    locale?: Locale;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}): MonthWeek[];
/**
 * The {@link getWeek} function options.
 */
export interface GetWeekOptions extends LocalizedOptions<"options">, WeekOptions, FirstWeekContainsDateOptions {
}
/**
 * @name getWeek
 * @category Week Helpers
 * @summary Get the local week index of the given date.
 *
 * @description
 * Get the local week index of the given date.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#Week_numbering
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The given date
 * @param options - An object with options
 *
 * @returns The week
 *
 * @example
 * // Which week of the local week numbering year is 2 January 2005 with default options?
 * const result = getWeek(new Date(2005, 0, 2))
 * //=> 2
 *
 * @example
 * // Which week of the local week numbering year is 2 January 2005,
 * // if Monday is the first day of the week,
 * // and the first week of the year always contains 4 January?
 * const result = getWeek(new Date(2005, 0, 2), {
 *   weekStartsOn: 1,
 *   firstWeekContainsDate: 4
 * })
 * //=> 53
 */
export declare function getWeek<DateType extends Date>(date: DateType | number, options?: GetWeekOptions): number;
/**
 * The {@link startOfWeekYear} function options.
 */
export interface StartOfWeekYearOptions extends LocalizedOptions<"options">, FirstWeekContainsDateOptions, WeekOptions {
}
/**
 * @name startOfWeekYear
 * @category Week-Numbering Year Helpers
 * @summary Return the start of a local week-numbering year for the given date.
 *
 * @description
 * Return the start of a local week-numbering year.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#Week_numbering
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of a week-numbering year
 *
 * @example
 * // The start of an a week-numbering year for 2 July 2005 with default settings:
 * const result = startOfWeekYear(new Date(2005, 6, 2))
 * //=> Sun Dec 26 2004 00:00:00
 *
 * @example
 * // The start of a week-numbering year for 2 July 2005
 * // if Monday is the first day of week
 * // and 4 January is always in the first week of the year:
 * const result = startOfWeekYear(new Date(2005, 6, 2), {
 *   weekStartsOn: 1,
 *   firstWeekContainsDate: 4
 * })
 * //=> Mon Jan 03 2005 00:00:00
 */
export declare function startOfWeekYear<DateType extends Date>(date: DateType | number, options?: StartOfWeekYearOptions): DateType;
/**
 * The {@link getWeekYear} function options.
 */
export interface GetWeekYearOptions extends LocalizedOptions<"options">, WeekOptions, FirstWeekContainsDateOptions {
}
/**
 * @name getWeekYear
 * @category Week-Numbering Year Helpers
 * @summary Get the local week-numbering year of the given date.
 *
 * @description
 * Get the local week-numbering year of the given date.
 * The exact calculation depends on the values of
 * `options.weekStartsOn` (which is the index of the first day of the week)
 * and `options.firstWeekContainsDate` (which is the day of January, which is always in
 * the first week of the week-numbering year)
 *
 * Week numbering: https://en.wikipedia.org/wiki/Week#Week_numbering
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The given date
 * @param options - An object with options.
 *
 * @returns The local week-numbering year
 *
 * @example
 * // Which week numbering year is 26 December 2004 with the default settings?
 * const result = getWeekYear(new Date(2004, 11, 26))
 * //=> 2005
 *
 * @example
 * // Which week numbering year is 26 December 2004 if week starts on Saturday?
 * const result = getWeekYear(new Date(2004, 11, 26), { weekStartsOn: 6 })
 * //=> 2004
 *
 * @example
 * // Which week numbering year is 26 December 2004 if the first week contains 4 January?
 * const result = getWeekYear(new Date(2004, 11, 26), { firstWeekContainsDate: 4 })
 * //=> 2004
 */
export declare function getWeekYear<DateType extends Date>(date: DateType | number, options?: GetWeekYearOptions): number;
/**
 * @name startOfISOWeek
 * @category ISO Week Helpers
 * @summary Return the start of an ISO week for the given date.
 *
 * @description
 * Return the start of an ISO week for the given date.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 *
 * @returns The start of an ISO week
 *
 * @example
 * // The start of an ISO week for 2 September 2014 11:55:00:
 * const result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Mon Sep 01 2014 00:00:00
 */
export declare function startOfISOWeek<DateType extends Date>(date: DateType | number): DateType;
/**
 * @name getISOWeek
 * @category ISO Week Helpers
 * @summary Get the ISO week of the given date.
 *
 * @description
 * Get the ISO week of the given date.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The given date
 *
 * @returns The ISO week
 *
 * @example
 * // Which week of the ISO-week numbering year is 2 January 2005?
 * const result = getISOWeek(new Date(2005, 0, 2))
 * //=> 53
 */
export declare function getISOWeek<DateType extends Date>(date: DateType | number): number;
/**
 * @name startOfISOWeekYear
 * @category ISO Week-Numbering Year Helpers
 * @summary Return the start of an ISO week-numbering year for the given date.
 *
 * @description
 * Return the start of an ISO week-numbering year,
 * which always starts 3 days before the year's first Thursday.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 *
 * @returns The start of an ISO week-numbering year
 *
 * @example
 * // The start of an ISO week-numbering year for 2 July 2005:
 * const result = startOfISOWeekYear(new Date(2005, 6, 2))
 * //=> Mon Jan 03 2005 00:00:00
 */
export declare function startOfISOWeekYear<DateType extends Date>(date: DateType | number): DateType;
/**
 * @name getISOWeekYear
 * @category ISO Week-Numbering Year Helpers
 * @summary Get the ISO week-numbering year of the given date.
 *
 * @description
 * Get the ISO week-numbering year of the given date,
 * which always starts 3 days before the year's first Thursday.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The given date
 *
 * @returns The ISO week-numbering year
 *
 * @example
 * // Which ISO-week numbering year is 2 January 2005?
 * const result = getISOWeekYear(new Date(2005, 0, 2))
 * //=> 2004
 */
export declare function getISOWeekYear<DateType extends Date>(date: DateType | number): number;
/**
 * @name endOfISOWeek
 * @category ISO Week Helpers
 * @summary Return the end of an ISO week for the given date.
 *
 * @description
 * Return the end of an ISO week for the given date.
 * The result will be in the local timezone.
 *
 * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 *
 * @returns The end of an ISO week
 *
 * @example
 * // The end of an ISO week for 2 September 2014 11:55:00:
 * const result = endOfISOWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Sun Sep 07 2014 23:59:59.999
 */
export declare function endOfISOWeek<DateType extends Date>(date: DateType | number): DateType;
/**
 * The {@link endOfWeek} function options.
 */
export interface EndOfWeekOptions extends WeekOptions, LocalizedOptions<"options"> {
}
/**
 * @name endOfWeek
 * @category Week Helpers
 * @summary Return the end of a week for the given date.
 *
 * @description
 * Return the end of a week for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The end of a week
 *
 * @example
 * // The end of a week for 2 September 2014 11:55:00:
 * const result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Sat Sep 06 2014 23:59:59.999
 *
 * @example
 * // If the week starts on Monday, the end of the week for 2 September 2014 11:55:00:
 * const result = endOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
 * //=> Sun Sep 07 2014 23:59:59.999
 */
export declare function endOfWeek<DateType extends Date>(date: DateType | number, options?: EndOfWeekOptions): DateType;
/**
 * Return the weeks belonging to the given month, adding the "outside days" to
 * the first and last week.
 */
export declare function getMonthWeeks(month: Date, options: {
    locale: Locale;
    useFixedWeeks?: boolean;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    ISOWeek?: boolean;
}): MonthWeek[];
/**
 * The {@link getWeeksInMonth} function options.
 */
export interface GetWeeksInMonthOptions extends LocalizedOptions<"options">, WeekOptions {
}
/**
 * @name getWeeksInMonth
 * @category Week Helpers
 * @summary Get the number of calendar weeks a month spans.
 *
 * @description
 * Get the number of calendar weeks the month in the given date spans.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The given date
 * @param options - An object with options.
 *
 * @returns The number of calendar weeks
 *
 * @example
 * // How many calendar weeks does February 2015 span?
 * const result = getWeeksInMonth(new Date(2015, 1, 8))
 * //=> 4
 *
 * @example
 * // If the week starts on Monday,
 * // how many calendar weeks does July 2017 span?
 * const result = getWeeksInMonth(new Date(2017, 6, 5), { weekStartsOn: 1 })
 * //=> 6
 */
export declare function getWeeksInMonth<DateType extends Date>(date: DateType | number, options?: GetWeeksInMonthOptions): number;
/**
 * The {@link differenceInCalendarWeeks} function options.
 */
export interface DifferenceInCalendarWeeksOptions extends LocalizedOptions<"options">, WeekOptions {
}
/**
 * @name differenceInCalendarWeeks
 * @category Week Helpers
 * @summary Get the number of calendar weeks between the given dates.
 *
 * @description
 * Get the number of calendar weeks between the given dates.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param dateLeft - The later date
 * @param dateRight - The earlier date
 * @param options - An object with options.
 *
 * @returns The number of calendar weeks
 *
 * @example
 * // How many calendar weeks are between 5 July 2014 and 20 July 2014?
 * const result = differenceInCalendarWeeks(
 *   new Date(2014, 6, 20),
 *   new Date(2014, 6, 5)
 * )
 * //=> 3
 *
 * @example
 * // If the week starts on Monday,
 * // how many calendar weeks are between 5 July 2014 and 20 July 2014?
 * const result = differenceInCalendarWeeks(
 *   new Date(2014, 6, 20),
 *   new Date(2014, 6, 5),
 *   { weekStartsOn: 1 }
 * )
 * //=> 2
 */
export declare function differenceInCalendarWeeks<DateType extends Date>(dateLeft: DateType | number, dateRight: DateType | number, options?: DifferenceInCalendarWeeksOptions): number;
/**
 * The {@link startOfWeek} function options.
 */
export interface StartOfWeekOptions extends LocalizedOptions<"options">, WeekOptions {
}
/**
 * @name startOfWeek
 * @category Week Helpers
 * @summary Return the start of a week for the given date.
 *
 * @description
 * Return the start of a week for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 * @param options - An object with options
 *
 * @returns The start of a week
 *
 * @example
 * // The start of a week for 2 September 2014 11:55:00:
 * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Sun Aug 31 2014 00:00:00
 *
 * @example
 * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
 * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 })
 * //=> Mon Sep 01 2014 00:00:00
 */
export declare function startOfWeek<DateType extends Date>(date: DateType | number, options?: StartOfWeekOptions): DateType;
/**
 * The localized function options. Used to build function options.
 */
export interface LocalizedOptions<LocaleFields extends keyof Locale> {
    /** The locale to use in the function. */
    locale?: Pick<Locale, LocaleFields>;
}
export type DefaultOptions = LocalizedOptions<keyof Locale> & WeekOptions & FirstWeekContainsDateOptions;
export declare function getDefaultOptions(): DefaultOptions;
/**
 * @name lastDayOfMonth
 * @category Month Helpers
 * @summary Return the last day of a month for the given date.
 *
 * @description
 * Return the last day of a month for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 *
 * @returns The last day of a month
 *
 * @example
 * // The last day of a month for 2 September 2014 11:55:00:
 * const result = lastDayOfMonth(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 30 2014 00:00:00
 */
export declare function lastDayOfMonth<DateType extends Date>(date: DateType | number): DateType;
/**
 * @name addWeeks
 * @category Week Helpers
 * @summary Add the specified number of weeks to the given date.
 *
 * @description
 * Add the specified number of week to the given date.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The date to be changed
 * @param amount - The amount of weeks to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 *
 * @returns The new date with the weeks added
 *
 * @example
 * // Add 4 weeks to 1 September 2014:
 * const result = addWeeks(new Date(2014, 8, 1), 4)
 * //=> Mon Sep 29 2014 00:00:00
 */
export declare function addWeeks<DateType extends Date>(date: DateType | number, amount: number): DateType;
/**
 * @name addDays
 * @category Day Helpers
 * @summary Add the specified number of days to the given date.
 *
 * @description
 * Add the specified number of days to the given date.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The date to be changed
 * @param amount - The amount of days to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
 *
 * @returns The new date with the days added
 *
 * @example
 * // Add 10 days to 1 September 2014:
 * const result = addDays(new Date(2014, 8, 1), 10)
 * //=> Thu Sep 11 2014 00:00:00
 */
export declare function addDays<DateType extends Date>(date: DateType | number, amount: number): DateType;
/**
 * @name endOfMonth
 * @category Month Helpers
 * @summary Return the end of a month for the given date.
 *
 * @description
 * Return the end of a month for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 *
 * @returns The end of a month
 *
 * @example
 * // The end of a month for 2 September 2014 11:55:00:
 * const result = endOfMonth(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 30 2014 23:59:59.999
 */
export declare function endOfMonth<DateType extends Date>(date: DateType | number): DateType;
/**
 * @name differenceInCalendarDays
 * @category Day Helpers
 * @summary Get the number of calendar days between the given dates.
 *
 * @description
 * Get the number of calendar days between the given dates. This means that the times are removed
 * from the dates and then the difference in days is calculated.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param dateLeft - The later date
 * @param dateRight - The earlier date
 *
 * @returns The number of calendar days
 *
 * @example
 * // How many calendar days are between
 * // 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
 * const result = differenceInCalendarDays(
 *   new Date(2012, 6, 2, 0, 0),
 *   new Date(2011, 6, 2, 23, 0)
 * )
 * //=> 366
 * // How many calendar days are between
 * // 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
 * const result = differenceInCalendarDays(
 *   new Date(2011, 6, 3, 0, 1),
 *   new Date(2011, 6, 2, 23, 59)
 * )
 * //=> 1
 */
export declare function differenceInCalendarDays<DateType extends Date>(dateLeft: DateType | number, dateRight: DateType | number): number;
/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */
export declare function getTimezoneOffsetInMilliseconds(date: Date): number;
/**
 * @name startOfDay
 * @category Day Helpers
 * @summary Return the start of a day for the given date.
 *
 * @description
 * Return the start of a day for the given date.
 * The result will be in the local timezone.
 *
 * @typeParam DateType - The `Date` type, the function operates on. Gets inferred from passed arguments. Allows to use extensions like [`UTCDate`](https://github.com/date-fns/utc).
 *
 * @param date - The original date
 *
 * @returns The start of a day
 *
 * @example
 * // The start of a day for 2 September 2014 11:55:00:
 * const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0))
 * //=> Tue Sep 02 2014 00:00:00
 */
export declare function startOfDay<DateType extends Date>(date: DateType | number): DateType;
/**
 * @constant
 * @name millisecondsInDay
 * @summary Milliseconds in 1 day.
 */
export declare const millisecondsInDay = 86400000;
/**
 * @constant
 * @name millisecondsInWeek
 * @summary Milliseconds in 1 week.
 */
export declare const millisecondsInWeek = 604800000;
export {};


// From domains/ui/checkbox/group.d.ts
/**
 * @file 多选
 */
import { BaseDomain, Handler } from "@/domains/base";
import { CheckboxCore } from ".";
declare enum Events {
    StateChange = 0,
    Change = 1
}
type TheTypesOfEvents<T> = {
    [Events.StateChange]: CheckboxGroupState<T>;
    [Events.Change]: T[];
};
type CheckboxGroupOption<T> = {
    value: T;
    label: string;
    checked?: boolean;
    disabled?: boolean;
};
type CheckboxGroupProps<T> = {
    options?: CheckboxGroupOption<T>[];
    checked?: boolean;
    disabled?: boolean;
    required?: boolean;
    onChange?: (options: T[]) => void;
};
type CheckboxGroupState<T> = Omit<CheckboxGroupProps<T>, "options"> & {
    options: {
        label: string;
        value: T;
        core: CheckboxCore;
    }[];
    values: T[];
    indeterminate: boolean;
};
export declare class CheckboxGroupCore<T extends any> extends BaseDomain<TheTypesOfEvents<T>> {
    shape: "checkbox-group";
    options: {
        label: string;
        value: T;
        core: CheckboxCore;
    }[];
    disabled: CheckboxGroupProps<T>["disabled"];
    values: T[];
    get indeterminate(): boolean;
    get state(): CheckboxGroupState<T>;
    prevChecked: boolean;
    constructor(props?: {
        _name?: string;
    } & CheckboxGroupProps<T>);
    checkOption(value: T): void;
    uncheckOption(value: T): void;
    reset(): void;
    setOptions(options: CheckboxGroupOption<T>[]): void;
    onChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/checkbox/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence";
declare enum Events {
    StateChange = 0,
    Change = 1
}
type TheTypesOfEvents = {
    [Events.StateChange]: CheckboxState;
    [Events.Change]: boolean;
};
type CheckboxProps = {
    label?: string;
    checked?: boolean;
    value?: boolean;
    disabled?: boolean;
    required?: boolean;
    onChange?: (checked: boolean) => void;
};
type CheckboxState = CheckboxProps & {};
export declare class CheckboxCore extends BaseDomain<TheTypesOfEvents> {
    shape: "checkbox";
    label: string;
    disabled: CheckboxProps["disabled"];
    checked: boolean;
    defaultChecked: boolean;
    presence: PresenceCore;
    get state(): CheckboxState;
    get value(): boolean | undefined;
    get defaultValue(): boolean;
    prev_checked: boolean;
    constructor(props?: {
        _name?: string;
    } & CheckboxProps);
    /** 切换选中状态 */
    toggle(): void;
    check(): void;
    uncheck(): void;
    reset(): void;
    setValue(v: boolean): void;
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/collection/index.d.ts
import { BaseDomain } from "@/domains/base";
type TheTypesOfEvents = {};
export declare class CollectionCore extends BaseDomain<TheTypesOfEvents> {
    itemMap: Map<unknown, unknown>;
    setWrap(wrap: unknown): void;
    add(key: unknown, v: unknown): void;
    remove(key: unknown): void;
    getItems(): unknown[];
}
export {};


// From domains/ui/context-menu/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { MenuCore } from "@/domains/ui/menu";
import { MenuItemCore } from "@/domains/ui/menu/item";
import { Rect } from "@/domains/ui/popper/types";
declare enum Events {
    StateChange = 0,
    Show = 1,
    Hidden = 2
}
type TheTypeOfEvent = {
    [Events.StateChange]: ContextMenuState;
    [Events.Show]: void;
    [Events.Hidden]: void;
};
type ContextMenuState = {
    items: MenuItemCore[];
};
type ContextMenuProps = {
    items: MenuItemCore[];
};
export declare class ContextMenuCore extends BaseDomain<TheTypeOfEvent> {
    menu: MenuCore;
    state: ContextMenuState;
    constructor(options: Partial<{
        _name: string;
    } & ContextMenuProps>);
    show(position?: Partial<{
        x: number;
        y: number;
    }>): void;
    hide(): void;
    setReference(reference: {
        getRect: () => Rect;
    }): void;
    updateReference(reference: {
        getRect: () => Rect;
    }): void;
    setItems(items: MenuItemCore[]): void;
    onStateChange(handler: Handler<TheTypeOfEvent[Events.StateChange]>): void;
    onShow(handler: Handler<TheTypeOfEvent[Events.Show]>): void;
    onHide(handler: Handler<TheTypeOfEvent[Events.Hidden]>): void;
}
export {};


// From domains/ui/cur/index.d.ts
/**
 * @file 一个缓存/当前值
 * 类似 useRef
 */
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents<T> = {
    [Events.StateChange]: T;
};
type RefProps<T> = {
    defaultValue?: T;
    onChange?: (v: T) => void;
};
export declare class RefCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
    value: T | null;
    get state(): T | null;
    constructor(options?: Partial<{
        _name: string;
    }> & RefProps<T>);
    /** 暂存一个值 */
    select(value: T): void;
    patch(value: Partial<T>): void;
    /** 暂存的值是否为空 */
    isEmpty(): boolean;
    /** 返回 select 方法保存的 value 并将 value 重置为 null */
    clear(): void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/date-picker/index.d.ts
import { Handler } from "@/domains/base";
import { PopoverCore } from "@/domains/ui/popover";
import { ButtonCore } from "@/domains/ui/button";
export declare function DatePickerCore(props: {
    today: Date;
}): {
    shape: "date-picker";
    state: {
        readonly date: string;
        readonly value: Date | null;
    };
    readonly value: Date | null;
    $popover: PopoverCore;
    $calendar: {
        state: {
            readonly day: {
                text: string;
                value: Date;
                time: number;
            };
            readonly month: {
                text: string;
                value: Date;
                time: number;
            };
            readonly year: {
                text: number;
                value: Date;
                time: number;
            };
            readonly weekdays: {
                id: number;
                text: string;
                yyyy: string;
                value: Date;
                time: number;
                is_prev_month: boolean;
                is_next_month: boolean;
                is_today: boolean;
            }[];
            readonly weeks: {
                id: number;
                dates: {
                    id: number;
                    text: string;
                    yyyy: string;
                    value: Date;
                    time: number;
                    is_prev_month: boolean;
                    is_next_month: boolean;
                    is_today: boolean;
                }[];
            }[];
            readonly selectedDay: {
                text: string;
                value: Date;
                time: number;
            };
        };
        readonly value: Date | null;
        selectDay(day: Date): void;
        nextMonth(): void;
        prevMonth(): void;
        buildMonthText: (d: Date) => string;
        onSelectDay(handler: Handler<Date>): () => void;
        onChange(handler: Handler<{
            readonly day: {
                text: string;
                value: Date;
                time: number;
            };
            readonly month: {
                text: string;
                value: Date;
                time: number;
            };
            readonly year: {
                text: number;
                value: Date;
                time: number;
            };
            readonly weekdays: {
                id: number;
                text: string;
                yyyy: string;
                value: Date;
                time: number;
                is_prev_month: boolean;
                is_next_month: boolean;
                is_today: boolean;
            }[];
            readonly weeks: {
                id: number;
                dates: {
                    id: number;
                    text: string;
                    yyyy: string;
                    value: Date;
                    time: number;
                    is_prev_month: boolean;
                    is_next_month: boolean;
                    is_today: boolean;
                }[];
            }[];
            readonly selectedDay: {
                text: string;
                value: Date;
                time: number;
            };
        }>): () => void;
    };
    $btn: ButtonCore<unknown>;
    setValue(v: Date): void;
    onChange(handler: Handler<Date | null>): () => void;
    onStateChange(handler: Handler<{
        readonly date: string;
        readonly value: Date | null;
    }>): () => void;
};
export type DatePickerCore = ReturnType<typeof DatePickerCore>;


// From domains/ui/dialog/index.d.ts
/**
 * @file 弹窗核心类
 */
import { BaseDomain, Handler } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence";
import { ButtonCore } from "@/domains/ui/button";
declare enum Events {
    BeforeShow = 0,
    Show = 1,
    BeforeHidden = 2,
    Hidden = 3,
    Unmounted = 4,
    VisibleChange = 5,
    Cancel = 6,
    OK = 7,
    AnimationStart = 8,
    AnimationEnd = 9,
    StateChange = 10
}
type TheTypesOfEvents = {
    [Events.BeforeShow]: void;
    [Events.Show]: void;
    [Events.BeforeHidden]: void;
    [Events.Hidden]: void;
    [Events.Unmounted]: void;
    [Events.VisibleChange]: boolean;
    [Events.OK]: void;
    [Events.Cancel]: void;
    [Events.AnimationStart]: void;
    [Events.AnimationEnd]: void;
    [Events.StateChange]: DialogState;
};
export type DialogProps = {
    title?: string;
    footer?: boolean;
    closeable?: boolean;
    mask?: boolean;
    open?: boolean;
    onCancel?: () => void;
    onOk?: () => void;
    onUnmounted?: () => void;
};
type DialogState = {
    open: boolean;
    title: string;
    footer: boolean;
    /** 能否手动关闭 */
    closeable: boolean;
    mask: boolean;
    enter: boolean;
    visible: boolean;
    exit: boolean;
};
export declare class DialogCore extends BaseDomain<TheTypesOfEvents> {
    open: boolean;
    title: string;
    footer: boolean;
    closeable: boolean;
    mask: boolean;
    present: PresenceCore;
    okBtn: ButtonCore<unknown>;
    cancelBtn: ButtonCore<unknown>;
    get state(): DialogState;
    constructor(props?: Partial<{
        _name: string;
    }> & DialogProps);
    toggle(): void;
    /** 显示弹窗 */
    show(): void;
    /** 隐藏弹窗 */
    hide(opt?: Partial<{
        destroy: boolean;
    }>): void;
    ok(): void;
    cancel(): void;
    setTitle(title: string): void;
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>): () => void;
    onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>): () => void;
    onUnmounted(handler: Handler<TheTypesOfEvents[Events.Unmounted]>): () => void;
    onVisibleChange(handler: Handler<TheTypesOfEvents[Events.VisibleChange]>): () => void;
    onOk(handler: Handler<TheTypesOfEvents[Events.OK]>): () => void;
    onCancel(handler: Handler<TheTypesOfEvents[Events.Cancel]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    get [Symbol.toStringTag](): string;
}
export {};


// From domains/ui/direction/index.d.ts
export type Direction = "ltr" | "rtl";
export type Orientation = "horizontal" | "vertical";


// From domains/ui/dismissable-layer/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
type AbsNode = {};
declare enum Events {
    /** 遮罩消失 */
    Dismiss = 0,
    FocusOutside = 1,
    PointerDownOutside = 2,
    InteractOutside = 3
}
type TheTypesOfEvents = {
    [Events.Dismiss]: void;
    [Events.PointerDownOutside]: void;
    [Events.FocusOutside]: void;
    [Events.InteractOutside]: void;
};
type DismissableLayerState = {};
export declare class DismissableLayerCore extends BaseDomain<TheTypesOfEvents> {
    name: string;
    layers: Set<unknown>;
    layersWithOutsidePointerEventsDisabled: Set<unknown>;
    branches: Set<AbsNode>;
    isPointerInside: boolean;
    state: DismissableLayerState;
    constructor(options?: Partial<{
        _name: string;
    }>);
    handlePointerOutside(branch: HTMLElement): void;
    /** 响应点击事件 */
    pointerDown(): void;
    /** 响应冒泡到最顶层时的点击事件 */
    handlePointerDownOnTop(absNode?: {}): void;
    onDismiss(handler: Handler<TheTypesOfEvents[Events.Dismiss]>): () => void;
}
export {};


// From domains/ui/drag-zone/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0,
    Change = 1
}
type TheTypesOfEvents = {
    [Events.Change]: File[];
    [Events.StateChange]: DragZoneState;
};
type DragZoneProps = {
    tip?: string;
    fill?: boolean;
    onChange?: (files: File[]) => void;
};
type DragZoneState = {
    hovering: boolean;
    selected: boolean;
    files: File[];
    value: File[];
    tip: string;
};
export declare class DragZoneCore extends BaseDomain<TheTypesOfEvents> {
    shape: "drag-upload";
    _tip: string;
    _fill: boolean;
    _hovering: boolean;
    _selected: boolean;
    _files: File[];
    get state(): DragZoneState;
    get value(): File[];
    get files(): File[];
    get hovering(): boolean;
    constructor(props?: Partial<{
        _name: string;
    }> & DragZoneProps);
    handleDragover(): void;
    handleDragleave(): void;
    handleDrop(files: File[]): void;
    getFileByName(name: string): File | undefined;
    setValue(): void;
    onChange(handler: Handler<TheTypesOfEvents[Events.Change]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/dropdown-menu/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { MenuCore } from "@/domains/ui/menu";
import { MenuItemCore } from "@/domains/ui/menu/item";
import { Side } from "@/domains/ui/popper/types";
import { Align } from "@/domains/ui/popper";
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents = {
    [Events.StateChange]: DropdownMenuState;
};
type DropdownMenuProps = {
    side?: Side;
    align?: Align;
    items?: MenuItemCore[];
    onHidden?: () => void;
};
type DropdownMenuState = {
    items: MenuItemCore[];
    open: boolean;
    disabled: boolean;
    enter: boolean;
    visible: boolean;
    exit: boolean;
};
export declare class DropdownMenuCore extends BaseDomain<TheTypesOfEvents> {
    open: boolean;
    disabled: boolean;
    get state(): DropdownMenuState;
    menu: MenuCore;
    subs: MenuCore[];
    items: MenuItemCore[];
    constructor(props?: {
        _name?: string;
    } & DropdownMenuProps);
    listenItems(items: MenuItemCore[]): void;
    setItems(items: MenuItemCore[]): void;
    showMenuItem(label: string): void;
    toggle(position?: Partial<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>): void;
    hide(): void;
    unmount(): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): void;
}
export {};


// From domains/ui/dynamic-content/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents = {
    [Events.StateChange]: DynamicContentCoreState;
};
type DynamicContentCoreProps = {
    unique_id?: unknown;
    defaultValue?: number;
    value: number;
};
type DynamicContentCoreState = {
    value: number;
};
export declare class DynamicContentCore extends BaseDomain<TheTypesOfEvents> {
    unique_uid?: unknown;
    value: number;
    get state(): DynamicContentCoreState;
    constructor(props: Partial<{
        _name: string;
    }> & DynamicContentCoreProps);
    show(value: number): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export declare class DynamicContentInListCore extends BaseDomain<TheTypesOfEvents> {
    /** 列表中一类多个按钮 */
    btns: DynamicContentCore[];
    /** 按钮点击后，该值被设置为触发点击的那个按钮 */
    cur: DynamicContentCore | null;
    defaultValue: number;
    constructor(props: Partial<{
        _name: string;
    }> & {
        value: number;
    });
    /** 当按钮处于列表中时，使用该方法保存所在列表记录 */
    bind(unique_id: unknown): DynamicContentCore;
    /** 清空触发点击事件时保存的按钮 */
    clear(): void;
    select(unique_id: unknown): void;
    set(v: number): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): void;
}
export {};


// From domains/ui/focus-scope/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0,
    Focusin = 1,
    Focusout = 2
}
type TheTypesOfEvents = {
    [Events.StateChange]: FocusScopeState;
    [Events.Focusin]: void;
    [Events.Focusout]: void;
};
type FocusScopeState = {
    paused: boolean;
};
export declare class FocusScopeCore extends BaseDomain<TheTypesOfEvents> {
    name: string;
    state: FocusScopeState;
    constructor(options?: Partial<{
        _name: string;
    }>);
    pause(): void;
    resume(): void;
    focusin(): void;
    focusout(): void;
    onFocusin(handler: Handler<TheTypesOfEvents[Events.Focusin]>): void;
    onFocusout(handler: Handler<TheTypesOfEvents[Events.Focusout]>): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): void;
}
export {};


// From domains/ui/form/field.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { ValueInputInterface } from "./types";
declare enum Events {
    Show = 0,
    Hide = 1,
    StateChange = 2
}
type TheTypesOfEvents = {
    [Events.Show]: void;
    [Events.Hide]: void;
    [Events.StateChange]: FormFieldCoreState;
};
type FormFieldCoreState = {
    label: string;
    name: string;
    required: boolean;
    hidden: boolean;
};
export declare class FormFieldCore<T extends {
    label: string;
    name: string;
    required?: boolean;
    input: ValueInputInterface<any>;
}> extends BaseDomain<TheTypesOfEvents> {
    _label: string;
    _name: string;
    _required: boolean;
    _hidden: boolean;
    $input: T["input"];
    get state(): FormFieldCoreState;
    get label(): string;
    get name(): string;
    constructor(props: Partial<{
        _name: string;
    }> & T);
    setLabel(label: string): void;
    setValue(...args: Parameters<typeof this.$input.setValue>): void;
    hide(): void;
    show(): void;
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>): () => void;
    onHide(handler: Handler<TheTypesOfEvents[Events.Hide]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/form/image-upload/index.d.ts
import { Handler } from "@/domains/base";
import { ImageCore } from "@/domains/ui/image";
import { DragZoneCore } from "@/domains/ui/drag-zone";
import { OSS } from "@/biz/oss";
import { BizError } from "@/domains/error";
export declare function ImageUploadCore(props: {
    tip?: string;
    oss: OSS;
    onSelectFile?: () => void;
    onChange?: (v: {
        key: string;
    }) => void;
}): {
    shape: "image-upload";
    state: {
        readonly value: {
            key: string;
        };
        readonly url: string;
        readonly file: File | null;
        readonly uploading: boolean;
        readonly percent: number;
        readonly error: BizError | null;
    };
    readonly value: {
        key: string;
    };
    readonly defaultValue: {
        key: string;
    };
    ui: {
        $zone: DragZoneCore;
        $img: ImageCore;
    };
    setValue(opt: {
        key: string;
    }): void;
    clear(): void;
    onChange(handler: Handler<{
        key: string;
    }>): () => void;
    onStateChange(handler: Handler<{
        readonly value: {
            key: string;
        };
        readonly url: string;
        readonly file: File | null;
        readonly uploading: boolean;
        readonly percent: number;
        readonly error: BizError | null;
    }>): () => void;
};
export type ImageUploadCore = ReturnType<typeof ImageUploadCore>;


// From domains/ui/form/index.d.ts
/**
 * @file 多字段 Input
 */
import { Handler } from "@/domains/base";
import { FormFieldCore } from "./field";
import { ValueInputInterface } from "./types";
import { Result } from "@/domains/result";
type FormProps<F extends Record<string, FormFieldCore<any>>> = {
    fields: F;
};
export declare function FormCore<F extends Record<string, FormFieldCore<{
    label: string;
    name: string;
    input: ValueInputInterface<any>;
}>> = {}>(props: FormProps<F>): {
    symbol: "FormCore";
    shape: "form";
    state: {
        readonly value: { [K in keyof F]: F[K]["$input"]["value"]; };
        readonly fields: FormFieldCore<{
            label: string;
            name: string;
            input: ValueInputInterface<any>;
        }>[];
        readonly inline: boolean;
    };
    readonly value: { [K in keyof F]: F[K]["$input"]["value"]; };
    readonly fields: F;
    setValue(v: { [K in keyof F]: F[K]["$input"]["value"]; }, extra?: {
        silence?: boolean;
    }): void;
    setInline(v: boolean): void;
    input<Key extends keyof F>(key: Key, value: { [K in keyof F]: F[K]["$input"]["value"]; }[Key]): void;
    submit(): void;
    validate(): Result<{ [K in keyof F]: F[K]["$input"]["value"]; }>;
    onSubmit(handler: Handler<{ [K in keyof F]: F[K]["$input"]["value"]; }>): void;
    onInput(handler: Handler<{ [K in keyof F]: F[K]["$input"]["value"]; }>): void;
    onChange(handler: Handler<{ [K in keyof F]: F[K]["$input"]["value"]; }>): () => void;
    onStateChange(handler: Handler<{
        readonly value: { [K in keyof F]: F[K]["$input"]["value"]; };
        readonly fields: FormFieldCore<{
            label: string;
            name: string;
            input: ValueInputInterface<any>;
        }>[];
        readonly inline: boolean;
    }>): () => void;
};
export type FormCore<F extends Record<string, FormFieldCore<{
    label: string;
    name: string;
    input: ValueInputInterface<any>;
}>> = {}> = ReturnType<typeof FormCore<F>>;
export {};


// From domains/ui/form/input/connect.web.d.ts
import { InputCore } from "./index";
export declare function connect(store: InputCore<string>, $input: HTMLInputElement): void;


// From domains/ui/form/input/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { ValueInputInterface } from "@/domains/ui/form/types";
declare enum Events {
    Change = 10,
    StateChange = 11,
    Mounted = 12,
    Focus = 13,
    Blur = 14,
    Enter = 15,
    KeyDown = 16,
    Clear = 17,
    Click = 18
}
type TheTypesOfEvents<T> = {
    [Events.Mounted]: void;
    [Events.Change]: T;
    [Events.Blur]: T;
    [Events.Enter]: T;
    [Events.KeyDown]: {
        key: string;
        preventDefault: () => void;
    };
    [Events.Focus]: void;
    [Events.Clear]: void;
    [Events.Click]: {
        x: number;
        y: number;
    };
    [Events.StateChange]: InputState<T>;
};
export type InputProps<T> = {
    /** 字段键 */
    name?: string;
    disabled?: boolean;
    defaultValue: T;
    placeholder?: string;
    type?: string;
    autoFocus?: boolean;
    autoComplete?: boolean;
    ignoreEnterEvent?: boolean;
    onChange?: (v: T) => void;
    onKeyDown?: (v: {
        key: string;
        preventDefault: () => void;
    }) => void;
    onEnter?: (v: T) => void;
    onBlur?: (v: T) => void;
    onClear?: () => void;
    onMounted?: () => void;
};
type InputState<T> = {
    value: T;
    placeholder: string;
    disabled: boolean;
    loading: boolean;
    focus: boolean;
    type: string;
    tmpType: string;
    allowClear: boolean;
    autoFocus: boolean;
    autoComplete: boolean;
};
export declare class InputCore<T> extends BaseDomain<TheTypesOfEvents<T>> implements ValueInputInterface<T> {
    shape: "input";
    defaultValue: T;
    value: T;
    placeholder: string;
    disabled: boolean;
    allowClear: boolean;
    autoComplete: boolean;
    autoFocus: boolean;
    ignoreEnterEvent: boolean;
    isFocus: boolean;
    type: string;
    loading: boolean;
    /** 被消费过的值，用于做比较判断 input 值是否发生改变 */
    valueUsed: unknown;
    tmpType: string;
    get state(): InputState<T>;
    constructor(props: {
        unique_id?: string;
    } & InputProps<T>);
    setMounted(): void;
    handleKeyDown(event: {
        key: string;
        preventDefault: () => void;
    }): void;
    handleEnter(): void;
    handleFocus(): void;
    handleBlur(): void;
    handleClick(event: {
        x: number;
        y: number;
    }): void;
    handleChange(event: unknown): void;
    setValue(value: T, extra?: Partial<{
        silence: boolean;
    }>): void;
    setPlaceholder(v: string): void;
    setLoading(loading: boolean): void;
    setFocus(): void;
    focus(): void;
    enable(): void;
    disable(): void;
    showText(): void;
    hideText(): void;
    clear(): void;
    reset(): void;
    enter(): void;
    onChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
    onMounted(handler: Handler<TheTypesOfEvents<T>[Events.Mounted]>): () => void;
    onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>): () => void;
    onBlur(handler: Handler<TheTypesOfEvents<T>[Events.Blur]>): () => void;
    onKeyDown(handler: Handler<TheTypesOfEvents<T>[Events.KeyDown]>): () => void;
    onEnter(handler: Handler<TheTypesOfEvents<T>[Events.Enter]>): () => void;
    onClick(handler: Handler<TheTypesOfEvents<T>[Events.Click]>): () => void;
    onClear(handler: Handler<TheTypesOfEvents<T>[Events.Clear]>): () => void;
}
type InputInListProps<T = unknown> = {
    onChange?: (record: T) => void;
} & InputProps<T>;
type TheTypesInListOfEvents<K extends string, T> = {
    [Events.Change]: [K, T];
    [Events.StateChange]: InputProps<T>;
};
export declare class InputInListCore<K extends string, T> extends BaseDomain<TheTypesInListOfEvents<K, T>> {
    defaultValue: T;
    list: InputCore<T>[];
    cached: Record<K, InputCore<T>>;
    values: Map<K, T | null>;
    constructor(props: Partial<{
        unique_id: string;
    }> & InputInListProps<T>);
    bind(unique_id: K, options?: {
        defaultValue?: T;
    }): InputCore<T>;
    getCur(unique_id: K): Record<K, InputCore<T>>[K] | null;
    setValue(v: T): void;
    clear(): void;
    getValueByUniqueId(key: K): NonNullable<T> | null;
    toJson<R>(handler: (value: [K, T | null]) => R): R[];
    /** 清空触发点击事件时保存的按钮 */
    onChange(handler: Handler<TheTypesInListOfEvents<K, T>[Events.Change]>): void;
    onStateChange(handler: Handler<TheTypesInListOfEvents<K, T>[Events.StateChange]>): void;
}
export {};


// From domains/ui/form/list.d.ts
/**
 * @file 一个用于表单中的动态列表组件
 */
import { Handler } from "@/domains/base";
export declare function ListContainerCore<T extends {
    defaultValue: any;
    factory: () => any;
}>(props: T): {
    symbol: "ListContainerCore";
    shape: "list";
    value: ReturnType<T["factory"]>["value"][];
    $value: () => any;
    state: {
        readonly list: {
            index: number;
            $input: ReturnType<T["factory"]>;
        }[];
        readonly value: ReturnType<T["factory"]>["value"][];
        readonly canRemove: boolean;
    };
    readonly list: {
        index: number;
        $input: ReturnType<T["factory"]>;
    }[];
    append(): {
        index: number;
        $input: ReturnType<T["factory"]>;
    };
    removeFieldByIndex(index: number): void;
    setValue(v: ReturnType<T["factory"]>["value"][]): void;
    onChange(handler: Handler<ReturnType<T["factory"]>["value"][]>): () => void;
    onStateChange(handler: Handler<{
        readonly list: {
            index: number;
            $input: ReturnType<T["factory"]>;
        }[];
        readonly value: ReturnType<T["factory"]>["value"][];
        readonly canRemove: boolean;
    }>): () => void;
};
export type ListContainerCore<T extends {
    defaultValue: any;
    factory: () => any;
}> = ReturnType<typeof ListContainerCore<T>>;


// From domains/ui/form/tag-input/index.d.ts
import { Handler } from "@/domains/base";
type TagInputCoreProps = {
    defaultValue?: string[];
};
type TagInputCoreState = {
    value: string[];
    inputValue: string;
};
declare enum Events {
    Change = 0,
    StateChange = 1
}
type TheTagInputEvents = {
    [Events.Change]: TagInputCoreState["value"];
    [Events.StateChange]: TagInputCoreState;
};
export declare class TagInputCore {
    shape: "tag-input";
    inputValue: string;
    value: string[];
    defaultValue: string[];
    _bus: {
        off<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheTagInputEvents>(event: Key, handler: Handler<({
            __destroy: void;
        } & TheTagInputEvents)[Key]>): void;
        on<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheTagInputEvents>(event: Key, handler: Handler<({
            __destroy: void;
        } & TheTagInputEvents)[Key]>): () => void;
        uid: () => number;
        emit<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheTagInputEvents>(event: Key, value?: ({
            __destroy: void;
        } & TheTagInputEvents)[Key] | undefined): void;
        destroy(): void;
    };
    constructor(props: TagInputCoreProps);
    get state(): TagInputCoreState;
    setValue(value: string[]): void;
    input(value: string): void;
    addTag(tag?: string): void;
    removeTag(v: string): void;
    clear(): void;
    onChange(handler: Handler<TheTagInputEvents[Events.Change]>): () => void;
    onStateChange(handler: Handler<TheTagInputEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/form/types.d.ts
export type ValueInputInterface<T> = {
    shape: "select" | "input" | "drag-upload" | "image-upload" | "upload" | "date-picker" | "list" | "form";
    value: T;
    setValue: (v: T, extra?: Partial<{
        silence: boolean;
    }>) => void;
    onChange: (fn: (v: T) => void) => void;
};


// From domains/ui/form/value.d.ts
import { BaseDomain } from "@/domains/base";
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents = {
    [Events.StateChange]: FormSourceState;
};
type FormSourceState = {};
export declare class FormSourceCore extends BaseDomain<TheTypesOfEvents> {
}
export {};


// From domains/ui/formv2/field.d.ts
import { Handler } from "@/domains/base";
import { Result } from "@/domains/result";
import { BizError } from "@/domains/error";
import { FormInputInterface } from "./types";
type CommonRuleCore = {
    required: boolean;
};
type NumberRuleCore = {
    min: number;
    max: number;
};
type StringRuleCore = {
    minLength: number;
    maxLength: number;
    mode: "email" | "number";
};
type FieldRuleCore = Partial<CommonRuleCore & NumberRuleCore & StringRuleCore & {
    custom(v: any): Result<null>;
}>;
type FormFieldCoreProps = {
    label?: string;
    /** @deprecated */
    name?: string;
    rules?: FieldRuleCore[];
};
export declare function FormFieldCore<T>(props: FormFieldCoreProps): {
    label: string | undefined;
    setValue(): void;
    validate(): void;
};
type FieldStatus = "normal" | "focus" | "warning" | "error" | "success";
export type FormValidateResult = {
    valid: boolean;
    value: any;
    errors: BizError[];
};
declare enum SingleFieldEvents {
    Change = 0,
    StateChange = 1
}
type TheSingleFieldCoreEvents<T extends FormInputInterface<any>["value"]> = {
    [SingleFieldEvents.Change]: T;
    [SingleFieldEvents.StateChange]: SingleFieldCoreState<T>;
};
type SingleFieldCoreProps<T> = FormFieldCoreProps & {
    input: T;
    hidden?: boolean;
};
type SingleFieldCoreState<T> = {
    symbol: string;
    label: string;
    hidden: boolean;
    focus: boolean;
    error: BizError | null;
    status: FieldStatus;
    input: {
        shape: string;
        value: T;
        type: any;
        options?: any[];
    };
};
export declare class SingleFieldCore<T extends FormInputInterface<any>> {
    symbol: "SingleFieldCore";
    _label: string;
    _hidden: boolean;
    _error: BizError | null;
    _status: FieldStatus;
    _focus: boolean;
    _input: T;
    _rules: FieldRuleCore[];
    _dirty: boolean;
    _bus: {
        off<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheSingleFieldCoreEvents<T>>(event: Key, handler: Handler<({
            __destroy: void;
        } & TheSingleFieldCoreEvents<T>)[Key]>): void;
        on<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheSingleFieldCoreEvents<T>>(event: Key, handler: Handler<({
            __destroy: void;
        } & TheSingleFieldCoreEvents<T>)[Key]>): () => void;
        uid: () => number;
        emit<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheSingleFieldCoreEvents<T>>(event: Key, value?: ({
            __destroy: void;
        } & TheSingleFieldCoreEvents<T>)[Key] | undefined): void;
        destroy(): void;
    };
    get state(): SingleFieldCoreState<T>;
    constructor(props: SingleFieldCoreProps<T>);
    get label(): string;
    get hidden(): boolean;
    get dirty(): boolean;
    get input(): T;
    get value(): T["value"];
    hide(): void;
    show(): void;
    showField(key: string): void;
    hideField(key: string): void;
    setFieldValue(key: string, v: any): void;
    clear(): void;
    validate(): Promise<Result<any>>;
    setValue(value: T["value"], extra?: Partial<{
        key: string;
        idx: number;
        silence: boolean;
    }>): void;
    setStatus(status: FieldStatus): void;
    setFocus(v: boolean): void;
    handleValueChange(value: T["value"]): void;
    ready(): void;
    destroy(): void;
    onChange(handler: Handler<TheSingleFieldCoreEvents<T>[SingleFieldEvents.Change]>): () => void;
    onStateChange(handler: Handler<TheSingleFieldCoreEvents<T>[SingleFieldEvents.StateChange]>): () => void;
}
type ArrayFieldCoreProps<T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>> = FormFieldCoreProps & {
    field: T;
    hidden?: boolean;
};
type ArrayFieldValue<T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>> = ReturnType<T>["value"];
type ArrayFieldCoreState = {
    label: string;
    hidden: boolean;
    fields: {
        id: number;
        label: string;
    }[];
};
declare enum ArrayFieldEvents {
    Change = 0,
    StateChange = 1
}
type TheArrayFieldCoreEvents<T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>> = {
    [ArrayFieldEvents.Change]: {
        idx: number;
        id: number;
    };
    [ArrayFieldEvents.StateChange]: ArrayFieldValue<T>;
};
export declare class ArrayFieldCore<T extends (count: number) => SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>> {
    symbol: "ArrayFieldCore";
    _label: string;
    _hidden: boolean;
    fields: {
        id: number;
        idx: number;
        field: ReturnType<T>;
    }[];
    _field: T;
    _bus: {
        off<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheArrayFieldCoreEvents<T>>(event: Key, handler: Handler<({
            __destroy: void;
        } & TheArrayFieldCoreEvents<T>)[Key]>): void;
        on<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheArrayFieldCoreEvents<T>>(event: Key, handler: Handler<({
            __destroy: void;
        } & TheArrayFieldCoreEvents<T>)[Key]>): () => void;
        uid: () => number;
        emit<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheArrayFieldCoreEvents<T>>(event: Key, value?: ({
            __destroy: void;
        } & TheArrayFieldCoreEvents<T>)[Key] | undefined): void;
        destroy(): void;
    };
    get state(): ArrayFieldCoreState;
    constructor(props: ArrayFieldCoreProps<T>);
    mapFieldWithIndex(index: number): {
        id: number;
        idx: number;
        field: ReturnType<T>;
    } | null;
    getFieldWithId(id: number): {
        id: number;
        idx: number;
        field: ReturnType<T>;
    } | null;
    showField(key: string): void;
    hideField(key: string): void;
    setFieldValue(key: string, v: any): void;
    get label(): string;
    get hidden(): boolean;
    get value(): ArrayFieldValue<T>[];
    refresh(): void;
    hide(): void;
    show(): void;
    setValue(values: any[], extra?: Partial<{
        key: string;
        idx: number;
        silence: boolean;
    }>): void;
    clear(): void;
    validate(): Promise<Result<ArrayFieldValue<T>[]>>;
    insertBefore(id: number): ReturnType<T>;
    insertAfter(id: number): ReturnType<T>;
    append(opt?: Partial<{
        silence: boolean;
    }>): ReturnType<T>;
    remove(id: number): void;
    removeByIndex(idx: number): void;
    /** 将指定的元素，向前移动一个位置 */
    upIdx(id: number): void;
    /** 将指定的元素，向后移动一个位置 */
    downIdx(id: number): void;
    ready(): void;
    destroy(): void;
    onChange(handler: Handler<TheArrayFieldCoreEvents<T>[ArrayFieldEvents.Change]>): () => void;
    onStateChange(handler: Handler<TheArrayFieldCoreEvents<T>[ArrayFieldEvents.StateChange]>): () => void;
}
type ObjectValue<O extends Record<string, SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>>> = {
    [K in keyof O]: O[K] extends SingleFieldCore<any> ? O[K]["value"] : O[K] extends ArrayFieldCore<any> ? O[K]["value"] : O[K] extends ObjectFieldCore<any> ? O[K]["value"] : never;
};
type ObjectFieldCoreProps<T> = FormFieldCoreProps & {
    fields: T;
    hidden?: boolean;
};
type ObjectFieldCoreState = {
    label: string;
    hidden: boolean;
    fields: {
        symbol: string;
        label: string;
        name: string;
        hidden: boolean;
    }[];
};
declare enum ObjectFieldEvents {
    Change = 0,
    StateChange = 1
}
type TheObjectFieldCoreEvents<T extends Record<string, SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>>> = {
    [ObjectFieldEvents.Change]: ObjectValue<T>;
    [ObjectFieldEvents.StateChange]: ObjectFieldCoreState;
};
export declare class ObjectFieldCore<T extends Record<string, SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>>> {
    symbol: "ObjectFieldCore";
    _label: string;
    _hidden: boolean;
    _dirty: boolean;
    fields: T;
    rules: FieldRuleCore[];
    _bus: {
        off<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheObjectFieldCoreEvents<T>>(event: Key, handler: Handler<({
            __destroy: void;
        } & TheObjectFieldCoreEvents<T>)[Key]>): void;
        on<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheObjectFieldCoreEvents<T>>(event: Key, handler: Handler<({
            __destroy: void;
        } & TheObjectFieldCoreEvents<T>)[Key]>): () => void;
        uid: () => number;
        emit<Key extends import("@/domains/base").BaseEvents.Destroy | keyof TheObjectFieldCoreEvents<T>>(event: Key, value?: ({
            __destroy: void;
        } & TheObjectFieldCoreEvents<T>)[Key] | undefined): void;
        destroy(): void;
    };
    get state(): ObjectFieldCoreState;
    constructor(props: ObjectFieldCoreProps<T>);
    get label(): string;
    get hidden(): boolean;
    get dirty(): boolean;
    get value(): ObjectValue<T>;
    mapFieldWithName(name: string): SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any> | null;
    setField(name: string, field: SingleFieldCore<any> | ArrayFieldCore<any> | ObjectFieldCore<any>): void;
    showField(name: string): void;
    hideField(name: string): void;
    setFieldValue(key: string, v: any): void;
    hide(): void;
    show(): void;
    setValue(values: Partial<Record<keyof T, any>>, extra?: Partial<{
        key: keyof T;
        idx: number;
        silence: boolean;
    }>): void;
    refresh(): void;
    clear(): void;
    validate(): Promise<Result<ObjectValue<T>>>;
    handleValueChange(path: string, value: any): void;
    toJSON(): {
        [x: string]: any;
    };
    ready(): void;
    destroy(): void;
    onChange(handler: Handler<TheObjectFieldCoreEvents<T>[ObjectFieldEvents.Change]>): () => void;
    onStateChange(handler: Handler<TheObjectFieldCoreEvents<T>[ObjectFieldEvents.StateChange]>): () => void;
}
export {};


// From domains/ui/formv2/index.d.ts
export { ObjectFieldCore, SingleFieldCore, ArrayFieldCore } from "./field";


// From domains/ui/formv2/types.d.ts
export type FormInputInterface<T> = {
    shape: "number" | "string" | "textarea" | "boolean" | "select" | "multiple-select" | "tag-input" | "custom" | "switch" | "checkbox" | "input" | "drag-upload" | "image-upload" | "upload" | "date-picker" | "list" | "form" | "drag-select";
    value: T;
    defaultValue: T;
    setValue: (v: T, extra?: Partial<{
        silence: boolean;
    }>) => void;
    destroy?: () => void;
    onChange: (fn: (v: T) => void) => void;
};


// From domains/ui/image/index.d.ts
import { Handler } from "mitt";
import { BaseDomain } from "@/domains/base";
declare enum Events {
    StateChange = 0,
    StartLoad = 1,
    Loaded = 2,
    Error = 3
}
type TheTypesOfEvents = {
    [Events.StateChange]: ImageState;
    [Events.StartLoad]: void;
    [Events.Loaded]: void;
    [Events.Error]: void;
};
export declare enum ImageStep {
    Pending = 0,
    Loading = 1,
    Loaded = 2,
    Failed = 3
}
type ImageProps = {
    /** 图片宽度 */
    width?: number;
    /** 图片高度 */
    height?: number;
    /** 图片地址 */
    src?: string;
    /** 说明 */
    alt?: string;
    scale?: number;
    /** 模式 */
    fit?: "cover" | "contain";
    unique_id?: unknown;
};
type ImageState = Omit<ImageProps, "scale"> & {
    step: ImageStep;
    scale: number | null;
};
export declare class ImageCore extends BaseDomain<TheTypesOfEvents> {
    static prefix: string;
    static url(url?: string | null): string;
    unique_uid: unknown;
    src: string;
    width: number;
    height: number;
    scale: null | number;
    fit: "cover" | "contain";
    step: ImageStep;
    realSrc?: string;
    get state(): ImageState;
    constructor(props: Partial<{}> & ImageProps);
    setURL(src?: string | null): void;
    setLoaded(): void;
    /** 图片进入可视区域 */
    handleShow(): void;
    /** 图片加载完成 */
    handleLoaded(): void;
    /** 图片加载失败 */
    handleError(): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    onStartLoad(handler: Handler<TheTypesOfEvents[Events.StartLoad]>): () => void;
    onLoad(handler: Handler<TheTypesOfEvents[Events.Loaded]>): () => void;
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>): () => void;
}
export declare class ImageInListCore extends BaseDomain<TheTypesOfEvents> {
    /** 列表中一类多个按钮 */
    btns: ImageCore[];
    /** 按钮点击后，该值被设置为触发点击的那个按钮 */
    cur: ImageCore | null;
    scale: number | null;
    constructor(props?: Partial<{
        _name: string;
    } & ImageCore>);
    /** 当按钮处于列表中时，使用该方法保存所在列表记录 */
    bind(unique_id?: string): ImageCore;
    select(unique_id: unknown): void;
    /** 清空触发点击事件时保存的按钮 */
    clear(): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): void;
}
export {};


// From domains/ui/index.d.ts
export * from "./button";
export * from "./checkbox";
export * from "./context-menu";
export * from "./dialog";
export * from "./direction";
export * from "./dismissable-layer";
export * from "./dropdown-menu";
export * from "./focus-scope";
export * from "./form";
export * from "./image";
export * from "./form/input";
export * from "./menu";
export * from "./node";
export * from "./popover";
export * from "./presence";
export * from "./progress";
export * from "./roving-focus";
export * from "./scroll-view";
export * from "./select";
export * from "./tabs";
export * from "./toast";
export * from "./tree";
export * from "./menu";
export * from "./menu/item";
export * from "./checkbox/group";
export * from "./calendar";


// From domains/ui/menu/index.d.ts
/**
 * @file 菜单 组件
 */
import { BaseDomain, Handler } from "@/domains/base";
import { PopperCore, Side, Align } from "@/domains/ui/popper";
import { DismissableLayerCore } from "@/domains/ui/dismissable-layer";
import { PresenceCore } from "@/domains/ui/presence";
import { MenuItemCore } from "./item";
declare enum Events {
    Show = 0,
    Hidden = 1,
    EnterItem = 2,
    LeaveItem = 3,
    EnterMenu = 4,
    LeaveMenu = 5,
    StateChange = 6
}
type TheTypesOfEvents = {
    [Events.Show]: void;
    [Events.Hidden]: void;
    [Events.EnterItem]: MenuItemCore;
    [Events.LeaveItem]: MenuItemCore;
    [Events.EnterMenu]: void;
    [Events.LeaveMenu]: void;
    [Events.StateChange]: MenuCoreState;
};
type MenuCoreState = {
    /** 是否是展开状态 */
    open: boolean;
    hover: boolean;
    /** 所有选项 */
    items: MenuItemCore[];
};
type MenuCoreProps = {
    side: Side;
    align: Align;
    strategy: "fixed" | "absolute";
    items: MenuItemCore[];
};
export declare class MenuCore extends BaseDomain<TheTypesOfEvents> {
    _name: string;
    debug: boolean;
    popper: PopperCore;
    presence: PresenceCore;
    layer: DismissableLayerCore;
    open_timer: NodeJS.Timeout | null;
    state: MenuCoreState;
    constructor(options?: Partial<{
        _name: string;
    } & MenuCoreProps>);
    items: MenuItemCore[];
    cur_sub: MenuCore | null;
    cur_item: MenuItemCore | null;
    inside: boolean;
    /** 鼠标是否处于子菜单中 */
    in_sub_menu: boolean;
    /** 鼠标离开 item 时，可能要隐藏子菜单，但是如果从有子菜单的 item 离开前往子菜单，就不用隐藏 */
    maybe_hide_sub: boolean;
    hide_sub_timer: NodeJS.Timeout | null;
    toggle(): void;
    show(): void;
    hide(): void;
    /** 处理选项 */
    listen_item(item: MenuItemCore): void;
    listen_items(items: MenuItemCore[]): void;
    setItems(items: MenuItemCore[]): void;
    checkNeedHideSubMenu(item: MenuItemCore): void;
    reset(): void;
    unmount(): void;
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>): () => void;
    onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>): () => void;
    onEnterItem(handler: Handler<TheTypesOfEvents[Events.EnterItem]>): () => void;
    onLeaveItem(handler: Handler<TheTypesOfEvents[Events.LeaveItem]>): () => void;
    onEnter(handler: Handler<TheTypesOfEvents[Events.EnterMenu]>): () => void;
    onLeave(handler: Handler<TheTypesOfEvents[Events.LeaveMenu]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    get [Symbol.toStringTag](): string;
}
export {};


// From domains/ui/menu/item.d.ts
/**
 * @file 菜单项
 */
import { BaseDomain, Handler } from "@/domains/base";
import { MenuCore } from "./index";
declare enum Events {
    Enter = 0,
    Leave = 1,
    Focus = 2,
    Blur = 3,
    Click = 4,
    Change = 5
}
type TheTypesOfEvents = {
    [Events.Enter]: void;
    [Events.Leave]: void;
    [Events.Focus]: void;
    [Events.Blur]: void;
    [Events.Click]: void;
    [Events.Change]: MenuItemCoreState;
};
type MenuItemCoreProps = {
    /** 菜单文案 */
    label: string;
    /** hover 时的提示 */
    tooltip?: string;
    /** 菜单图标 */
    icon?: unknown;
    /** 菜单快捷键/或者说额外内容? */
    shortcut?: string;
    /** 菜单是否禁用 */
    disabled?: boolean;
    /** 是否隐藏 */
    hidden?: boolean;
    /** 子菜单 */
    menu?: MenuCore;
    /** 点击后的回调 */
    onClick?: () => void;
};
type MenuItemCoreState = MenuItemCoreProps & {
    /** 有子菜单并且子菜单展示了 */
    open: boolean;
    /** 是否聚焦 */
    focused: boolean;
};
export declare class MenuItemCore extends BaseDomain<TheTypesOfEvents> {
    _name: string;
    debug: boolean;
    label: string;
    tooltip?: string;
    icon?: unknown;
    shortcut?: string;
    /** 子菜单 */
    menu: MenuCore | null;
    /** 子菜单是否展示 */
    _open: boolean;
    _hidden: boolean;
    _enter: boolean;
    _focused: boolean;
    _disabled: boolean;
    get state(): MenuItemCoreState;
    get hidden(): boolean;
    constructor(options: Partial<{
        _name: string;
    }> & MenuItemCoreProps);
    setIcon(icon: unknown): void;
    /** 禁用指定菜单项 */
    disable(): void;
    /** 启用指定菜单项 */
    enable(): void;
    /** 鼠标进入菜单项 */
    handlePointerEnter(): void;
    handlePointerMove(): void;
    /** 鼠标离开菜单项 */
    handlePointerLeave(): void;
    handleFocus(): void;
    handleBlur(): void;
    handleClick(): void;
    blur(): void;
    reset(): void;
    hide(): void;
    show(): void;
    unmount(): void;
    onEnter(handler: Handler<TheTypesOfEvents[Events.Enter]>): () => void;
    onLeave(handler: Handler<TheTypesOfEvents[Events.Leave]>): () => void;
    onFocus(handler: Handler<TheTypesOfEvents[Events.Focus]>): () => void;
    onBlur(handler: Handler<TheTypesOfEvents[Events.Blur]>): () => void;
    onClick(handler: Handler<TheTypesOfEvents[Events.Click]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.Change]>): () => void;
    get [Symbol.toStringTag](): string;
}
export {};


// From domains/ui/node/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    Click = 0,
    ContextMenu = 1,
    Mounted = 2,
    EnterViewport = 3
}
type TheTypesOfEvents = {
    [Events.EnterViewport]: void;
    [Events.Mounted]: void;
    [Events.Click]: Events & {
        target: HTMLElement;
    };
};
export declare class NodeCore extends BaseDomain<TheTypesOfEvents> {
    handleShow(): void;
    onVisible(handler: Handler<TheTypesOfEvents[Events.EnterViewport]>): () => void;
    onClick(handler: Handler<TheTypesOfEvents[Events.Click]>): () => void;
}
export {};


// From domains/ui/popover/index.d.ts
/**
 * @file 气泡
 */
import { BaseDomain, Handler } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence";
import { PopperCore, Align, Side } from "@/domains/ui/popper";
import { DismissableLayerCore } from "@/domains/ui/dismissable-layer";
declare enum Events {
    Show = 0,
    Hidden = 1,
    StateChange = 2
}
type TheTypesOfEvents = {
    [Events.Show]: void;
    [Events.Hidden]: void;
    [Events.StateChange]: PopoverState;
};
type PopoverState = {
    isPlaced: boolean;
    closeable: boolean;
    x: number;
    y: number;
    visible: boolean;
    enter: boolean;
    exit: boolean;
};
type PopoverProps = {
    side?: Side;
    align?: Align;
    strategy?: "fixed" | "absolute";
    closeable?: boolean;
};
export declare class PopoverCore extends BaseDomain<TheTypesOfEvents> {
    popper: PopperCore;
    present: PresenceCore;
    layer: DismissableLayerCore;
    _side: Side;
    _align: Align;
    _closeable: boolean;
    visible: boolean;
    enter: boolean;
    exit: boolean;
    get state(): PopoverState;
    constructor(props?: {
        _name?: string;
    } & PopoverProps);
    ready(): void;
    destroy(): void;
    toggle(position?: Partial<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>): void;
    show(position?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        left?: number;
        top?: number;
        right?: number;
        bottom?: number;
    }): void;
    hide(): void;
    unmount(): void;
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>): () => void;
    onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    get [Symbol.toStringTag](): string;
}
export {};


// From domains/ui/popper/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { Rect } from "@/domains/ui/popper/types";
import type { Placement, Coords, Strategy, Middleware, MiddlewareData } from "./types";
declare const SIDE_OPTIONS: readonly ["top", "right", "bottom", "left"];
declare const ALIGN_OPTIONS: readonly ["start", "center", "end"];
export type Side = (typeof SIDE_OPTIONS)[number];
export type Align = (typeof ALIGN_OPTIONS)[number];
declare enum Events {
    /** 参考原始被加载 */
    ReferenceMounted = 0,
    /** 内容元素被加载（可以获取宽高位置） */
    FloatingMounted = 1,
    /** 被放置（其实就是计算好了浮动元素位置） */
    Placed = 2,
    /** 鼠标进入内容区 */
    Enter = 3,
    /** 鼠标离开内容区 */
    Leave = 4,
    StateChange = 5,
    /** 父容器改变 */
    ContainerChange = 6
}
type TheTypesOfEvents = {
    [Events.FloatingMounted]: {
        getRect: () => Rect;
    };
    [Events.ReferenceMounted]: {
        getRect: () => Rect;
    };
    [Events.ContainerChange]: Node;
    [Events.Placed]: PopperState;
    [Events.Enter]: void;
    [Events.Leave]: void;
    [Events.StateChange]: PopperState;
};
type PopperProps = {
    side: Side;
    align: Align;
    strategy: "fixed" | "absolute";
    middleware: Middleware[];
};
type PopperState = {
    strategy: Strategy;
    x: number;
    y: number;
    isPlaced: boolean;
    placedSide: Side;
    placedAlign: Align;
    /** 是否设置了参考DOM */
    reference: boolean;
};
export declare class PopperCore extends BaseDomain<TheTypesOfEvents> {
    unique_id: string;
    debug: boolean;
    placement: Placement;
    strategy: Strategy;
    middleware: Middleware[];
    reference: {
        getRect: () => Rect;
    } | null;
    floating: {
        getRect: () => Rect;
    } | null;
    container: Node | null;
    arrow: {
        width: number;
        height: number;
    } | null;
    state: PopperState;
    _enter: boolean;
    _focus: boolean;
    constructor(options?: Partial<{
        _name: string;
    }> & Partial<PopperProps>);
    /** 基准元素加载完成 */
    setReference(reference: {
        $el?: unknown;
        getRect: () => Rect;
    }, opt?: Partial<{
        force: boolean;
    }>): void;
    /** 更新基准元素（右键菜单时会用到这个方法） */
    updateReference(reference: {
        getRect: () => Rect;
    }): void;
    removeReference(): void;
    /** 内容元素加载完成 */
    setFloating(floating: PopperCore["floating"]): void;
    /** 箭头加载完成 */
    setArrow(arrow: PopperCore["arrow"]): void;
    setContainer(container: Node): void;
    setConfig(config: {
        placement?: Placement;
        strategy?: Strategy;
    }): void;
    setState(v: {
        x: number;
        y: number;
    }): void;
    place2(floating: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    /** 计算浮动元素位置 */
    place(): Promise<void>;
    computePosition(): Promise<{
        x: number;
        y: number;
        placement: Placement;
        strategy: Strategy;
        middlewareData: MiddlewareData;
    }>;
    /** 根据放置位置，计算浮动元素坐标 */
    computeCoordsFromPlacement(elms: {
        reference: Rect;
        floating: Rect;
    }, placement: Placement, rtl?: boolean): Coords;
    handleEnter(): void;
    handleLeave(): void;
    reset(): void;
    onReferenceMounted(handler: Handler<TheTypesOfEvents[Events.ReferenceMounted]>): () => void;
    onFloatingMounted(handler: Handler<TheTypesOfEvents[Events.FloatingMounted]>): () => void;
    onContainerChange(handler: Handler<TheTypesOfEvents[Events.ContainerChange]>): () => void;
    onEnter(handler: Handler<TheTypesOfEvents[Events.Enter]>): () => void;
    onLeave(handler: Handler<TheTypesOfEvents[Events.Leave]>): () => void;
    onPlaced(handler: Handler<TheTypesOfEvents[Events.Placed]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    get [Symbol.toStringTag](): string;
}
/**
 * Provides data to position an inner element of the floating element so that it
 * appears centered to the reference element.
 * @see https://floating-ui.com/docs/arrow
 */
export declare const arrow: (options: {
    element: {
        width: number;
        height: number;
    };
    padding?: number;
}) => Middleware;
export {};


// From domains/ui/popper/types.d.ts
export type Alignment = "start" | "end";
export type Side = "top" | "right" | "bottom" | "left";
export type AlignedPlacement = `${Side}-${Alignment}`;
export type Placement = Side | AlignedPlacement;
export type Strategy = "absolute" | "fixed";
export type Axis = "x" | "y";
export type Length = "width" | "height";
type Promisable<T> = T | Promise<T>;
export type Coords = {
    [key in Axis]: number;
};
export type SideObject = {
    [key in Side]: number;
};
export interface MiddlewareData {
    [key: string]: any;
    arrow?: Partial<Coords> & {
        centerOffset: number;
    };
    autoPlacement?: {
        index?: number;
        overflows: Array<{
            placement: Placement;
            overflows: Array<number>;
        }>;
    };
    flip?: {
        index?: number;
        overflows: Array<{
            placement: Placement;
            overflows: Array<number>;
        }>;
    };
    hide?: {
        referenceHidden?: boolean;
        escaped?: boolean;
        referenceHiddenOffsets?: SideObject;
        escapedOffsets?: SideObject;
    };
    offset?: Coords;
    shift?: Coords;
}
export interface ComputePositionConfig {
    placement?: Placement;
    strategy?: Strategy;
    middleware?: Array<Middleware | null | undefined | false>;
}
export interface ComputePositionReturn extends Coords {
    placement: Placement;
    strategy: Strategy;
    middlewareData: MiddlewareData;
}
export type ComputePosition = (reference: unknown, floating: unknown, config: ComputePositionConfig) => Promise<ComputePositionReturn>;
export interface MiddlewareReturn extends Partial<Coords> {
    data?: {
        [key: string]: any;
    };
    reset?: true | {
        placement?: Placement;
        rects?: true | ElementRects;
    };
}
export type Middleware = {
    name: string;
    options?: any;
    fn: (state: MiddlewareState) => Promisable<MiddlewareReturn>;
};
export type Dimensions = {
    [key in Length]: number;
};
export type Rect = Coords & Dimensions & SideObject;
export interface ElementRects {
    reference: Rect;
    floating: Rect;
}
/**
 * Custom positioning reference element.
 * @see https://floating-ui.com/docs/virtual-elements
 */
export type VirtualElement = {
    getBoundingClientRect(): ClientRectObject;
    contextElement?: any;
};
export type ReferenceElement = any;
export type FloatingElement = any;
export interface Elements {
    reference: ReferenceElement;
    floating: FloatingElement;
}
export interface MiddlewareState extends Coords {
    initialPlacement: Placement;
    placement: Placement;
    strategy: Strategy;
    middlewareData: MiddlewareData;
    elements: Elements;
    rects: ElementRects;
}
/**
 * @deprecated use `MiddlewareState` instead.
 */
export type MiddlewareArguments = MiddlewareState;
export type ClientRectObject = Rect & SideObject;
export type Padding = number | Partial<SideObject>;
export type Boundary = any;
export type RootBoundary = "viewport" | "document" | Rect;
export type ElementContext = "reference" | "floating";
export {};


// From domains/ui/presence/index.d.ts
/**
 * @file 支持动画的 Popup
 */
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0,
    PresentChange = 1,
    Show = 2,
    TmpShow = 3,
    Hidden = 4,
    TmpHidden = 5,
    Unmounted = 6
}
type TheTypesOfEvents = {
    [Events.StateChange]: PresenceState;
    [Events.PresentChange]: boolean;
    [Events.Show]: void;
    [Events.TmpShow]: void;
    [Events.Hidden]: void;
    [Events.TmpHidden]: void;
    [Events.Unmounted]: void;
};
type PresenceState = {
    mounted: boolean;
    enter: boolean;
    visible: boolean;
    exit: boolean;
    text: string;
};
type PresenceProps = {
    mounted?: boolean;
    visible?: boolean;
};
export declare class PresenceCore extends BaseDomain<TheTypesOfEvents> {
    name: string;
    debug: boolean;
    animationName: string;
    mounted: boolean;
    enter: boolean;
    visible: boolean;
    exit: boolean;
    get state(): PresenceState;
    constructor(props?: Partial<{
        _name: string;
    }> & PresenceProps);
    toggle(): void;
    show(): void;
    hide(options?: Partial<{
        reason: "show_sibling" | "back" | "forward";
        destroy: boolean;
    }>): void;
    /** 将 DOM 从页面卸载 */
    unmount(): void;
    reset(): void;
    onTmpShow(handler: Handler<TheTypesOfEvents[Events.TmpShow]>): () => void;
    onTmpHidden(handler: Handler<TheTypesOfEvents[Events.TmpHidden]>): () => void;
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>): () => void;
    onHidden(handler: Handler<TheTypesOfEvents[Events.Hidden]>): () => void;
    onUnmounted(handler: Handler<TheTypesOfEvents[Events.Unmounted]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    onPresentChange(handler: Handler<TheTypesOfEvents[Events.PresentChange]>): () => void;
    get [Symbol.toStringTag](): string;
}
export {};


// From domains/ui/progress/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
type ProgressState = "indeterminate" | "complete" | "loading";
declare enum Events {
    ValueChange = 0,
    StateChange = 1
}
type TheTypesOfEvents = {
    [Events.ValueChange]: number;
    [Events.StateChange]: ProgressCore["state"];
};
export declare class ProgressCore extends BaseDomain<TheTypesOfEvents> {
    _value: number | null;
    _label: string | undefined;
    _max: number;
    constructor(options: {
        value?: number | null | undefined;
        max?: number;
        getValueLabel?: (value: number, max: number) => string;
    });
    get state(): {
        state: ProgressState;
        value: number | undefined;
        max: number;
        label: string | undefined;
    };
    setValue(v: number): void;
    update(v: number): void;
    onValueChange(handler: Handler<TheTypesOfEvents[Events.ValueChange]>): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): void;
}
export {};


// From domains/ui/roving-focus/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { Direction, Orientation } from "@/domains/ui/direction";
import { CollectionCore } from "@/domains/ui/collection";
declare enum Events {
    ItemFocus = 0,
    ItemShiftTab = 1,
    FocusableItemAdd = 2,
    FocusableItemRemove = 3,
    StateChange = 4
}
type TheTypesOfEvents = {
    [Events.ItemFocus]: number;
    [Events.ItemShiftTab]: void;
    [Events.FocusableItemAdd]: void;
    [Events.FocusableItemRemove]: void;
    [Events.StateChange]: RovingFocusState;
};
type RovingFocusState = {
    currentTabStopId: number | null;
    orientation?: Orientation;
    dir?: Direction;
    loop?: boolean;
};
export declare class RovingFocusCore extends BaseDomain<TheTypesOfEvents> {
    collection: CollectionCore;
    state: RovingFocusState;
    constructor(options?: Partial<{
        _name: string;
    }>);
    focusItem(id: number): void;
    shiftTab(): void;
    addFocusableItem(): void;
    removeFocusableItem(): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): void;
    onItemFocus(handler: Handler<TheTypesOfEvents[Events.ItemFocus]>): void;
    onItemShiftTab(handler: Handler<TheTypesOfEvents[Events.ItemShiftTab]>): void;
    onFocusableItemAdd(handler: Handler<TheTypesOfEvents[Events.FocusableItemAdd]>): void;
    onFocusableItemRemove(handler: Handler<TheTypesOfEvents[Events.FocusableItemRemove]>): void;
}
export {};


// From domains/ui/scroll-view/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
export declare function onCreateScrollView(h: (v: ScrollViewCore) => void): void;
type PullToRefreshStep = "pending" | "pulling" | "refreshing" | "releasing";
export type PointEvent = {
    touches?: {
        pageX: number;
        pageY: number;
    }[];
    clientX?: number;
    clientY?: number;
    cancelable?: boolean;
    preventDefault?: () => void;
};
type PullToDownOptions = {
    /** 在列表顶部，松手即可触发下拉刷新回调的移动距离 */
    offset: number;
    /**
     * 是否锁定下拉刷新
     * 默认 false
     */
    isLock: boolean;
    /**
     * 当手指 touchmove 位置在距离 body 底部指定范围内的时候结束上拉刷新，避免 Webview 嵌套导致 touchend 事件不执行
     */
    bottomOffset: number;
    /**
     * 向下滑动最少偏移的角度，取值区间[0,90]
     * 默认45度，即向下滑动的角度大于45度则触发下拉。而小于45度，将不触发下拉，避免与左右滑动的轮播等组件冲突
     */
    minAngle: number;
};
declare enum Events {
    InDownOffset = 0,
    OutDownOffset = 1,
    Pulling = 2,
    PullToRefresh = 3,
    PullToRefreshFinished = 4,
    InUpOffset = 5,
    OutUpOffset = 6,
    Scrolling = 7,
    ReachBottom = 8,
    Mounted = 9
}
type TheTypesOfEvents = {
    [Events.InDownOffset]: void;
    [Events.OutDownOffset]: void;
    [Events.Pulling]: {
        instance: number;
    };
    [Events.PullToRefresh]: void;
    [Events.PullToRefreshFinished]: void;
    [Events.InUpOffset]: void;
    [Events.OutUpOffset]: void;
    [Events.Scrolling]: {
        scrollTop: number;
    };
    [Events.ReachBottom]: void;
    [Events.Mounted]: void;
};
type EnvNeeded = {
    android: boolean;
    pc: boolean;
    ios: boolean;
    wechat: boolean;
};
export type ScrollViewProps = {
    os?: EnvNeeded;
    /** 下拉多少距离后刷新 */
    offset?: number;
    disabled?: boolean;
    onScroll?: (pos: {
        scrollTop: number;
    }) => void;
    onReachBottom?: () => void;
    onPullToRefresh?: () => void;
    onPullToBack?: () => void;
};
type ScrollViewCoreState = {
    top: number;
    left: number;
    /** 当前滚动距离顶部的距离 */
    scrollTop: number;
    scrollable: boolean;
    /** 是否支持下拉刷新 */
    pullToRefresh: boolean;
    /** 下拉刷新的阶段 */
    step: PullToRefreshStep;
};
export declare class ScrollViewCore extends BaseDomain<TheTypesOfEvents> {
    os: EnvNeeded;
    /** 尺寸信息 */
    rect: Partial<{
        /** 宽度 */
        width: number;
        /** 高度 */
        height: number;
        /** 在 y 轴方向滚动的距离 */
        scrollTop: number;
        /** 内容高度 */
        contentHeight: number;
    }>;
    disabled: boolean;
    canPullToRefresh: boolean;
    canReachBottom: boolean;
    /** 隐藏下拉刷新指示器 */
    needHideIndicator: boolean;
    scrollable: boolean;
    /** 下拉刷新相关的状态信息 */
    pullToRefresh: {
        step: PullToRefreshStep;
        /** 开始拖动的起点 y */
        pullStartY: number;
        /** 开始拖动的起点 x */
        pullStartX: number;
        /** 拖动过程中的 y */
        pullMoveY: number;
        /** 拖动过程中的 x */
        pullMoveX: number;
        /** 拖动过程 x 方向上移动的距离 */
        distX: number;
        /** 拖动过程 y 方向上移动的距离 */
        distY: number;
        /** 实际移动的距离？ */
        distResisted: number;
    };
    /** 滚动到底部的阈值 */
    threshold: number;
    options: ScrollViewProps;
    pullToRefreshOptions: PullToDownOptions;
    isPullToRefreshing: boolean;
    isLoadingMore: boolean;
    startPoint: {
        x: number;
        y: number;
    } | null;
    lastPoint: {
        x: number;
        y: number;
    };
    downHight: number;
    upHight: number;
    maxTouchMoveInstanceY: number;
    inTouchEnd: boolean;
    inTopWhenPointDown: boolean;
    inBottomWhenPointDown: boolean;
    isMoveDown: boolean;
    isMoveUp: boolean;
    isScrollTo: boolean;
    /**
     * 为了让 StartPullToRefresh、OutOffset 等事件在拖动过程中仅触发一次的标记
     */
    movetype: PullToRefreshStep;
    preScrollY: number;
    /** 标记上拉已经自动执行过，避免初始化时多次触发上拉回调 */
    isUpAutoLoad: boolean;
    get state(): ScrollViewCoreState;
    constructor(props?: ScrollViewProps);
    setReady(): void;
    setRect(rect: Partial<{
        width: number;
        height: number;
        contentHeight: number;
    }>): void;
    /** 显示下拉进度布局 */
    startPullToRefresh: () => void;
    /** 结束下拉刷新 */
    finishPullToRefresh: () => void;
    disablePullToRefresh: () => void;
    enablePullToRefresh: () => void;
    handleMouseDown: (event: MouseEvent) => void;
    handleMouseMove: (event: MouseEvent) => void;
    handleTouchStart: (event: TouchEvent) => void;
    handleTouchMove: (event: TouchEvent) => void;
    /** 鼠标/手指按下 */
    handlePointDown: (e: PointEvent) => void;
    /** 鼠标/手指移动 */
    handlePointMove: (e: PointEvent) => void;
    handleTouchEnd: () => void;
    handleScrolling: () => void;
    finishLoadingMore(): void;
    setMounted(): void;
    refreshRect(): void;
    setBounce: (isBounce: boolean) => void;
    changeIndicatorHeight(height: number): void;
    setIndicatorHeightTransition(set: boolean): void;
    optimizeScroll(optimize: boolean): void;
    hideIndicator: () => void;
    /**
     * 滑动列表到指定位置
     * 带缓冲效果 (y=0 回到顶部；如果要滚动到底部可以传一个较大的值，比如 99999)
     */
    scrollTo: (position: Partial<{
        left: number;
        top: number;
    }>, duration?: number) => void;
    getToBottom(): number;
    getOffsetTop(dom: unknown): number;
    getScrollHeight(): number;
    /** 获取滚动容器的高度 */
    getScrollClientHeight(): number;
    getScrollTop(): number;
    addScrollTop(difference: number): void;
    setScrollTop(y: number): void;
    getBodyHeight(): number;
    destroy: () => void;
    inDownOffset(handler: Handler<TheTypesOfEvents[Events.InDownOffset]>): () => void;
    outDownOffset(handler: Handler<TheTypesOfEvents[Events.OutDownOffset]>): () => void;
    onPulling(handler: Handler<TheTypesOfEvents[Events.Pulling]>): () => void;
    onScroll(handler: Handler<TheTypesOfEvents[Events.Scrolling]>): () => void;
    onReachBottom(handler: Handler<TheTypesOfEvents[Events.ReachBottom]>): () => void;
    onPullToRefresh(handler: Handler<TheTypesOfEvents[Events.PullToRefresh]>): () => void;
    onMounted(handler: Handler<TheTypesOfEvents[Events.Mounted]>): () => void;
}
export * from "./utils";


// From domains/ui/scroll-view/utils.d.ts
/**
 * 根据点击滑动事件获取第一个手指的坐标
 */
export declare function getPoint(e: {
    touches?: {
        pageX: number;
        pageY: number;
    }[];
    clientX?: number;
    clientY?: number;
}): {
    x: number;
    y: number;
};
/**
 * 阻止浏览器默认事件
 */
export declare function preventDefault(e: {
    cancelable?: boolean;
    defaultPrevented?: boolean;
    preventDefault?: () => void;
}): void;
/**
 * 阻尼效果
 * 代码来自 https://www.jianshu.com/p/3e3aeab63555
 */
export declare function damping(x: number, max: number): number;
export declare function getAngleByPoints(lastPoint: {
    x: number;
    y: number;
}, curPoint: {
    x: number;
    y: number;
}): number;


// From domains/ui/select/content.d.ts
import { BaseDomain } from "@/domains/base";
type TheTypesOfEvents = {};
type SelectContentProps = {
    $node: () => HTMLElement;
    getStyles: () => CSSStyleDeclaration;
    getRect: () => DOMRect;
};
export declare class SelectContentCore extends BaseDomain<TheTypesOfEvents> {
    constructor(options?: Partial<{
        _name: string;
    }> & Partial<SelectContentProps>);
    $node(): HTMLElement | null;
    getRect(): DOMRect;
    getStyles(): CSSStyleDeclaration;
    get clientHeight(): number;
}
export {};


// From domains/ui/select/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { PopperCore } from "@/domains/ui/popper";
import { CollectionCore } from "@/domains/ui/collection";
import { DismissableLayerCore } from "@/domains/ui/dismissable-layer";
import { PopoverCore } from "@/domains/ui/popover";
import { Direction } from "@/domains/ui/direction";
import { PresenceCore } from "@/domains/ui/presence";
import { Rect } from "@/domains/ui/popper/types";
import { SelectContentCore } from "./content";
import { SelectViewportCore } from "./viewport";
import { SelectTriggerCore } from "./trigger";
import { SelectWrapCore } from "./wrap";
import { SelectItemCore } from "./item";
declare enum Events {
    StateChange = 0,
    Change = 1,
    Focus = 2,
    Placed = 3
}
type TheTypesOfEvents<T> = {
    [Events.StateChange]: SelectState<T>;
    [Events.Change]: T | null;
    [Events.Focus]: void;
    [Events.Placed]: void;
};
type SelectProps<T> = {
    defaultValue: T | null;
    placeholder?: string;
    options?: {
        value: T;
        label: string;
    }[];
    onChange?: (v: T | null) => void;
};
type SelectState<T> = {
    options: {
        value: T;
        label: string;
        selected: boolean;
    }[];
    value: T | null;
    value2: {
        value: T;
        label: string;
    } | null;
    /** 菜单是否展开 */
    open: boolean;
    /** 提示 */
    placeholder: string;
    /** 禁用 */
    disabled: boolean;
    /** 是否必填 */
    required: boolean;
    dir: Direction;
    styles: Partial<CSSStyleDeclaration>;
    enter: boolean;
    visible: boolean;
    exit: boolean;
};
export declare class SelectCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
    shape: "select";
    name: string;
    debug: boolean;
    placeholder: string;
    options: {
        value: T;
        label: string;
        selected: boolean;
    }[];
    defaultValue: T | null;
    value: T | null;
    disabled: boolean;
    open: boolean;
    popper: PopperCore;
    popover: PopoverCore;
    presence: PresenceCore;
    collection: CollectionCore;
    layer: DismissableLayerCore;
    position: "popper" | "item-aligned";
    /** 参考点位置 */
    triggerPos: {
        x: number;
        y: number;
    };
    reference: Rect | null;
    /** 触发按钮 */
    trigger: SelectTriggerCore | null;
    wrap: SelectWrapCore | null;
    /** 下拉列表 */
    content: SelectContentCore | null;
    /** 下拉列表容器 */
    viewport: SelectViewportCore | null;
    /** 选中的 item */
    selectedItem: SelectItemCore<T> | null;
    _findFirstValidItem: boolean;
    get state(): SelectState<T>;
    constructor(props: Partial<{
        _name: string;
    }> & SelectProps<T>);
    mapViewModelWithIndex(index: number): {
        value: T;
        label: string;
        selected: boolean;
    };
    setTriggerPointerDownPos(pos: {
        x: number;
        y: number;
    }): void;
    setTrigger(trigger: SelectTriggerCore): void;
    setWrap(wrap: SelectWrapCore): void;
    setContent(content: SelectContentCore): void;
    setViewport(viewport: SelectViewportCore): void;
    setSelectedItem(item: SelectItemCore<T>): void;
    show(): Promise<void>;
    hide(): void;
    addNativeOption(): void;
    removeNativeOption(): void;
    /** 选择 item */
    select(value: T): void;
    focus(): void;
    setOptions(options: NonNullable<SelectProps<T>["options"]>): void;
    setValue(v: T | null): void;
    clear(): void;
    setPosition(): void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
    onValueChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>): () => void;
    onChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>): () => void;
    onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>): () => void;
}
type SelectInListProps<T = unknown> = {
    onChange: (record: T) => void;
} & SelectProps<T>;
type TheTypesInListOfEvents<K extends string, T> = {
    [Events.Change]: [K, T | null];
    [Events.StateChange]: SelectProps<T>;
};
export declare class SelectInListCore<K extends string, T> extends BaseDomain<TheTypesInListOfEvents<K, T>> {
    options: SelectProps<T>["options"];
    list: SelectCore<T>[];
    cached: Map<K, SelectCore<T>>;
    values: Map<K, T | null>;
    constructor(props?: Partial<{
        _name: string;
    } & SelectInListProps<T>>);
    bind(unique_id: K, extra?: {
        defaultValue: T | null;
    }): SelectCore<T>;
    setOptions(options: NonNullable<SelectProps<T>["options"]>): void;
    setValue(v: T | null): void;
    getValue(key: K): NonNullable<T> | null;
    clear(): void;
    toJson<R>(handler: (value: [K, T | null]) => R): R[];
    /** 清空触发点击事件时保存的按钮 */
    onChange(handler: Handler<TheTypesInListOfEvents<K, T>[Events.Change]>): void;
    onStateChange(handler: Handler<TheTypesInListOfEvents<K, T>[Events.StateChange]>): void;
}
export { clamp } from "./utils";


// From domains/ui/select/item.d.ts
/**
 * @file Select 选项
 */
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0,
    Select = 1,
    Leave = 2,
    Enter = 3,
    Move = 4,
    Focus = 5,
    Blur = 6
}
type TheTypesOfEvents<T> = {
    [Events.StateChange]: SelectItemState<T>;
    [Events.Select]: void;
    [Events.Leave]: void;
    [Events.Enter]: void;
    [Events.Focus]: void;
    [Events.Blur]: void;
};
type SelectItemState<T> = {
    /** 标志唯一值 */
    value: T | null;
    selected: boolean;
    focused: boolean;
    disabled: boolean;
};
type SelectItemProps<T> = {
    name?: string;
    label: string;
    value: T;
    selected?: boolean;
    focused?: boolean;
    disabled?: boolean;
    $node?: () => HTMLElement;
    getRect?: () => DOMRect;
    getStyles?: () => CSSStyleDeclaration;
};
export declare class SelectItemCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
    name: string;
    debug: boolean;
    text: string;
    value: T | null;
    selected: boolean;
    focused: boolean;
    disabled: boolean;
    _leave: boolean;
    _enter: boolean;
    get state(): SelectItemState<T>;
    constructor(options: Partial<{
        _name: string;
    }> & SelectItemProps<T>);
    $node(): HTMLElement | null;
    getRect(): DOMRect;
    getStyles(): CSSStyleDeclaration;
    get offsetHeight(): number;
    get offsetTop(): number;
    setText(text: SelectItemCore<T>["text"]): void;
    select(): void;
    unselect(): void;
    focus(): void;
    blur(): void;
    leave(): void;
    move(pos: {
        x: number;
        y: number;
    }): void;
    enter(): void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
    onLeave(handler: Handler<TheTypesOfEvents<T>[Events.Leave]>): () => void;
    onEnter(handler: Handler<TheTypesOfEvents<T>[Events.Enter]>): () => void;
    onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>): () => void;
    onBlur(handler: Handler<TheTypesOfEvents<T>[Events.Blur]>): () => void;
}
export {};


// From domains/ui/select/option.d.ts
/**
 * @file Select 选项
 */
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    Select = 0,
    UnSelect = 1,
    PointerLeave = 2,
    PointerEnter = 3,
    PointerMove = 4,
    Focus = 5,
    Blur = 6,
    StateChange = 7
}
type TheTypesOfEvents<T> = {
    [Events.Select]: void;
    [Events.UnSelect]: void;
    [Events.PointerLeave]: void;
    [Events.PointerEnter]: void;
    [Events.Focus]: void;
    [Events.Blur]: void;
    [Events.StateChange]: SelectItemState<T>;
};
type SelectItemState<T> = {
    /** 标志唯一值 */
    value: T | null;
    selected: boolean;
    focused: boolean;
    disabled: boolean;
};
type SelectItemProps<T> = {
    name?: string;
    label: string;
    value: T;
    selected?: boolean;
    focused?: boolean;
    disabled?: boolean;
    $node?: () => HTMLElement;
    getRect?: () => DOMRect;
    getStyles?: () => CSSStyleDeclaration;
};
export declare class SelectOptionCore<T> extends BaseDomain<TheTypesOfEvents<T>> {
    name: string;
    debug: boolean;
    text: string;
    value: T;
    _enter: boolean;
    _selected: boolean;
    _focused: boolean;
    _disabled: boolean;
    _leave: boolean;
    get state(): SelectItemState<T>;
    constructor(options: Partial<{
        _name: string;
    }> & SelectItemProps<T>);
    $node(): HTMLElement | null;
    getRect(): DOMRect;
    getStyles(): CSSStyleDeclaration;
    get offsetHeight(): number;
    get offsetTop(): number;
    setText(text: SelectOptionCore<T>["text"]): void;
    select(): void;
    unselect(): void;
    focus(): void;
    blur(): void;
    handlePointerEnter(): void;
    handlePointerMove(pos: {
        x: number;
        y: number;
    }): void;
    handlePointerLeave(): void;
    handleClick(): void;
    handleFocus(): void;
    handleBlur(): void;
    onPointerLeave(handler: Handler<TheTypesOfEvents<T>[Events.PointerLeave]>): () => void;
    onPointerEnter(handler: Handler<TheTypesOfEvents<T>[Events.PointerEnter]>): () => void;
    onUnSelect(handler: Handler<TheTypesOfEvents<T>[Events.UnSelect]>): () => void;
    onSelect(handler: Handler<TheTypesOfEvents<T>[Events.Select]>): () => void;
    onFocus(handler: Handler<TheTypesOfEvents<T>[Events.Focus]>): () => void;
    onBlur(handler: Handler<TheTypesOfEvents<T>[Events.Blur]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/select/trigger.d.ts
import { BaseDomain } from "@/domains/base";
type TheTypesOfEvents = {};
export declare class SelectTriggerCore extends BaseDomain<TheTypesOfEvents> {
    constructor(options?: Partial<{
        name: string;
        $node: () => HTMLElement;
        getStyles: () => CSSStyleDeclaration;
        getRect: () => DOMRect;
    }>);
    $node(): null;
    getRect(): DOMRect;
    getStyles(): CSSStyleDeclaration;
}
export {};


// From domains/ui/select/utils.d.ts
export declare function clamp(value: number, [min, max]: [number, number]): number;


// From domains/ui/select/value.d.ts
import { BaseDomain } from "@/domains/base";
type TheTypesOfEvents = {};
export declare class SelectValueCore extends BaseDomain<TheTypesOfEvents> {
    constructor(options?: Partial<{
        name: string;
        $node: () => HTMLElement;
        getStyles: () => CSSStyleDeclaration;
        getRect: () => DOMRect;
    }>);
    $node(): null;
    getRect(): DOMRect;
    getStyles(): CSSStyleDeclaration;
}
export {};


// From domains/ui/select/viewport.d.ts
import { BaseDomain } from "@/domains/base";
type TheTypesOfEvents = {};
export declare class SelectViewportCore extends BaseDomain<TheTypesOfEvents> {
    constructor(options?: Partial<{
        _name: string;
        $node: () => HTMLElement;
        getStyles: () => CSSStyleDeclaration;
        getRect: () => DOMRect;
    }>);
    $node(): HTMLElement | null;
    getRect(): DOMRect;
    getStyles(): CSSStyleDeclaration;
    get clientHeight(): number;
    get scrollHeight(): number;
    get offsetTop(): number;
    get offsetHeight(): number;
}
export {};


// From domains/ui/select/wrap.d.ts
import { BaseDomain } from "@/domains/base";
type TheTypesOfEvents = {};
export declare class SelectWrapCore extends BaseDomain<TheTypesOfEvents> {
    constructor(options?: Partial<{
        _name: string;
        $node: () => HTMLElement;
        getStyles: () => CSSStyleDeclaration;
        getRect: () => DOMRect;
    }>);
    $node(): HTMLElement | null;
    getRect(): DOMRect;
    getStyles(): CSSStyleDeclaration;
}
export {};


// From domains/ui/simple-select/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents = {
    [Events.StateChange]: SimpleSelectCoreState;
};
type SimpleSelectCoreProps = {
    defaultValue: number;
    options: {
        value: number;
        label: string;
    }[];
};
type SimpleSelectCoreState = {
    value: number;
    options: {
        value: number;
        label: string;
    }[];
};
export declare class SimpleSelectCore extends BaseDomain<TheTypesOfEvents> {
    defaultValue: SimpleSelectCoreProps["defaultValue"];
    options: SimpleSelectCoreProps["options"];
    value: number;
    get state(): SimpleSelectCoreState;
    constructor(props: Partial<{
        _name: string;
    }> & SimpleSelectCoreProps);
    select(v: number): void;
    setValue(v: number): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/switch/index.d.ts
import { Handler } from "@/domains/base";
type SwitchCoreProps = {
    defaultValue: boolean;
    disabled?: boolean;
};
export declare function SwitchCore(props: SwitchCoreProps): {
    shape: "switch";
    state: {
        readonly value: boolean;
        readonly disabled: boolean | undefined;
    };
    setValue(v: boolean): void;
    disable(): void;
    enable(): void;
    handleChange(v: boolean): void;
    onOpen(handler: Handler<void>): () => void;
    onClose(handler: Handler<void>): () => void;
    onChange(handler: Handler<boolean>): () => void;
    onStateChange(handler: Handler<{
        readonly value: boolean;
        readonly disabled: boolean | undefined;
    }>): () => void;
};
export type SwitchCore = ReturnType<typeof SwitchCore>;
export {};


// From domains/ui/tab-header/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0,
    Scroll = 1,
    LinePositionChange = 2,
    Mounted = 3,
    Change = 4
}
type TheTypesOfEvents<T extends {
    key: any;
    options: {
        id: any;
        text: string;
    }[];
}> = {
    [Events.StateChange]: TabHeaderState<T>;
    [Events.Scroll]: {
        left: number;
    };
    [Events.LinePositionChange]: {
        left: number;
    };
    [Events.Mounted]: void;
    [Events.Change]: T["options"][number] & {
        index: number;
    };
};
type TabHeaderState<T extends {
    key: any;
    options: {
        id: any;
        text: string;
    }[];
}> = {
    tabs: T["options"];
    current: number | null;
    left: number | null;
    curId: string | null;
};
type TabHeaderProps<T extends {
    key: any;
    options: {
        id: any;
        text: string;
        hidden?: boolean;
    }[];
}> = {
    key?: T["key"];
    selected?: any;
    options: T["options"];
    targetLeftWhenSelected?: number;
    onChange?: (value: T["options"][number] & {
        index: number;
    }) => void;
    onMounted?: () => void;
};
export declare class TabHeaderCore<T extends {
    key: any;
    options: {
        id: any;
        text: string;
        hidden?: boolean;
        [x: string]: any;
    }[];
}> extends BaseDomain<TheTypesOfEvents<T>> {
    key: T["key"];
    tabs: T["options"];
    count: number;
    mounted: boolean;
    extra: Record<string, {
        rect: () => {
            width: number;
            height: number;
            left: number;
        };
    }>;
    current: number | null;
    left: number | null;
    /** 父容器宽高等信息 */
    container: {
        width: number;
        left: number;
        scrollLeft: number;
    };
    /** 当 checkbox 选中时，希望它距离父容器 left 距离。如小于 1，则视为百分比，如 0.5 即中间位置 */
    targetLeftWhenSelected: null | number;
    get selectedTabId(): any;
    get selectedTab(): {
        [x: string]: any;
        id: any;
        text: string;
        hidden?: boolean;
    } | null;
    get state(): TabHeaderState<T>;
    constructor(props: Partial<{
        _name: string;
    }> & TabHeaderProps<T>);
    setTabs(options: T["options"], extra?: Partial<{
        force: boolean;
    }>): void;
    select(index: number): void;
    pendingAction: null | {
        id: T["options"][number]["id"];
        options: Partial<{
            ignore: boolean;
        }>;
    };
    selectById(id: T["options"][number]["id"], options?: Partial<{
        ignore: boolean;
    }>): void;
    handleChangeById(id: string): void;
    /** 计算下划线的位置 */
    calcLineLeft(index: number): number | null;
    updateTabClient(index: number, info: {
        rect: () => {
            width: number;
            height: number;
            left: number;
        };
    }): void;
    changeLinePosition(left: number): void;
    updateTabClientById(id: string, info: {
        rect: () => {
            width: number;
            height: number;
            left: number;
        };
    }): void;
    updateContainerClient(info: {
        width: number;
        height: number;
        left: number;
    }): void;
    calcScrollLeft(curTab: TabHeaderCore<T>["selectedTab"]): void;
    onScroll(handler: Handler<TheTypesOfEvents<T>[Events.Scroll]>): () => void;
    onLinePositionChange(handler: Handler<TheTypesOfEvents<T>[Events.LinePositionChange]>): () => void;
    onChange(handler: Handler<TheTypesOfEvents<T>[Events.Change]>): () => void;
    onMounted(handler: Handler<TheTypesOfEvents<T>[Events.Mounted]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents<T>[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/tabs/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import { RovingFocusCore } from "@/domains/ui/roving-focus";
import { Direction, Orientation } from "@/domains/ui/direction";
import { PresenceCore } from "@/domains/ui/presence";
declare enum Events {
    StateChange = 0,
    ValueChange = 1
}
type TheTypesOfEvents = {
    [Events.StateChange]: TabsState;
    [Events.ValueChange]: string;
};
type TabsState = {
    curValue: string | null;
    orientation: Orientation;
    dir: Direction;
};
export declare class TabsCore extends BaseDomain<TheTypesOfEvents> {
    roving: RovingFocusCore;
    prevContent: {
        id: number;
        value: string;
        presence: PresenceCore;
    } | null;
    contents: {
        id: number;
        value: string;
        presence: PresenceCore;
    }[];
    state: TabsState;
    constructor(options?: Partial<{
        _name: string;
    }>);
    selectTab(value: string): void;
    appendContent(content: {
        id: number;
        value: string;
        presence: PresenceCore;
    }): void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): void;
    onValueChange(handler: Handler<TheTypesOfEvents[Events.ValueChange]>): void;
}
export {};


// From domains/ui/toast/index.d.ts
/**
 * @file 弹窗核心类
 */
import { BaseDomain, Handler } from "@/domains/base";
import { PresenceCore } from "@/domains/ui/presence";
declare enum Events {
    BeforeShow = 0,
    Show = 1,
    BeforeHidden = 2,
    Hidden = 3,
    OpenChange = 4,
    AnimationStart = 5,
    AnimationEnd = 6,
    StateChange = 7
}
type TheTypesOfEvents = {
    [Events.BeforeShow]: void;
    [Events.Show]: void;
    [Events.BeforeHidden]: void;
    [Events.Hidden]: void;
    [Events.OpenChange]: boolean;
    [Events.AnimationStart]: void;
    [Events.AnimationEnd]: void;
    [Events.StateChange]: ToastState;
};
type ToastProps = {
    delay: number;
};
type ToastState = {
    mask: boolean;
    icon?: unknown;
    texts: string[];
    enter: boolean;
    visible: boolean;
    exit: boolean;
};
export declare class ToastCore extends BaseDomain<TheTypesOfEvents> {
    name: string;
    present: PresenceCore;
    delay: number;
    timer: NodeJS.Timeout | null;
    open: boolean;
    _mask: boolean;
    _icon: unknown;
    _texts: string[];
    get state(): ToastState;
    constructor(options?: Partial<{
        _name: string;
    } & ToastProps>);
    /** 显示弹窗 */
    show(params: {
        mask?: boolean;
        icon?: unknown;
        texts: string[];
    }): Promise<void>;
    clearTimer(): void;
    /** 隐藏弹窗 */
    hide(): void;
    onShow(handler: Handler<TheTypesOfEvents[Events.Show]>): () => void;
    onHide(handler: Handler<TheTypesOfEvents[Events.Hidden]>): () => void;
    onOpenChange(handler: Handler<TheTypesOfEvents[Events.OpenChange]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    get [Symbol.toStringTag](): string;
}
export {};


// From domains/ui/tree/constants.d.ts
export declare enum TARGET_POSITION_TYPE {
    TOP = 1,
    BOTTOM = -1,
    CONTENT = 0
}


// From domains/ui/tree/index.d.ts
import { BaseDomain, Handler } from "@/domains/base";
import * as Utils from "./utils";
export { Utils };
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents = {
    [Events.StateChange]: TreeState;
};
type TreeState = {};
export declare class TreeCore extends BaseDomain<TheTypesOfEvents> {
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}


// From domains/ui/tree/leaf.d.ts
import { BaseDomain, Handler } from "@/domains/base";
declare enum Events {
    StateChange = 0
}
type TheTypesOfEvents = {
    [Events.StateChange]: TreeLeafState;
};
type TreeLeafState = {
    expanded: boolean;
};
export declare class TreeLeafCore extends BaseDomain<TheTypesOfEvents> {
    /** 如果存在子数，该子树是否展开 */
    expanded: boolean;
    get state(): TreeLeafState;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
}
export {};


// From domains/ui/tree/types.d.ts
export type SourceNode = {
    key: string;
    title: string;
    children?: Array<SourceNode>;
};
export type FormattedSourceNode = {
    key: string;
    title: string;
    pos: string;
    children?: Array<FormattedSourceNode>;
    [propsName: string]: unknown;
};


// From domains/ui/tree/utils.d.ts
import { TARGET_POSITION_TYPE } from "./constants";
import { SourceNode } from "./types";
export declare function noop(): void;
/**
 * type NodeLevel = string; // like 0、0-0、0-1、0-0-0
 * interface SourceNode {
 *  key: string;
 *  title: string;
 *  children?: Array<SourceNode>;
 * }
 * interface FormattedSourceNode {
 *  key: string;
 *  title: string;
 *  pos: string;
 *  children?: Array<FormattedSourceNode>;
 *  [propsName: string]: any;
 * }
 */
/**
 * add some key to sourceNode
 * @param {Array<SourceNode>} data
 * @param {string} [level='0'] - level at tree
 * @return {Array<FormattedSourceNode>}
 */
export declare const formatSourceNodes: (sourceNodes: SourceNode[], level?: number, parentPos?: string) => {
    key: string;
    title: string;
    pos: string;
    children?: Array<SourceNode>;
}[];
/**
 * collect node key and its children keys
 * @param {Array<VueComponent>} treeNodes
 * @param {function} callback
 */
export declare function traverseTreeNodes(treeNodes: never[] | undefined, callback: any): void;
/**
 *
 * @param {*} smallArray
 * @param {*} bigArray
 */
export declare function isInclude(smallArray: any, bigArray: any): any;
/**
 * get key and children's key of dragging node
 * @param {VueComponent} treeNode - dragging node
 * @return {Array<>}
 */
export declare function getDraggingNodesKey(treeNode: any): any[];
/**
 * get node position info
 * @param {Element} ele
 */
export declare function getOffset(ele: any): any;
/**
 * type TargetPositionType = -1 | 0 | 1;
 */
/**
 * @param {Event} e
 * @param {VueComponent} treeNode - entered node
 * @return {TargetPostionType}
 * TARGET_POSITION_TYPE.BOTTOM
 * |TARGET_POSITION_TYPE.CONTENT
 * |TARGET_POSITION_TYPE.TOP
 */
export declare function calcDropPosition(e: any, treeNode: any): TARGET_POSITION_TYPE;
interface FindSourceCallback {
    (sourceNode: SourceNode, index: number, arr: Array<SourceNode>): void;
}
/**
 *  interface FindSourceCallback {
 *      (sourceNode: SourceNode, index: number, arr: Array<SourceNode>): void;
 *  }
 */
/**
 * @param {Array<SourceNode>} data
 * @param {string} key
 * @param {FindSourceCallback} callback
 */
export declare const findSourceNodeByKey: (sourceNodes: SourceNode[], key: string, callback: FindSourceCallback) => void;
/**
 * get last sourceNodes and move type
 * @param {Array<SourceNode>} sourceNodes
 * @param {any} draggingNodeKey
 * @param {any} targetNodeKey
 * @param {TargetPostionType} targetPosition
 * @return {SourceNode | undefined} targetNode
 * @return {number | undefined} targetNodeIndex
 * @return {Array<SourceNode> | undefined} targetNodes
 * @return {SourceNode} originSourceNode
 * @return {number} originSourceNodeIndex
 * @return {Array<SourceNode>} originSourceNodes
 */
export declare function computeMoveNeededParams(sourceNodes: SourceNode[], draggingNodeKey: string, targetNodeKey: string, targetPosition: TARGET_POSITION_TYPE): {
    targetSourceNode: null;
    originSourceNode: undefined;
    originSourceNodeIndex: undefined;
    originSourceNodes: undefined;
    targetSourceNodes?: undefined;
    targetSourceNodeIndex?: undefined;
} | {
    targetSourceNodes: null;
    targetSourceNodeIndex: undefined;
    originSourceNode: undefined;
    originSourceNodeIndex: undefined;
    originSourceNodes: undefined;
    targetSourceNode?: undefined;
};
/**
 * param reassign, no return
 * @param {number} targetSourceNodeIndex
 * @param {Array<SourceNode>} targetSourceNodes
 * @param {SourceNode} originSourceNode
 * @param {number} originSourceNodeIndex
 * @param {Array<SourceNode>} originSourceNodes
 */
export declare function insertToTop(targetSourceNodeIndex: number, targetSourceNodes: SourceNode[], originSourceNode: SourceNode, originSourceNodeIndex: number, originSourceNodes: SourceNode[]): {
    targetSourceNodes: SourceNode[];
    originSourceNodes: SourceNode[];
};
/**
 * param reassign, no return
 * @param {number} targetSourceNodeIndex
 * @param {Array<SourceNode>} targetSourceNodes
 * @param {SourceNode} originSourceNode
 * @param {number} originSourceNodeIndex
 * @param {Array<SourceNode>} originSourceNodes
 */
export declare function insertToBottom(targetSourceNodeIndex: number, targetSourceNodes: SourceNode[], originSourceNode: SourceNode, originSourceNodeIndex: number, originSourceNodes: SourceNode[]): {
    targetSourceNodes: SourceNode[];
    originSourceNodes: SourceNode[];
};
export {};


// From domains/ui/tree-select/tree-node-edit.d.ts
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PopoverCore } from "@/domains/ui/popover";
import { InputCore } from "@/domains/ui/form/input";
import { ButtonCore } from "@/domains/ui/button";
export declare function TreeNodeEditModel<T extends {
    id: number | string;
    label: string;
    children?: T[];
}>(props: {
    onEdit?: (v: {
        node: T;
        level: number;
        idx: number;
        uid: string;
        value: string;
    }) => void;
    onDelete?: (v: {
        level: number;
        idx: number;
        uid: string;
        node: T;
    }) => void;
    onCreate?: (v: {
        level: number;
        idx: number;
        uid: string;
        value: string;
    }) => void;
}): {
    methods: {
        refresh(): void;
        setPayload(v: {
            level: number;
            idx: number;
            uid: string;
            node: T;
        }): void;
        handleEdit(event: {
            x: number;
            y: number;
        }): void;
        handlePlus(event: {
            x: number;
            y: number;
        }): void;
        handleDelete(e: {}): void;
        handleChecked(e: {
            checked: boolean;
        }): void;
    };
    ui: {
        $popover: PopoverCore;
        $input: InputCore<string>;
        $btn_cancel: ButtonCore<unknown>;
        $btn_ok: ButtonCore<unknown>;
    };
    state: {};
    ready(): void;
    destroy(): void;
    onCreate(handler: Handler<{
        level: number;
        idx: number;
        uid: string;
        value: string;
    }>): () => void;
    onEdit(handler: Handler<{
        node: T;
        level: number;
        idx: number;
        uid: string;
        value: string;
    }>): () => void;
    onDelete(handler: Handler<{
        node: T;
        level: number;
        idx: number;
        uid: string;
    }>): () => void;
    onStateChange(handler: Handler<{}>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export type TreeNodeEditModel = ReturnType<typeof TreeNodeEditModel>;


// From domains/ui/tree-select/tree-select.d.ts
import { Handler } from "@/domains/base";
import { BizError } from "@/domains/error";
import { PopoverCore } from "@/domains/ui/popover";
import { InputCore } from "@/domains/ui/form/input";
export declare function TreeSelectModel<T extends {
    id: number | string;
    label: string;
    children?: T[];
}>(props: {
    nodes: T[];
    /** 是否支持多选 */
    multiple?: boolean;
    /** 当勾选节点时，如果存在子节点，也一起勾选 */
    checkChildNodesAuto?: boolean;
    /** 只可以选择叶节点 */
    onlyLeafNode?: boolean;
    /** 所属层级 */
    level?: number;
    uid?: string;
    ui?: {
        $popover: PopoverCore;
        $input: InputCore<string>;
    };
    value: T["id"][];
    onChange?: (e: {
        node: T;
        checked: boolean;
    }) => void;
}): {
    Symbol: "TreeSelectModel";
    shape: "input";
    methods: {
        refresh(): void;
        setNodes(nodes?: T[]): void;
        mapNode(idx: number): {
            Symbol: "TreeSelectNodeModel";
            methods: {
                refresh(): void;
                isChecked(): boolean;
                findNodeWithUID(uid: string): /*elided*/ any | null;
                appendChild(v: {
                    node: T;
                }): void;
                removeChildNodeWithUID(uid: string): boolean;
                setNode(v: T): void;
                setLabel(v: string): void;
                handleChange(e: {
                    checked: boolean;
                }): void;
            };
            ui: {
                $children: /*elided*/ any;
            };
            state: {
                readonly uid: string;
                readonly idx: number;
                readonly level: number;
                readonly value: T["id"][];
                readonly node: T;
                readonly children: T[] | undefined;
            };
            ready(): void;
            destroy(): void;
            onStateChange(handler: Handler<{
                readonly uid: string;
                readonly idx: number;
                readonly level: number;
                readonly value: T["id"][];
                readonly node: T;
                readonly children: T[] | undefined;
            }>): () => void;
            onError(handler: Handler<BizError>): () => void;
        };
        appendNode(v: {
            node: T;
        }): void;
        removeNode(v: {
            uid: string;
        }): void;
        findNodeWithUID(uid: string): {
            Symbol: "TreeSelectNodeModel";
            methods: {
                refresh(): void;
                isChecked(): boolean;
                findNodeWithUID(uid: string): /*elided*/ any | null;
                appendChild(v: {
                    node: T;
                }): void;
                removeChildNodeWithUID(uid: string): boolean;
                setNode(v: T): void;
                setLabel(v: string): void;
                handleChange(e: {
                    checked: boolean;
                }): void;
            };
            ui: {
                $children: /*elided*/ any;
            };
            state: {
                readonly uid: string;
                readonly idx: number;
                readonly level: number;
                readonly value: T["id"][];
                readonly node: T;
                readonly children: T[] | undefined;
            };
            ready(): void;
            destroy(): void;
            onStateChange(handler: Handler<{
                readonly uid: string;
                readonly idx: number;
                readonly level: number;
                readonly value: T["id"][];
                readonly node: T;
                readonly children: T[] | undefined;
            }>): () => void;
            onError(handler: Handler<BizError>): () => void;
        } | null;
        findParentWithUID(uid: string): {
            Symbol: "TreeSelectNodeModel";
            methods: {
                refresh(): void;
                isChecked(): boolean;
                findNodeWithUID(uid: string): /*elided*/ any | null;
                appendChild(v: {
                    node: T;
                }): void;
                removeChildNodeWithUID(uid: string): boolean;
                setNode(v: T): void;
                setLabel(v: string): void;
                handleChange(e: {
                    checked: boolean;
                }): void;
            };
            ui: {
                $children: /*elided*/ any;
            };
            state: {
                readonly uid: string;
                readonly idx: number;
                readonly level: number;
                readonly value: T["id"][];
                readonly node: T;
                readonly children: T[] | undefined;
            };
            ready(): void;
            destroy(): void;
            onStateChange(handler: Handler<{
                readonly uid: string;
                readonly idx: number;
                readonly level: number;
                readonly value: T["id"][];
                readonly node: T;
                readonly children: T[] | undefined;
            }>): () => void;
            onError(handler: Handler<BizError>): () => void;
        } | null;
        appendNodeWithUID(uid: string, node: T): boolean;
        setNodeWithUID(uid: string, node: T): boolean;
        removeChildNodeWithUID(uid: string): boolean;
        searchNodeWithUIDThenRemove(uid: string): boolean | null;
        handleChange(e: {
            node: T;
            checked: boolean;
        }): void;
    };
    ui: {};
    state: {
        readonly nodes: T[];
        readonly value: T["id"][];
    };
    readonly defaultValue: T["id"][];
    readonly value: T["id"][];
    setValue(v: number[]): void;
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly nodes: T[];
        readonly value: T["id"][];
    }>): () => void;
    onChange(handler: Handler<T["id"][]>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export type TreeSelectModel<T extends {
    id: number | string;
    label: string;
    children?: T[];
}> = ReturnType<typeof TreeSelectModel<T>>;
export declare function TreeSelectNodeModel<T extends {
    id: number | string;
    label: string;
    children?: T[];
}>(props: {
    node: T;
    uid: string;
    idx: number;
    level: number;
    value: T["id"][];
    onDelete?: (e: {
        node: T;
    }) => void;
    onChange: (e: {
        node: T;
        checked: boolean;
    }) => void;
    onRefresh: () => void;
}): {
    Symbol: "TreeSelectNodeModel";
    methods: {
        refresh(): void;
        isChecked(): boolean;
        findNodeWithUID(uid: string): /*elided*/ any | null;
        appendChild(v: {
            node: T;
        }): void;
        removeChildNodeWithUID(uid: string): boolean;
        setNode(v: T): void;
        setLabel(v: string): void;
        handleChange(e: {
            checked: boolean;
        }): void;
    };
    ui: {
        $children: {
            Symbol: "TreeSelectModel";
            shape: "input";
            methods: {
                refresh(): void;
                setNodes(nodes?: T[] | undefined): void;
                mapNode(idx: number): /*elided*/ any;
                appendNode(v: {
                    node: T;
                }): void;
                removeNode(v: {
                    uid: string;
                }): void;
                findNodeWithUID(uid: string): /*elided*/ any | null;
                findParentWithUID(uid: string): /*elided*/ any | null;
                appendNodeWithUID(uid: string, node: T): boolean;
                setNodeWithUID(uid: string, node: T): boolean;
                removeChildNodeWithUID(uid: string): boolean;
                searchNodeWithUIDThenRemove(uid: string): boolean | null;
                handleChange(e: {
                    node: T;
                    checked: boolean;
                }): void;
            };
            ui: {};
            state: {
                readonly nodes: T[];
                readonly value: T["id"][];
            };
            readonly defaultValue: T["id"][];
            readonly value: T["id"][];
            setValue(v: number[]): void;
            ready(): void;
            destroy(): void;
            onStateChange(handler: Handler<{
                readonly nodes: T[];
                readonly value: T["id"][];
            }>): () => void;
            onChange(handler: Handler<T["id"][]>): () => void;
            onError(handler: Handler<BizError>): () => void;
        };
    };
    state: {
        readonly uid: string;
        readonly idx: number;
        readonly level: number;
        readonly value: T["id"][];
        readonly node: T;
        readonly children: T[] | undefined;
    };
    ready(): void;
    destroy(): void;
    onStateChange(handler: Handler<{
        readonly uid: string;
        readonly idx: number;
        readonly level: number;
        readonly value: T["id"][];
        readonly node: T;
        readonly children: T[] | undefined;
    }>): () => void;
    onError(handler: Handler<BizError>): () => void;
};
export type TreeSelectNodeModel<T extends {
    id: number | string;
    label: string;
    children?: T[];
}> = ReturnType<typeof TreeSelectNodeModel<T>>;


// From domains/ui/video-player/index.d.ts
/**
 * @file 播放器
 */
import { BaseDomain, Handler } from "@/domains/base";
import { ApplicationModel } from "@/domains/app";
import { Result } from "@/domains/result/index";
/** 影片分辨率 */
declare enum MediaResolutionTypes {
    /** 标清 */
    LD = "LD",
    /** 普清 */
    SD = "SD",
    /** 高清 */
    HD = "HD",
    /** 超高清 */
    FHD = "FHD"
}
declare enum Events {
    Connected = 0,
    Mounted = 1,
    /** 改变播放地址（切换剧集、分辨率或视频文件） */
    UrlChange = 2,
    /** 调整进度 */
    CurrentTimeChange = 3,
    BeforeAdjustCurrentTime = 4,
    /** 调整进度条时，预期的进度改变 */
    TargetTimeChange = 5,
    AfterAdjustCurrentTime = 6,
    /** 分辨率改变 */
    ResolutionChange = 7,
    /** 音量改变 */
    VolumeChange = 8,
    /** 播放倍率改变 */
    RateChange = 9,
    /** 宽高改变 */
    SizeChange = 10,
    /** 预加载 */
    Preload = 11,
    Ready = 12,
    Loaded = 13,
    /** 播放源加载完成 */
    SourceLoaded = 14,
    /** 准备播放（这个不要随便用，在调整进度时也会触发） */
    CanPlay = 15,
    /** 开始播放 */
    Play = 16,
    /** 播放进度改变 */
    Progress = 17,
    /** 暂停 */
    Pause = 18,
    BeforeLoadStart = 19,
    /** 快要结束，这时可以提取加载下一集剧集信息 */
    BeforeEnded = 20,
    CanSetCurrentTime = 21,
    /** 播放结束 */
    End = 22,
    Resize = 23,
    /** 退出全屏模式 */
    ExitFullscreen = 24,
    /** 发生错误 */
    Error = 25,
    StateChange = 26
}
type TheTypesOfEvents = {
    [Events.Connected]: void;
    [Events.Mounted]: boolean;
    [Events.UrlChange]: {
        url: string;
        thumbnail?: string;
    };
    [Events.CurrentTimeChange]: {
        currentTime: number;
    };
    [Events.BeforeAdjustCurrentTime]: void;
    [Events.TargetTimeChange]: number;
    [Events.AfterAdjustCurrentTime]: {
        time: number;
    };
    [Events.ResolutionChange]: {
        type: MediaResolutionTypes;
        text: string;
    };
    [Events.VolumeChange]: {
        volume: number;
    };
    [Events.CanSetCurrentTime]: void;
    [Events.RateChange]: {
        rate: number;
    };
    [Events.SizeChange]: {
        width: number;
        height: number;
    };
    [Events.ExitFullscreen]: void;
    [Events.Ready]: void;
    [Events.BeforeLoadStart]: void;
    [Events.SourceLoaded]: Partial<{
        width: number;
        height: number;
        url: string;
        currentTime: number;
    }>;
    [Events.Loaded]: void;
    [Events.CanPlay]: void;
    [Events.Play]: void;
    [Events.Pause]: {
        currentTime: number;
        duration: number;
    };
    [Events.Progress]: {
        currentTime: number;
        duration: number;
        progress: number;
    };
    [Events.Preload]: {
        url: string;
    };
    [Events.BeforeEnded]: void;
    [Events.End]: {
        current_time: number;
        duration: number;
    };
    [Events.Error]: Error;
    [Events.Resize]: {
        width: number;
        height: number;
    };
    [Events.StateChange]: PlayerState;
};
type PlayerState = {
    playing: boolean;
    poster?: string;
    width: number;
    height: number;
    ready: boolean;
    rate: number;
    volume: number;
    currentTime: number;
    prepareFullscreen: boolean;
    subtitle: null | {
        label: string;
        lang: string;
        src: string;
    };
    error?: string;
};
export declare class VideoPlayerCore extends BaseDomain<TheTypesOfEvents> {
    /** 视频信息 */
    metadata: {
        url: string;
        thumbnail?: string;
    } | null;
    static Events: typeof Events;
    $app: ApplicationModel<any>;
    private _timer;
    _canPlay: boolean;
    _ended: boolean;
    _duration: number;
    _currentTime: number;
    _curVolume: number;
    _curRate: number;
    get currentTime(): number;
    url: string;
    playing: boolean;
    paused: boolean;
    poster?: string;
    subtitle: PlayerState["subtitle"];
    _mounted: boolean;
    _connected: boolean;
    /** 默认是不能播放的，只有用户交互后可以播放 */
    _target_current_time: number;
    _subtitleVisible: boolean;
    prepareFullscreen: boolean;
    _progress: number;
    virtualProgress: number;
    errorMsg: string;
    private _passPoint;
    private _size;
    private _abstractNode;
    get state(): PlayerState;
    constructor(props: {
        unique_id?: string;
        app: ApplicationModel<any>;
        volume?: number;
        rate?: number;
    });
    bindAbstractNode(node: VideoPlayerCore["_abstractNode"]): void;
    /** 手动播放过 */
    hasPlayed: boolean;
    /** 开始播放 */
    play(): Promise<void>;
    /** 暂停播放 */
    pause(): Promise<void>;
    /** 改变音量 */
    changeVolume(v: number): void;
    pendingRate: null | number;
    changeRate(v: number): void;
    showAirplay(): void;
    pictureInPicture(): void;
    toggleSubtitle(): void;
    setPoster(url: string | null): void;
    /** 改变当前进度 */
    setCurrentTime(currentTime?: number | null): void;
    speedUp(): void;
    rewind(): void;
    setSize(size: {
        width: number;
        height: number;
    }): void;
    setResolution(values: {
        type: MediaResolutionTypes;
        text: string;
    }): void;
    clearSubtitle(): void;
    showSubtitle(subtitle: {
        src: string;
        label: string;
        lang: string;
    }): void;
    toggleSubtitleVisible(): void;
    requestFullScreen(): void;
    exitFullscreen: () => void;
    loadSource(video: {
        url: string;
    }): void;
    preloadSource(url: string): void;
    canPlayType(type: string): boolean;
    _pending_url: string;
    load(url: string): void;
    startAdjustCurrentTime(): void;
    /** 0.x */
    adjustProgressManually(percent: number): void;
    adjustCurrentTime(targetTime: number): void;
    screenshot(): Promise<Result<string>>;
    node(): unknown;
    updated: boolean;
    handleTimeUpdate({ currentTime, duration, }: {
        currentTime: number;
        duration: number;
    }): void;
    enableFullscreen(): void;
    disableFullscreen(): void;
    setMounted(): void;
    setConnected(): void;
    setInvalid(msg: string): void;
    isFullscreen: boolean;
    /** ------ 平台 video 触发的事件 start -------- */
    handleFullscreenChange(isFullscreen: boolean): void;
    handlePause({ currentTime, duration, }: {
        currentTime: number;
        duration: number;
    }): void;
    handleVolumeChange(cur_volume: number): void;
    handleResize(size: {
        width: number;
        height: number;
    }): void;
    startLoad: boolean;
    handleStartLoad(): void;
    /** 视频播放结束 */
    handleEnded(): void;
    handleLoadedmetadata(values: {
        width: number;
        height: number;
        duration: number;
    }): void;
    handleLoad(): void;
    handleCanPlay(): void;
    handlePlay(): void;
    handlePlaying(): void;
    handleError(msg: string): void;
    onReady(handler: Handler<TheTypesOfEvents[Events.Ready]>): () => void;
    onBeforeStartLoad(handler: Handler<TheTypesOfEvents[Events.BeforeLoadStart]>): () => void;
    onLoaded(handler: Handler<TheTypesOfEvents[Events.Loaded]>): () => void;
    onProgress(handler: Handler<TheTypesOfEvents[Events.Progress]>): () => void;
    onCanPlay(handler: Handler<TheTypesOfEvents[Events.CanPlay]>): () => void;
    onUrlChange(handler: Handler<TheTypesOfEvents[Events.UrlChange]>): () => void;
    onExitFullscreen(handler: Handler<TheTypesOfEvents[Events.ExitFullscreen]>): () => void;
    onPreload(handler: Handler<TheTypesOfEvents[Events.Preload]>): () => void;
    onBeforeEnded(handler: Handler<TheTypesOfEvents[Events.BeforeEnded]>): () => void;
    onSizeChange(handler: Handler<TheTypesOfEvents[Events.SizeChange]>): () => void;
    onVolumeChange(handler: Handler<TheTypesOfEvents[Events.VolumeChange]>): () => void;
    onRateChange(handler: Handler<TheTypesOfEvents[Events.RateChange]>): () => void;
    onPause(handler: Handler<TheTypesOfEvents[Events.Pause]>): () => void;
    onResolutionChange(handler: Handler<TheTypesOfEvents[Events.ResolutionChange]>): () => void;
    onCanSetCurrentTime(handler: Handler<TheTypesOfEvents[Events.CanSetCurrentTime]>): () => void;
    beforeAdjustCurrentTime(handler: Handler<TheTypesOfEvents[Events.BeforeAdjustCurrentTime]>): () => void;
    afterAdjustCurrentTime(handler: Handler<TheTypesOfEvents[Events.AfterAdjustCurrentTime]>): () => void;
    onPlay(handler: Handler<TheTypesOfEvents[Events.Play]>): () => void;
    onSourceLoaded(handler: Handler<TheTypesOfEvents[Events.SourceLoaded]>): () => void;
    onTargetTimeChange(handler: Handler<TheTypesOfEvents[Events.TargetTimeChange]>): () => void;
    onCurrentTimeChange(handler: Handler<TheTypesOfEvents[Events.CurrentTimeChange]>): () => void;
    onEnd(handler: Handler<TheTypesOfEvents[Events.End]>): () => void;
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>): () => void;
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>): () => void;
    onMounted(handler: Handler<TheTypesOfEvents[Events.Mounted]>): () => void;
    onConnected(handler: Handler<TheTypesOfEvents[Events.Connected]>): () => void;
}
export {};


// From domains/ui/waterfall/cell.d.ts
import { Handler } from "@/domains/base";
export declare function WaterfallCellModel<T extends Record<string, unknown>>(props: {
    uid: number;
    height: number;
    payload: T;
}): {
    state: {
        readonly id: string | number;
        readonly uid: number;
        readonly position: {
            x: number;
            y: number;
        };
        readonly top: number;
        readonly size: {
            readonly width: number;
            readonly height: number;
        };
        readonly width: number;
        readonly height: number;
        readonly payload: T;
    };
    methods: {
        refresh(): void;
        /**
         * @param {object} size
         * @param {number} size.width
         * @param {number} size.height
         */
        load(size: {
            width: number;
            height: number;
        }): void;
        getOffsetTop(): number;
        exposure(): void;
        setColumnIdx(idx: number): void;
        setTopWithDifference(difference: number): void;
        setTop(top: number): void;
        setHeight(height: number): void;
        setPosition(position: {
            x: number;
            y: number;
        }): void;
        updateHeight(height: number): void;
    };
    readonly id: string | number;
    readonly uid: number;
    readonly column_idx: number;
    readonly size: {
        readonly width: number;
        readonly height: number;
    };
    readonly height: number;
    /** 监听卡片高度改变 */
    onHeightChange(handler: Handler<[number, number]>): void;
    onTopChange(handler: Handler<[number, number]>): void;
    /** 监听卡片是否加载好（能拿到宽高） */
    onLoad(handler: Handler<{
        width: number;
        height: number;
    }>): void;
    /**
     * 监听卡片是否出现在可视区域（50% 内容出现在页面）
     * 已经触发过，小于 50% 后又大于 50% 不会重复触发
     */
    onExposure(handler: Handler<void>): void;
    /** 监听状态值改变 */
    onStateChange(handler: Handler<{
        readonly id: string | number;
        readonly uid: number;
        readonly position: {
            x: number;
            y: number;
        };
        readonly top: number;
        readonly size: {
            readonly width: number;
            readonly height: number;
        };
        readonly width: number;
        readonly height: number;
        readonly payload: T;
    }>): void;
};
export type WaterfallCellModel<T extends Record<string, unknown>> = ReturnType<typeof WaterfallCellModel<T>>;


// From domains/ui/waterfall/column.d.ts
import { Handler } from "@/domains/base";
import { WaterfallCellModel } from "./cell";
export declare function WaterfallColumnModel<T extends Record<string, unknown>>(props: {
    index?: number;
    size?: number;
    buffer?: number;
    gutter?: number;
}): {
    state: {
        readonly width: number;
        readonly height: number;
        readonly size: number;
        readonly items: {
            idx: number;
            id: string | number;
            uid: number;
            position: {
                x: number;
                y: number;
            };
            top: number;
            size: {
                readonly width: number;
                readonly height: number;
            };
            width: number;
            height: number;
            payload: T;
        }[];
        readonly item_count: number;
        readonly innerTop: number;
    };
    readonly $cells: WaterfallCellModel<T>[];
    readonly range: {
        start: number;
        end: number;
    };
    methods: {
        refresh(): void;
        setHeight(h: number): void;
        addHeight(h: number): void;
        setClientHeight(v: number): void;
        /**
         * 放置一个 item 到列中
         */
        appendItem($item: WaterfallCellModel<T>): void;
        /**
         * 往顶部插入一个 item 到列中
         */
        unshiftItem($item: WaterfallCellModel<T>, opt?: Partial<{
            skipUpdateHeight: boolean;
        }>): void;
        findItemById(id: number): WaterfallCellModel<T> | undefined;
        deleteCell($item: WaterfallCellModel<T>): void;
        clean(): void;
        resetRange(): void;
        calcVisibleRange(scroll_top: number): {
            start: number;
            end: number;
        };
        update(range: {
            start: number;
            end: number;
        }): void;
        handleScrollForce: (values: {
            scrollTop: number;
        }) => void;
        handleScroll: (values: {
            scrollTop: number;
        }) => any;
    };
    onStateChange(handler: Handler<{
        readonly width: number;
        readonly height: number;
        readonly size: number;
        readonly items: {
            idx: number;
            id: string | number;
            uid: number;
            position: {
                x: number;
                y: number;
            };
            top: number;
            size: {
                readonly width: number;
                readonly height: number;
            };
            width: number;
            height: number;
            payload: T;
        }[];
        readonly item_count: number;
        readonly innerTop: number;
    }>): void;
    onHeightChange(handler: Handler<number>): void;
    onCellUpdate(handler: Handler<{
        $item: WaterfallCellModel<T>;
    }>): void;
};
export type WaterfallColumnModel<T extends Record<string, unknown>> = ReturnType<typeof WaterfallColumnModel<T>>;


// From domains/ui/waterfall/waterfall.d.ts
import { Handler } from "@/domains/base";
import { WaterfallColumnModel } from "./column";
import { WaterfallCellModel } from "./cell";
export declare function WaterfallModel<T extends Record<string, unknown>>(props: {
    column?: number;
    size?: number;
    buffer?: number;
    gutter?: number;
}): {
    state: {
        readonly items: {
            readonly id: string | number;
            readonly uid: number;
            readonly position: {
                x: number;
                y: number;
            };
            readonly top: number;
            readonly size: {
                readonly width: number;
                readonly height: number;
            };
            readonly width: number;
            readonly height: number;
            readonly payload: T;
        }[];
        readonly columns: {
            readonly width: number;
            readonly height: number;
            readonly size: number;
            readonly items: {
                idx: number;
                id: string | number;
                uid: number;
                position: {
                    x: number;
                    y: number;
                };
                top: number;
                size: {
                    readonly width: number;
                    readonly height: number;
                };
                width: number;
                height: number;
                payload: T;
            }[];
            readonly item_count: number;
            readonly innerTop: number;
        }[];
        readonly height: number;
    };
    methods: {
        refresh(): void;
        initializeColumns(v: typeof props): void;
        unshiftItems(items: T[], opt?: Partial<{
            skipUpdateHeight: boolean;
        }>): {
            state: {
                readonly id: string | number;
                readonly uid: number;
                readonly position: {
                    x: number;
                    y: number;
                };
                readonly top: number;
                readonly size: {
                    readonly width: number;
                    readonly height: number;
                };
                readonly width: number;
                readonly height: number;
                readonly payload: T;
            };
            methods: {
                refresh(): void;
                load(size: {
                    width: number;
                    height: number;
                }): void;
                getOffsetTop(): number;
                exposure(): void;
                setColumnIdx(idx: number): void;
                setTopWithDifference(difference: number): void;
                setTop(top: number): void;
                setHeight(height: number): void;
                setPosition(position: {
                    x: number;
                    y: number;
                }): void;
                updateHeight(height: number): void;
            };
            readonly id: string | number;
            readonly uid: number;
            readonly column_idx: number;
            readonly size: {
                readonly width: number;
                readonly height: number;
            };
            readonly height: number;
            onHeightChange(handler: Handler<[number, number]>): void;
            onTopChange(handler: Handler<[number, number]>): void;
            onLoad(handler: Handler<{
                width: number;
                height: number;
            }>): void;
            onExposure(handler: Handler<void>): void;
            onStateChange(handler: Handler<{
                readonly id: string | number;
                readonly uid: number;
                readonly position: {
                    x: number;
                    y: number;
                };
                readonly top: number;
                readonly size: {
                    readonly width: number;
                    readonly height: number;
                };
                readonly width: number;
                readonly height: number;
                readonly payload: T;
            }>): void;
        }[];
        /**
         * 追加 items 到视图中
         * @param {unknown[]} 多条记录
         */
        appendItems(items: T[]): {
            state: {
                readonly id: string | number;
                readonly uid: number;
                readonly position: {
                    x: number;
                    y: number;
                };
                readonly top: number;
                readonly size: {
                    readonly width: number;
                    readonly height: number;
                };
                readonly width: number;
                readonly height: number;
                readonly payload: T;
            };
            methods: {
                refresh(): void;
                load(size: {
                    width: number;
                    height: number;
                }): void;
                getOffsetTop(): number;
                exposure(): void;
                setColumnIdx(idx: number): void;
                setTopWithDifference(difference: number): void;
                setTop(top: number): void;
                setHeight(height: number): void;
                setPosition(position: {
                    x: number;
                    y: number;
                }): void;
                updateHeight(height: number): void;
            };
            readonly id: string | number;
            readonly uid: number;
            readonly column_idx: number;
            readonly size: {
                readonly width: number;
                readonly height: number;
            };
            readonly height: number;
            onHeightChange(handler: Handler<[number, number]>): void;
            onTopChange(handler: Handler<[number, number]>): void;
            onLoad(handler: Handler<{
                width: number;
                height: number;
            }>): void;
            onExposure(handler: Handler<void>): void;
            onStateChange(handler: Handler<{
                readonly id: string | number;
                readonly uid: number;
                readonly position: {
                    x: number;
                    y: number;
                };
                readonly top: number;
                readonly size: {
                    readonly width: number;
                    readonly height: number;
                };
                readonly width: number;
                readonly height: number;
                readonly payload: T;
            }>): void;
        }[];
        /**
         * 将指定 item 放置到目前高度最小的 column
         */
        placeItemToColumn(item: WaterfallCellModel<T>): void;
        /** 往前面插入 cell */
        unshiftItemToColumn(item: WaterfallCellModel<T>, opt?: Partial<{
            skipUpdateHeight: boolean;
        }>): void;
        /** 清空所有数据 */
        cleanColumns(): void;
        setClientHeight(v: number): void;
        mapCellWithColumnIdxAndIdx(column_idx: number, cell_idx: number): WaterfallCellModel<T> | null;
        findCellWithPayload(finder: (v: T) => boolean): T | null;
        deleteCell(finder: (v: T) => boolean): void;
        resetRange(): void;
        isFinishScroll(v: number): void;
        handleScroll(values: {
            scrollTop: number;
            clientHeight?: number;
        }, opt?: Partial<{
            force: boolean;
        }>): void;
    };
    readonly $columns: WaterfallColumnModel<T>[];
    readonly $items: WaterfallCellModel<T>[];
    readonly gutter: number;
    onCellUpdate(handler: Handler<{
        $item: WaterfallCellModel<T>;
    }>): void;
    onStateChange(handler: Handler<{
        readonly items: {
            readonly id: string | number;
            readonly uid: number;
            readonly position: {
                x: number;
                y: number;
            };
            readonly top: number;
            readonly size: {
                readonly width: number;
                readonly height: number;
            };
            readonly width: number;
            readonly height: number;
            readonly payload: T;
        }[];
        readonly columns: {
            readonly width: number;
            readonly height: number;
            readonly size: number;
            readonly items: {
                idx: number;
                id: string | number;
                uid: number;
                position: {
                    x: number;
                    y: number;
                };
                top: number;
                size: {
                    readonly width: number;
                    readonly height: number;
                };
                width: number;
                height: number;
                payload: T;
            }[];
            readonly item_count: number;
            readonly innerTop: number;
        }[];
        readonly height: number;
    }>): void;
};
export type WaterfallModel<T extends Record<string, unknown>> = ReturnType<typeof WaterfallModel<T>>;


// From utils/browser.d.ts
import { Result } from "@/domains/result";
export declare function loadImage(data: any): Promise<Result<HTMLImageElement>>;
export declare function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer>;
export declare function readFileAsURL(file: File): Promise<Result<string>>;
export declare function readFileAsArrayBuffer(file: File): Promise<Result<ArrayBuffer>>;


// From utils/index.d.ts
import "dayjs/locale/zh-cn";
import { Result } from "@/domains/result/index";
import { JSONObject } from "@/domains/types/index";
export declare function cn(...inputs: any[]): string;
export declare function toFixed(v: any, n?: number): number;
/** 解析一段 json 字符串 */
export declare function parseJSONStr<T extends any>(json: string): Result<T>;
export declare function uidFactory(): () => number;
/**
 * 返回一个指定长度的随机字符串
 * @param length
 * @returns
 */
export declare function random_key(length: number): string;
export declare function padding_zero(str: number | string): string;
export declare function remove_str(filename: string, index: number | undefined, length: number): string;
/**
 * 阿拉伯数字转中文数字
 * @param num
 * @returns
 */
export declare function num_to_chinese(num: number): string;
export declare function chinese_num_to_num(str: string): number;
export declare function update_arr_item<T>(arr: T[], index: number, v2: T): T[];
export declare function remove_arr_item<T>(arr: T[], index: number): T[];
export declare function has_value(v: any): boolean;
export declare function has_num_value(v: any): boolean;
/**
 * 将对象转成 search 字符串，前面不带 ?
 * @param query
 * @returns
 */
export declare function query_stringify(query?: null | JSONObject): string;
export declare function query_parse(url: string, opt?: {}): Record<string, string>;
export declare function bytes_to_size(bytes: number): string;
export declare const seconds_to_hour_template1: {
    hours(v: {
        value: number;
        text: string;
    }): string;
    minutes(v: {
        value: number;
        text: string;
        hours: string;
    }): string;
    seconds(v: {
        value: number;
        text: string;
    }): string;
};
export declare function seconds_to_hour_minute_seconds(value: number): {
    hours: number;
    minutes: number;
    seconds: number;
};
/**
 * 秒数转时分秒
 * @param value
 * @returns
 */
export declare function seconds_to_hour_with_template(value: number, templates: {
    hours: (v: {
        value: number;
        text: string;
    }) => string;
    minutes: (v: {
        value: number;
        text: string;
        hours: string;
    }) => string;
    seconds: (v: {
        value: number;
        text: string;
    }) => string;
}): string;
export declare function hour_text_to_seconds(text: string): number;
/**
 * 秒数转时分秒
 * @param value
 * @returns
 */
export declare function seconds_to_hour_text(value: number): string;
export declare function seconds_to_minutes(value: number): string;
export declare function relative_time_from_now(time: string): string;
export declare function noop(): void;
export declare function promise_noop(): Promise<void>;
/**
 * 延迟指定时间
 * @param delay 要延迟的时间，单位毫秒
 * @returns
 */
export declare function sleep(delay?: number): Promise<unknown>;
export declare function buildRegexp(value: string): Result<RegExp>;


// From utils/lodash/debounce.d.ts
export declare function debounce<T extends (...args: any[]) => any>(wait: number, func: T): (...args: Parameters<T>) => void;


// From utils/lodash/throttle.d.ts
export declare function throttle<T extends (...args: any[]) => any>(delay: number, func: T): (...args: Parameters<T>) => any;


// From utils/nzh/index.d.ts
/**
 * 中文数字转阿拉伯数字
 *
 * @param {string} cnnumb 中文数字字符串
 * @returns Number
 */
export declare const cn: {
    encodeS(num: number | string, options?: Record<string, unknown>): string;
    encodeB(num: string, options?: Record<string, unknown>): string;
    decodeS(num: string, options?: Record<string, unknown>): number;
};


// From utils/nzh/langs/cn_b.d.ts
export declare const lang_cn_b: {
    ch: string;
    ch_u: string;
    ch_f: string;
    ch_d: string;
    m_t: string;
    m_z: string;
    m_u: string;
};


// From utils/nzh/langs/cn_s.d.ts
export declare const lang_cn_s: {
    ch: string;
    ch_u: string;
    ch_f: string;
    ch_d: string;
};


// From utils/nzh/utils.d.ts
/**
 * 科学计数法转十进制
 *
 * @param {string} num 科学记数法字符串
 * @returns string
 */
export declare function e2ten(num: string): string;
/**
 * 分析数字字符串
 *
 * @param {string} num NumberString
 * @returns object
 */
export declare function getNumbResult(num: number | string): {
    int: string;
    decimal: string;
    minus: boolean;
    num: string;
} | null;
/**
 * 数组归一 (按索引覆盖合并数组,并清空被合并的数组)
 *
 * @param {array} baseArray 基础数组
 * @param {...array} array1
 * @returns array
 */
export declare function centerArray(baseArray: unknown[], array1: unknown[], array2?: unknown[]): unknown[];
/**
 * 检查对像属性 (非原型链)
 *
 * @param {object} obj
 * @param {string} key
 * @returns
 */
export declare function hasAttr(obj: Record<string, unknown>, key: string): boolean;
/**
 * 扩展对像(浅复制)
 *
 * @param {object} obj
 * @param {object} obj1
 * @returns
 */
export declare function extend(...args: unknown[]): any;
/**
 * 获取真实数位
 *
 * @param {number} index 中文单位的索引
 */
export declare function getDigit(index: number): number;
/**
 * 往数组头部插入0
 *
 * @param {array} arr
 * @param {number} n
 */
export declare function unshiftZero(arr: unknown[], n: number): void;
/**
 * 清理多余"零"
 *
 * @param {any} str
 * @param {any} zero "零"字符
 * @param {any} type 清理模式 ^ - 开头, $ - 结尾, nto1 - 多个连续变一个
 * @returns
 */
export declare function clearZero(str: string, zero: string, type?: string): string;


// From utils/primitive.d.ts
export declare function toNumber<T extends number | undefined>(v: any, default_v?: T): T extends undefined ? number | null : number;
export declare function inRange(v: number, [a, b]: [number, number]): boolean;

}
export as namespace Timeless;