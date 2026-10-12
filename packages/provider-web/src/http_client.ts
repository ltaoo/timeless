import { Result } from "@timeless/timeless";
import { HttpClientCore } from "@timeless/inner-kit";

/** 传输层签名：与原生 `fetch` 一致，方便直接注入 `auth.fetch` 这类包装。 */
export type WebHttpTransport = (
  input: string,
  init: RequestInit,
) => Promise<Response>;

export type WebHttpClientProviderOptions = {
  /**
   * 可注入的 fetch 传输，默认 `globalThis.fetch`。
   * 宿主若需要统一鉴权 / 收口（如 findrss 的 401 跳登录），注入自己的 fetch。
   */
  transport?: WebHttpTransport;
  /** Default deadline; overridden by the client and each request. */
  timeout?: number;
};

export function connect(
  store: HttpClientCore,
  options: WebHttpClientProviderOptions = {},
) {
  const transport: WebHttpTransport =
    options.transport || ((input, init) => globalThis.fetch(input, init));
  const provider_timeout = options.timeout;
  let requests: { id: string; controller: AbortController }[] = [];

  store.fetch = async (options) => {
    const { url, method, id, data, headers, cache, signal, keepalive } =
      options;
    const timeout = options.timeout ?? store.timeout ?? provider_timeout;
    if (timeout !== undefined && (!Number.isFinite(timeout) || timeout < 0))
      throw new RangeError("Request timeout must be non-negative");
    const controller = new AbortController();
    const request = { id: id || "", controller };
    if (id) requests.push(request);
    const abort = () => controller.abort(signal?.reason);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (signal) {
      if (signal.aborted) {
        controller.abort(signal.reason);
      } else {
        signal.addEventListener("abort", abort, { once: true });
      }
    }
    if (timeout)
      timer = setTimeout(
        () =>
          controller.abort(
            new DOMException("Request timed out", "TimeoutError"),
          ),
        timeout,
      );
    try {
      if (controller.signal.aborted) throw controller.signal.reason;
      const init: RequestInit = {
        method,
        cache,
        signal: controller.signal,
        keepalive,
      };
      if (data !== undefined && method !== "GET") {
        if (typeof FormData !== "undefined" && data instanceof FormData) {
          init.body = data;
        } else {
          init.body = JSON.stringify(data);
          init.headers = {
            "Content-Type": "application/json",
            ...(headers as Record<string, string>),
          };
        }
      } else if (headers) {
        init.headers = headers as Record<string, string>;
      }
      const response = await transport(url as string, init);
      const parsed = await response.json().catch((error) => {
        if (controller.signal.aborted) throw controller.signal.reason;
        return null;
      });
      if (controller.signal.aborted) throw controller.signal.reason;
      return {
        ok: response.ok,
        status: response.status,
        data: parsed,
        json: async () => parsed,
      };
    } finally {
      if (timer !== undefined) clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      requests = requests.filter((r) => r !== request);
    }
  };
  store.cancel = (id: string) => {
    const matched = requests.filter((r) => r.id === id);
    if (!matched.length) {
      return Result.Err("没有找到对应请求");
    }
    requests = requests.filter((r) => r.id !== id);
    for (const request of matched)
      request.controller.abort(
        new DOMException("Request cancelled", "AbortError"),
      );
    return Result.Ok(null);
  };
}
