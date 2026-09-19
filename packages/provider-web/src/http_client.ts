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
};

export function connect(
  store: HttpClientCore,
  options: WebHttpClientProviderOptions = {},
) {
  const transport: WebHttpTransport =
    options.transport || ((input, init) => globalThis.fetch(input, init));
  let requests: { id: string; controller: AbortController }[] = [];

  store.fetch = async (options) => {
    const { url, method, id, data, headers, cache, signal, keepalive } =
      options;
    const controller = new AbortController();
    if (id) {
      requests.push({ id, controller });
    }
    if (signal) {
      if (signal.aborted) {
        controller.abort(signal.reason);
      } else {
        signal.addEventListener(
          "abort",
          () => controller.abort(signal.reason),
          { once: true },
        );
      }
    }
    try {
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
      const parsed = await response.json().catch(() => null);
      return {
        ok: response.ok,
        status: response.status,
        data: parsed,
        json: async () => parsed,
      };
    } finally {
      requests = requests.filter((r) => r.id !== id);
    }
  };
  store.cancel = (id: string) => {
    const matched = requests.find((r) => r.id === id);
    if (!matched) {
      return Result.Err("没有找到对应请求");
    }
    requests = requests.filter((r) => r.id !== id);
    matched.controller.abort("主动取消");
    return Result.Ok(null);
  };
}
