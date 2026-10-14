import { Result, BaseDomain, Handler } from "@timeless/inner-base";
import { qs_stringify } from "@timeless/inner-utils";
import { JSONObject } from "@timeless/inner-types";

enum Events {
  StateChange,
}
type TheTypesOfEvents = {
  [Events.StateChange]: void;
};

type HttpClientCoreProps = {
  hostname?: string;
  headers?: Record<string, string>;
  debug?: boolean;
  /** Request deadline in milliseconds; zero disables it. */
  timeout?: number;
};
type HttpClientCoreState = {};

type HttpClientMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** `fetch` 的入参：URL 已由调用方拼好（`get` 会补 hostname + query）。 */
export type HttpClientFetchOptions = {
  url: unknown;
  method: HttpClientMethod;
  id?: string;
  data?: JSONObject | FormData;
  headers?: Record<string, string | number>;
  cache?: RequestCache;
  signal?: AbortSignal;
  keepalive?: boolean;
  timeout?: number;
};

/**
 * `fetch` 的返回信封：原生 `Response` 的关键字段 + 已解析的 JSON 数据。
 * provider 不因非 2xx 抛错，状态判定交给 `send`。
 */
export type HttpClientFetchResult<T> = {
  ok?: boolean;
  status?: number;
  data: T;
  json?: () => Promise<unknown>;
};

type HttpClientSendExtra = Partial<{
  query: Record<string, string | number | undefined>;
  headers: Record<string, string | number>;
  id: string;
  cache: RequestCache;
  signal: AbortSignal;
  keepalive: boolean;
  timeout: number;
}>;

export class HttpClientCore extends BaseDomain<TheTypesOfEvents> {
  hostname: string = "";
  headers: Record<string, string> = {};
  debug = false;
  timeout?: number;

  constructor(props: HttpClientCoreProps = {}) {
    super(props);

    const { hostname = "", headers = {}, debug = false, timeout } = props;

    this.hostname = hostname;
    this.headers = headers;
    this.debug = debug;
    this.timeout = timeout;
  }

  /**
   * 把「方法 + 端点 + body」跑成 `Result<T>`。状态与错误体的判定都收敛在这里：
   *   - provider 返回的信封 `ok === false` → `Result.Err(服务端文案 || HTTP N, status, data)`；
   *   - 传输层抛错（老 provider 的非 2xx、网络错误）→ `Result.Err(message, err.response?.status, ...)`。
   * 老 provider 回 axios 响应时没有 `.ok`（`undefined === false` 不成立），仍走成功分支。
   */
  private async send<T>(
    method: HttpClientMethod,
    endpoint: unknown,
    body?: JSONObject | FormData,
    extra: HttpClientSendExtra = {},
  ): Promise<Result<T>> {
    const h = this.hostname;
    const query = extra.query;
    const url =
      typeof endpoint === "string"
        ? method === "GET"
          ? [h, endpoint, query ? "?" + qs_stringify(query) : ""].join("")
          : [h, endpoint].join("")
        : endpoint;
    try {
      const payload: HttpClientFetchOptions = {
        url,
        method,
        data: body,
        id: extra.id,
        cache: extra.cache,
        signal: extra.signal,
        keepalive: extra.keepalive,
        timeout: extra.timeout,
        headers: {
          ...this.headers,
          ...(extra.headers || {}),
        },
      };
      if (this.debug) {
        console.log("[DOMAIN]http_client - before fetch", payload);
      }
      const resp = await this.fetch<T>(payload);
      if (resp.ok === false) {
        const error = resp.data as Record<string, unknown> | null | undefined;
        const server_error =
          error && typeof error === "object" && "error" in error
            ? String(error.error)
            : "";
        return Result.Err(
          server_error || `HTTP ${resp.status}`,
          resp.status,
          resp.data,
        );
      }
      return Result.Ok(resp.data);
    } catch (err) {
      const error = err as Error & {
        response?: { status?: number; data?: unknown };
      };
      return Result.Err(
        error.message,
        error.response?.status,
        error.response?.data ?? null,
      );
    }
  }
  async get<T>(
    endpoint: unknown,
    query?: Record<string, string | number | undefined>,
    extra: HttpClientSendExtra = {},
  ): Promise<Result<T>> {
    return this.send<T>("GET", endpoint, undefined, { ...extra, query });
  }
  async post<T>(
    endpoint: unknown,
    body?: JSONObject | FormData,
    extra: HttpClientSendExtra = {},
  ): Promise<Result<T>> {
    return this.send<T>("POST", endpoint, body, extra);
  }
  async put<T>(
    endpoint: unknown,
    body?: JSONObject | FormData,
    extra: HttpClientSendExtra = {},
  ): Promise<Result<T>> {
    return this.send<T>("PUT", endpoint, body, extra);
  }
  async patch<T>(
    endpoint: unknown,
    body?: JSONObject | FormData,
    extra: HttpClientSendExtra = {},
  ): Promise<Result<T>> {
    return this.send<T>("PATCH", endpoint, body, extra);
  }
  /** DELETE 的可选 body 放在 options 中，保留原有二参数调用。 */
  async del<T>(
    endpoint: unknown,
    extra: HttpClientSendExtra & { body?: JSONObject | FormData } = {},
  ): Promise<Result<T>> {
    return this.send<T>("DELETE", endpoint, extra.body, extra);
  }
  async fetch<T>(
    options: HttpClientFetchOptions,
  ): Promise<HttpClientFetchResult<T>> {
    void options;
    console.log("请在 connect 中实现 fetch 方法");
    return { data: {} } as HttpClientFetchResult<T>;
  }
  cancel(id: string) {
    const tip = "请在 connect 中实现 cancel 方法";
    console.log(tip);
    return Result.Err(tip);
  }
  setHeaders(headers: Record<string, string>) {
    this.headers = headers;
  }
  appendHeaders(headers: Record<string, string>) {
    this.headers = {
      ...this.headers,
      ...headers,
    };
  }
  setDebug(debug: boolean) {
    this.debug = debug;
  }

  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
}
