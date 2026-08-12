import { Result } from "@timeless/inner-base";
import {
  ChannelClientCore,
  type ChannelOpenOptions,
} from "@timeless/inner-kit";

export type VeloInvoke = (
  url: string,
  options: {
    method?: string;
    headers?: Record<string, unknown[]>;
    args?: unknown;
  },
) => Promise<unknown>;

export type VeloRuntime = {
  invoke?: VeloInvoke;
  goCall?: VeloInvoke;
  onGoMessage?: (handler: (payload: unknown) => void) => void | (() => void);
  __goMessageHandlers?: Array<(payload: unknown) => void>;
};

export type VeloChannelProviderOptions = {
  debug?: boolean;
  runtime?: VeloRuntime;
  invoke?: VeloInvoke;
};

function getRuntime(options: VeloChannelProviderOptions) {
  if (options.runtime) {
    return options.runtime;
  }
  return globalThis as unknown as VeloRuntime;
}

function normalizeHeaders(headers: Record<string, string | number>) {
  const result: Record<string, unknown[]> = {};
  Object.keys(headers || {}).forEach((key) => {
    result[key] = [headers[key]];
  });
  return result;
}

function buildEndpoint(options: ChannelOpenOptions) {
  if (typeof options.endpoint !== "string") {
    return Result.Err("ChannelOpenOptions.endpoint 必须是字符串");
  }
  const endpoint = [options.hostname || "", options.endpoint].join("");
  const query = options.query;
  if (!query) {
    return Result.Ok(endpoint);
  }
  const search = new URLSearchParams();
  Object.keys(query).forEach((key) => {
    const value = query[key];
    if (value === null || value === undefined) {
      return;
    }
    search.set(key, String(value));
  });
  const queryString = search.toString();
  if (!queryString) {
    return Result.Ok(endpoint);
  }
  const joiner = endpoint.includes("?") ? "&" : "?";
  return Result.Ok([endpoint, joiner, queryString].join(""));
}

function removeMessageHandler(
  runtime: VeloRuntime,
  handler: (payload: unknown) => void,
) {
  const list = runtime.__goMessageHandlers;
  if (!Array.isArray(list)) {
    return;
  }
  const index = list.indexOf(handler);
  if (index >= 0) {
    list.splice(index, 1);
  }
}

function addMessageHandler(
  runtime: VeloRuntime,
  handler: (payload: unknown) => void,
) {
  if (typeof runtime.onGoMessage === "function") {
    const unlisten = runtime.onGoMessage(handler);
    return Result.Ok(
      typeof unlisten === "function"
        ? unlisten
        : () => removeMessageHandler(runtime, handler),
    );
  }
  if (Array.isArray(runtime.__goMessageHandlers)) {
    runtime.__goMessageHandlers.push(handler);
    return Result.Ok(() => removeMessageHandler(runtime, handler));
  }
  return Result.Err("缺少 Velo onGoMessage");
}

function isBoxError(resp: unknown) {
  if (!resp || typeof resp !== "object") {
    return false;
  }
  const target = resp as { code?: unknown };
  return typeof target.code === "number" && target.code !== 0;
}

export function connect(
  client: ChannelClientCore,
  options: VeloChannelProviderOptions = {},
) {
  client.open = (channelOptions) => {
    if (channelOptions.signal.aborted) {
      return Result.Err("连接已取消");
    }

    const runtime = getRuntime(options);
    const messageHandler = (payload: unknown) => {
      if (options.debug) {
        console.log("[provider-velo]receive", payload);
      }
      channelOptions.onMessage(payload);
    };
    const added = addMessageHandler(runtime, messageHandler);
    if (added.error) {
      return Result.Err(added.error);
    }

    let closed = false;
    const close = () => {
      if (closed) {
        return Result.Ok(null);
      }
      closed = true;
      added.data();
      channelOptions.signal.removeEventListener("abort", close);
      return Result.Ok(null);
    };
    channelOptions.signal.addEventListener("abort", close, { once: true });

    return Result.Ok({
      async send(data: unknown) {
        const endpoint = buildEndpoint(channelOptions);
        if (endpoint.error) {
          return Result.Err(endpoint.error);
        }
        const invoke = options.invoke || runtime.invoke || runtime.goCall;
        if (typeof invoke !== "function") {
          return Result.Err("缺少 Velo invoke");
        }
        try {
          if (options.debug) {
            console.log("[provider-velo]send", endpoint.data, data);
          }
          const resp = await invoke(endpoint.data, {
            method: "POST",
            headers: normalizeHeaders(channelOptions.headers),
            args: data,
          });
          if (isBoxError(resp)) {
            const boxResp = resp as {
              code: number;
              msg?: string;
              data?: unknown;
            };
            return Result.Err(
              boxResp.msg || "Velo bridge 调用失败",
              boxResp.code,
              boxResp.data,
            );
          }
          return Result.Ok(null);
        } catch (err) {
          return Result.Err(err as Error);
        }
      },
      close,
    });
  };

  return client;
}
