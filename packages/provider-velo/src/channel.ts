import { Result } from "@timeless/inner-base";
import { ChannelCore, onChannelCreated } from "@timeless/inner-kit";

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
  onGoMessage?: (handler: (payload: unknown) => void) => void;
  __goMessageHandlers?: Array<(payload: unknown) => void>;
};

export type VeloChannelProviderOptions = {
  autoConnect?: boolean;
  debug?: boolean;
  runtime?: VeloRuntime;
  invoke?: VeloInvoke;
};

type Binding = {
  unlisten: () => void;
};

const bindings = new WeakMap<ChannelCore<any, any>, Binding>();

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

function buildEndpoint(channel: ChannelCore<any, any>) {
  if (typeof channel.endpoint !== "string") {
    return Result.Err("ChannelCore.endpoint 必须是字符串");
  }
  const endpoint = [channel.hostname || "", channel.endpoint].join("");
  const query = channel.query;
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
    runtime.onGoMessage(handler);
    return Result.Ok(() => removeMessageHandler(runtime, handler));
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

function installChannel<TMessage, TSend>(
  channel: ChannelCore<TMessage, TSend>,
  options: VeloChannelProviderOptions,
) {
  channel.openConnection = () => {
    if (bindings.has(channel)) {
      return Result.Ok(null);
    }
    const runtime = getRuntime(options);
    const messageHandler = (payload: unknown) => {
      if (options.debug) {
        console.log("[provider-velo]receive", payload);
      }
      channel.receiveMessage(payload);
    };
    const added = addMessageHandler(runtime, messageHandler);
    if (added.error) {
      return Result.Err(added.error);
    }
    bindings.set(channel, {
      unlisten: added.data,
    });
    return Result.Ok(null);
  };

  channel.postMessage = async (data) => {
    const endpoint = buildEndpoint(channel);
    if (endpoint.error) {
      return Result.Err(endpoint.error);
    }
    const runtime = getRuntime(options);
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
        headers: normalizeHeaders(channel.headers),
        args: data,
      });
      if (isBoxError(resp)) {
        const boxResp = resp as { code: number; msg?: string; data?: unknown };
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
  };

  channel.closeConnection = () => {
    const binding = bindings.get(channel);
    if (binding) {
      binding.unlisten();
      bindings.delete(channel);
    }
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
  options: VeloChannelProviderOptions = {},
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
