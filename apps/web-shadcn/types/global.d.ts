declare var dayjs_locale_zh_cn: any;

declare namespace Dayjs {
  interface Dayjs {
    format(template?: string): string;
    add(value: number, unit: string): Dayjs;
    subtract(value: number, unit: string): Dayjs;
    isValid(): boolean;
  }

  function dayjs(date?: string | number | Date): Dayjs;
  function extend(plugin: any): void;
}

declare const dayjs: typeof Dayjs.dayjs;

declare function invoke(
  url: string,
  options: {
    method: string;
    headers?: Record<string, unknown[]>;
    args?: Record<string, unknown>;
  },
): Promise<any>;

declare interface Window {
  dayjs: typeof dayjs;
}

type RouteConfigureWithRoot =
  typeof import("../src/store/index.js").routes_configure_with_root;

type ConfigureForPageKeys<T> = import("@timeless/inner-kit").ConfigureForPageKeys<T>;
type PageKey = import("@timeless/inner-kit").PageKeysType<
  ConfigureForPageKeys<RouteConfigureWithRoot>
>;
type RouteConfig<T> = import("@timeless/inner-kit").RouteConfig<T>;
type RouteViewCore = import("@timeless/inner-kit").RouteViewCore;
type HistoryCore = import("@timeless/inner-kit").HistoryCore<
  PageKey,
  RouteConfig<PageKey>
>;
type ApplicationModel = import("@timeless/inner-kit").ApplicationModel<any>;
type HttpClient = import("@timeless/inner-kit").HttpClientCore;
type StorageCore = import("@timeless/inner-kit").StorageCore<any>;

type ViewComponentProps = {
  view: RouteViewCore;
  views: Record<PageKey, any>;
  history: HistoryCore;
  app: ApplicationModel;
  client: HttpClient;
  storage: StorageCore;
};
