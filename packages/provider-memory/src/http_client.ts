import { Result } from "@timeless/base";
import { HttpClientCore } from "@timeless/kit";
import { sleep } from "@timeless/utils";

export type MemoryFetchResponse<T = unknown> = {
  data: T;
  status?: number;
  headers?: Record<string, string | number>;
};

export type MemoryApiMapValue =
  | unknown
  | MemoryFetchResponse
  | ((
      ctx: MemoryHandlerContext,
    ) =>
      | unknown
      | MemoryFetchResponse
      | Promise<unknown | MemoryFetchResponse>);
export type MemoryApiMap = Record<string, MemoryApiMapValue>;

export type MemoryHandlerContext = {
  url: URL;
  pathname: string;
  method: "GET" | "POST";
  headers: Record<string, string | number>;
  body: unknown;
  query: Record<string, string>;
  signal: { aborted: boolean };
};

export type MemoryHandler = (
  ctx: MemoryHandlerContext,
) => unknown | MemoryFetchResponse | Promise<unknown | MemoryFetchResponse>;

export type MemoryConnectOptions = {
  baseURL?: string;
  delay?: number | ((ctx: MemoryHandlerContext) => number);
  debug?: boolean;
};

export function response<T>(
  data: T,
  extra: Omit<MemoryFetchResponse<T>, "data"> = {},
) {
  return { __timeless_memory_response: true as const, data, ...extra };
}

function parseUrl(input: unknown, baseURL: string) {
  if (input instanceof URL) {
    return input;
  }
  if (typeof input === "string") {
    try {
      return new URL(input);
    } catch (err) {
      return new URL(input, baseURL);
    }
  }
  return new URL(String(input || ""), baseURL);
}

function normalizeResponse(v: unknown): MemoryFetchResponse {
  if (!v || typeof v !== "object") {
    return { data: v };
  }
  const anyV = v as any;
  if (anyV.__timeless_memory_response) {
    const { __timeless_memory_response, ...rest } = anyV;
    return rest as MemoryFetchResponse;
  }
  if ("data" in anyV && ("status" in anyV || "headers" in anyV)) {
    return anyV as MemoryFetchResponse;
  }
  return { data: v };
}

function normalizeApiKey(key: string) {
  return String(key || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function connect(
  store: HttpClientCore,
  apis: MemoryApiMap = {},
  options: MemoryConnectOptions = {},
) {
  const baseURL = options.baseURL ?? "http://localhost";
  const debug = !!options.debug;
  const apiTable = Object.fromEntries(
    Object.entries(apis).map(([k, v]) => [normalizeApiKey(k), v]),
  ) as MemoryApiMap;
  let requests: {
    id: string;
    cancel: (reason?: string) => void;
  }[] = [];

  store.fetch = async <T>(
    fetchOptions: Parameters<HttpClientCore["fetch"]>[0],
  ): Promise<{ data: T }> => {
    const { url: rawUrl, method, id, data, headers } = fetchOptions;
    const url = parseUrl(rawUrl, baseURL);
    const pathname = url.pathname;
    const query = Object.fromEntries(url.searchParams.entries());
    let cancelReject: null | ((err: unknown) => void) = null;
    const signal = { aborted: false };
    const cancel = (reason: string = "主动取消") => {
      signal.aborted = true;
      if (cancelReject) {
        cancelReject(new Error(reason));
      }
    };
    if (id) {
      requests.push({ id, cancel });
    }

    const ctx: MemoryHandlerContext = {
      url,
      pathname,
      method,
      headers: headers ?? {},
      body: data,
      query,
      signal,
    };

    const keyWithSearch = normalizeApiKey(`${method} ${pathname}${url.search}`);
    const keyWithoutSearch = normalizeApiKey(`${method} ${pathname}`);
    const handlerOrData =
      apiTable[keyWithSearch] !== undefined
        ? apiTable[keyWithSearch]
        : apiTable[keyWithoutSearch];
    if (handlerOrData === undefined) {
      if (id) requests = requests.filter((r) => r.id !== id);
      throw new Error(`没有匹配的 mock 路由: ${method} ${pathname}`);
    }

    const delay = (() => {
      const d = options.delay;
      if (typeof d === "function") return d(ctx);
      return d ?? 0;
    })();

    const cancelPromise = new Promise<never>((_, reject) => {
      cancelReject = reject;
    });

    const handlerPromise = (async () => {
      if (delay > 0) {
        await sleep(delay);
      }
      if (signal.aborted) {
        throw new Error("主动取消");
      }
      const resp =
        typeof handlerOrData === "function"
          ? await (handlerOrData as MemoryHandler)(ctx)
          : handlerOrData;
      if (signal.aborted) {
        throw new Error("主动取消");
      }
      return normalizeResponse(resp);
    })();

    try {
      const resp = await Promise.race([handlerPromise, cancelPromise]);
      if (debug) {
        console.log("[provider-memory]fetch", method, pathname, {
          query,
          data,
        });
      }
      return resp as any;
    } finally {
      if (id) {
        requests = requests.filter((r) => r.id !== id);
      }
    }
  };

  store.cancel = (id: string) => {
    const matched = requests.find((r) => r.id === id);
    if (!matched) {
      return Result.Err("没有找到对应请求");
    }
    requests = requests.filter((r) => r.id !== id);
    matched.cancel("主动取消");
    return Result.Ok(null);
  };
}
