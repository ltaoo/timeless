import { Result } from "@timeless/timeless";
import { ChannelCore, onChannelCreated } from "@timeless/inner-kit";

export type WebChannelProviderOptions = {
  autoConnect?: boolean;
  debug?: boolean;
  protocols?:
    | string
    | string[]
    | ((channel: ChannelCore<any, any>) => string | string[] | undefined);
  WebSocket?: typeof WebSocket;
};

type Binding = {
  socket: WebSocket;
};

const bindings = new WeakMap<ChannelCore<any, any>, Binding>();

function getWebSocketCtor(options: WebChannelProviderOptions) {
  return options.WebSocket || globalThis.WebSocket;
}

function getProtocols(
  channel: ChannelCore<any, any>,
  options: WebChannelProviderOptions,
) {
  if (typeof options.protocols === "function") {
    return options.protocols(channel);
  }
  return options.protocols;
}

function normalizeUrl(channel: ChannelCore<any, any>) {
  if (typeof channel.endpoint !== "string") {
    return Result.Err("ChannelCore.endpoint 必须是字符串");
  }

  const endpoint = channel.endpoint;
  const hostname = channel.hostname || "";
  const location = globalThis.location;
  const hasLocation = !!location?.protocol && !!location?.host;
  const websocketProtocol =
    hasLocation && location.protocol === "https:" ? "wss:" : "ws:";

  const raw = (() => {
    if (/^wss?:\/\//i.test(endpoint)) {
      return endpoint;
    }
    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint.replace(/^http/i, "ws");
    }
    if (endpoint.startsWith("//")) {
      return `${websocketProtocol}${endpoint}`;
    }
    if (hostname) {
      return [hostname, endpoint].join("");
    }
    if (endpoint.startsWith("/") && hasLocation) {
      return `${websocketProtocol}//${location.host}${endpoint}`;
    }
    return endpoint;
  })();

  const query = channel.query;
  if (!query) {
    return Result.Ok(raw);
  }

  try {
    const base = hasLocation ? location.href : undefined;
    const url = new URL(raw, base);
    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (value === null || value === undefined) {
        return;
      }
      url.searchParams.set(key, String(value));
    });
    return Result.Ok(url.toString());
  } catch (err) {
    const params = new URLSearchParams();
    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (value === null || value === undefined) {
        return;
      }
      params.set(key, String(value));
    });
    const search = params.toString();
    if (!search) {
      return Result.Ok(raw);
    }
    const joiner = raw.includes("?") ? "&" : "?";
    return Result.Ok([raw, joiner, search].join(""));
  }
}

function encodeMessage(data: unknown) {
  if (typeof data === "string") {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return data;
  }
  if (ArrayBuffer.isView(data)) {
    return data;
  }
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return data;
  }
  return JSON.stringify(data);
}

function decodeMessage(data: unknown) {
  if (typeof data !== "string") {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}

function installChannel<TMessage, TSend>(
  channel: ChannelCore<TMessage, TSend>,
  options: WebChannelProviderOptions,
) {
  channel.openConnection = () => {
    const binding = bindings.get(channel);
    if (binding) {
      if (binding.socket.readyState === binding.socket.OPEN) {
        return Result.Ok(null);
      }
      binding.socket.close();
      bindings.delete(channel);
    }

    const WebSocketCtor = getWebSocketCtor(options);
    if (typeof WebSocketCtor !== "function") {
      return Result.Err("当前环境缺少 WebSocket");
    }

    const url = normalizeUrl(channel);
    if (url.error) {
      return Result.Err(url.error);
    }

    return new Promise((resolve) => {
      const protocols = getProtocols(channel, options);
      const socket =
        protocols !== undefined
          ? new WebSocketCtor(url.data, protocols)
          : new WebSocketCtor(url.data);
      bindings.set(channel, { socket });

      let settled = false;
      const settle = (result: ReturnType<typeof Result.Ok<null>>) => {
        if (settled) {
          return;
        }
        settled = true;
        resolve(result);
      };

      socket.onopen = () => {
        if (options.debug) {
          console.log("[provider-web]websocket open", url.data);
        }
        settle(Result.Ok(null));
      };

      socket.onmessage = (event) => {
        const data = decodeMessage(event.data);
        if (options.debug) {
          console.log("[provider-web]websocket message", data);
        }
        channel.receiveMessage(data, { event });
      };

      socket.onerror = (event) => {
        const error = new Error("WebSocket error");
        if (!settled) {
          bindings.delete(channel);
          settle(Result.Err(error));
          return;
        }
        channel.handleError(error);
        if (options.debug) {
          console.log("[provider-web]websocket error", event);
        }
      };

      socket.onclose = (event) => {
        bindings.delete(channel);
        if (!settled) {
          settle(Result.Err(event.reason || "WebSocket closed before open"));
          return;
        }
        channel.handleClose({
          code: event.code,
          reason: event.reason,
          clean: event.wasClean,
          event,
        });
      };
    });
  };

  channel.postMessage = (data) => {
    const binding = bindings.get(channel);
    if (!binding || binding.socket.readyState !== binding.socket.OPEN) {
      return Result.Err("WebSocket 未连接");
    }
    const payload = encodeMessage(data);
    binding.socket.send(payload);
    if (options.debug) {
      console.log("[provider-web]websocket send", payload);
    }
    return Result.Ok(null);
  };

  channel.closeConnection = (code?: number, reason?: string) => {
    const binding = bindings.get(channel);
    if (!binding) {
      return Result.Ok(null);
    }
    const socket = binding.socket;
    bindings.delete(channel);
    if (
      socket.readyState === socket.CLOSING ||
      socket.readyState === socket.CLOSED
    ) {
      return Result.Ok(null);
    }
    socket.close(code, reason);
    return Result.Ok(null);
  };

  return channel;
}

function scheduleConnect(channel: ChannelCore<any, any>) {
  const run = () => {
    channel.connect();
  };
  if (typeof queueMicrotask === "function") {
    queueMicrotask(run);
    return;
  }
  setTimeout(run, 0);
}

export function connect<TMessage = unknown, TSend = unknown>(
  channel?: ChannelCore<TMessage, TSend>,
  options: WebChannelProviderOptions = {},
) {
  const autoConnect = options.autoConnect !== false;
  if (!channel) {
    onChannelCreated((ins) => {
      installChannel(ins, options);
      if (autoConnect) {
        scheduleConnect(ins);
      }
    });
    return null;
  }
  installChannel(channel, options);
  if (autoConnect) {
    scheduleConnect(channel);
  }
  return channel;
}
