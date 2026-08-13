import { Result } from "@timeless/inner-base";
import { HttpClientCore } from "@timeless/inner-kit";

import type { VeloInvoke, VeloRuntime } from "./socket";

export type VeloHttpClientProviderOptions = {
  debug?: boolean;
  runtime?: VeloRuntime;
  invoke?: VeloInvoke;
};

function getRuntime(options: VeloHttpClientProviderOptions) {
  if (options.runtime) {
    return options.runtime;
  }
  return globalThis as unknown as VeloRuntime;
}

function normalizeHeaders(headers?: Record<string, string | number>) {
  if (!headers) {
    return undefined;
  }
  const result: Record<string, unknown[]> = {};
  Object.keys(headers).forEach((key) => {
    result[key] = [headers[key]];
  });
  return result;
}

export function connect(
  store: HttpClientCore,
  options: VeloHttpClientProviderOptions = {},
) {
  store.fetch = async <T>(
    fetchOptions: Parameters<HttpClientCore["fetch"]>[0],
  ): Promise<{ data: T }> => {
    const { url, method, data, headers } = fetchOptions;
    if (typeof url !== "string") {
      throw new Error("url 不是字符串");
    }
    const runtime = getRuntime(options);
    const invoke = options.invoke || runtime.invoke || runtime.goCall;
    if (typeof invoke !== "function") {
      throw new Error("缺少 Velo invoke");
    }
    if (options.debug) {
      console.log("[provider-velo]fetch", url, data);
    }
    const r = await invoke(url, {
      method,
      headers: normalizeHeaders(headers),
      args: data,
    });
    if (!r) {
      throw new Error("Missing the response");
    }
    return Promise.resolve({ data: r as T });
  };

  store.cancel = () => {
    return Result.Ok(null);
  };
}
