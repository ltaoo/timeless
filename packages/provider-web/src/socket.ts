import { Result } from "@timeless/timeless";
import {
  SocketClientCore,
  type SocketConnection,
  type SocketOpenOptions,
} from "@timeless/inner-kit";

export type WebSocketProviderOptions = {
  debug?: boolean;
  protocols?:
    | string
    | string[]
    | ((options: SocketOpenOptions) => string | string[] | undefined);
  WebSocket?: typeof WebSocket;
};

function getWebSocketCtor(options: WebSocketProviderOptions) {
  return options.WebSocket || globalThis.WebSocket;
}

function getProtocols(
  socketOptions: SocketOpenOptions,
  options: WebSocketProviderOptions,
) {
  if (typeof options.protocols === "function") {
    return options.protocols(socketOptions);
  }
  return options.protocols;
}

function normalizeUrl(options: SocketOpenOptions) {
  if (typeof options.endpoint !== "string") {
    return Result.Err("SocketOpenOptions.endpoint 必须是字符串");
  }

  const endpoint = options.endpoint;
  const hostname = options.hostname || "";
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

  const query = options.query;
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

export function connect(
  client: SocketClientCore,
  options: WebSocketProviderOptions = {},
) {
  client.open = (socketOptions) => {
    const WebSocketCtor = getWebSocketCtor(options);
    if (typeof WebSocketCtor !== "function") {
      return Result.Err("当前环境缺少 WebSocket");
    }

    const url = normalizeUrl(socketOptions);
    if (url.error) {
      return Result.Err(url.error);
    }

    return new Promise((resolve) => {
      const protocols = getProtocols(socketOptions, options);
      const socket =
        protocols !== undefined
          ? new WebSocketCtor(url.data, protocols)
          : new WebSocketCtor(url.data);

      let settled = false;
      const settle = (
        result: ReturnType<typeof Result.Ok<SocketConnection>>,
      ) => {
        if (settled) {
          return;
        }
        settled = true;
        resolve(result);
      };

      const connection: SocketConnection = {
        send(data) {
          if (socket.readyState !== socket.OPEN) {
            return Result.Err("WebSocket 未连接");
          }
          const payload = encodeMessage(data);
          socket.send(payload);
          if (options.debug) {
            console.log("[provider-web]websocket send", payload);
          }
          return Result.Ok(null);
        },
        close(code?: number, reason?: string) {
          if (
            socket.readyState === socket.CLOSING ||
            socket.readyState === socket.CLOSED
          ) {
            return Result.Ok(null);
          }
          socket.close(code, reason);
          return Result.Ok(null);
        },
      };

      const handleAbort = () => {
        connection.close(1000, "connect canceled");
      };
      socketOptions.signal.addEventListener("abort", handleAbort, {
        once: true,
      });

      socket.onopen = () => {
        if (options.debug) {
          console.log("[provider-web]websocket open", url.data);
        }
        settle(Result.Ok(connection));
      };

      socket.onmessage = (event) => {
        const data = decodeMessage(event.data);
        if (options.debug) {
          console.log("[provider-web]websocket message", data);
        }
        socketOptions.onMessage(data, { event });
      };

      socket.onerror = (event) => {
        const error = new Error("WebSocket error");
        if (!settled) {
          settle(Result.Err(error));
          return;
        }
        socketOptions.onError(error);
        if (options.debug) {
          console.log("[provider-web]websocket error", event);
        }
      };

      socket.onclose = (event) => {
        socketOptions.signal.removeEventListener("abort", handleAbort);
        if (!settled) {
          settle(Result.Err(event.reason || "WebSocket closed before open"));
          return;
        }
        socketOptions.onClose({
          code: event.code,
          reason: event.reason,
          clean: event.wasClean,
          event,
        });
      };
    });
  };
  return client;
}
