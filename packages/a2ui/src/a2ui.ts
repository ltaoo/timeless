import { A2UIRenderer } from "./renderer";
import { A2UIStreamParser, type StreamParserOptions } from "./stream-parser";
import type { A2UIOptions } from "./types";
export const A2UI_PROTOCOL_VERSION = "v0.9.1";
export const A2UI_MIME_TYPE = "application/a2ui+json";
export function renderMessages(
  messages: readonly unknown[],
  options: A2UIOptions = {},
): A2UIRenderer {
  const renderer = new A2UIRenderer(options);
  try {
    renderer.processMessages(messages);
    return renderer;
  } catch (error) {
    renderer.destroy();
    throw error;
  }
}
export interface RenderStreamOptions extends A2UIOptions, StreamParserOptions {
  useFetch?: boolean;
  fetchOptions?: RequestInit;
}
export function renderStream(
  url: string,
  options: RenderStreamOptions = {},
): A2UIRenderer {
  const renderer = new A2UIRenderer(options);
  const parser = new A2UIStreamParser(renderer, options);
  const controller = new AbortController();
  const external = options.fetchOptions?.signal;
  const abort = () => {
    controller.abort();
    parser.abort();
    external?.removeEventListener("abort", abort);
  };
  external?.addEventListener("abort", abort, { once: true });
  if (external?.aborted) abort();
  renderer.setStreamAbort(abort);
  if (controller.signal.aborted) return renderer;
  if (options.useFetch || options.format === "jsonl") {
    const headers = new Headers(options.fetchOptions?.headers);
    if (!headers.has("Accept"))
      headers.set(
        "Accept",
        options.format === "jsonl" ? A2UI_MIME_TYPE : "text/event-stream",
      );
    void fetch(url, {
      ...options.fetchOptions,
      signal: controller.signal,
      headers,
    })
      .then((response) => {
        if (!response.ok || !response.body)
          throw new Error(`A2UI stream failed: HTTP ${response.status}`);
        return parser.connectStream(response.body);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          options.onError?.(
            error instanceof Error ? error : new Error(String(error)),
          );
      })
      .finally(() => external?.removeEventListener("abort", abort));
  } else parser.connectEventSource(url);
  return renderer;
}
