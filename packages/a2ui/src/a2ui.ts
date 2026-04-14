import { UINode, StreamOp, A2UISession } from "./types";
import { setComponents } from "./schema-resolver";
import { A2UIRenderer } from "./renderer";
import { A2UIStreamParser } from "./stream-parser";

declare const __Version: string;
export const A2UIVersion = typeof __Version !== "undefined" ? __Version : "0.0.0";

/**
 * Register styled components for the resolver to use.
 *
 * Example:
 * ```ts
 * import { Input, Button, Select, Field } from "@timeless/shadcn";
 * registerComponents({ Input, Button, Select, Field });
 * ```
 */
export function registerComponents(
  components: Record<string, (...args: any[]) => any>,
) {
  setComponents(components);
}

export interface RenderStreamOptions {
  /** Called on each parsed op */
  onOp?: (op: StreamOp) => void;
  /** Called on error */
  onError?: (error: Error) => void;
  /** Use fetch-based SSE instead of EventSource */
  useFetch?: boolean;
  /** Fetch options (headers, etc.) */
  fetchOptions?: RequestInit;
}

/**
 * Stream-render UI from an SSE endpoint into a target element.
 *
 * The SSE stream should emit events with `data: <StreamOp JSON>`.
 * Each op incrementally builds the UI using refArray + For.
 */
export function renderStream(
  url: string,
  options: RenderStreamOptions = {},
): A2UISession {
  const renderer = new A2UIRenderer();
  const parser = new A2UIStreamParser(renderer, {
    onOp: options.onOp,
    onError: options.onError,
    onDone() {
      // Auto-finalize form on done
      renderer.finalize();
    },
  });

  if (options.useFetch) {
    // Use fetch-based SSE for custom headers / POST requests
    const fetchOpts: RequestInit = {
      ...options.fetchOptions,
      headers: {
        Accept: "text/event-stream",
        ...(options.fetchOptions?.headers ?? {}),
      },
    };
    fetch(url, fetchOpts)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        if (!response.body) {
          throw new Error("Response body is null");
        }
        return parser.connectStream(response.body);
      })
      .catch((err) => {
        options.onError?.(err instanceof Error ? err : new Error(String(err)));
      });
  } else {
    parser.connectEventSource(url);
  }

  return createSession(renderer, parser);
}

/**
 * Render a complete UINode schema tree at once (non-streaming mode).
 *
 * Recursively resolves the entire schema into Timeless elements.
 * Returns the root element and session object.
 */
export function renderSchema(schema: UINode): A2UISession & { element: any } {
  const renderer = new A2UIRenderer();
  const element = renderer.createRoot(schema);
  renderer.finalize();

  const session = createSession(renderer, null);
  return { ...session, element };
}

/**
 * Apply a batch of StreamOps to an existing session.
 */
export function applyOps(session: A2UISession, ops: StreamOp[]) {
  // The session's nodeMap is the renderer's nodeMap
  // We need to access the renderer through the session
  const renderer = (session as any)._renderer as A2UIRenderer | undefined;
  if (renderer) {
    renderer.applyOps(ops);
  }
}

// --- Internal helpers ---

function createSession(
  renderer: A2UIRenderer,
  parser: A2UIStreamParser | null,
): A2UISession {
  const doneCallbacks: Array<() => void> = [];

  renderer.onDone(() => {
    for (const cb of doneCallbacks) {
      cb();
    }
  });

  const session: A2UISession & { _renderer: A2UIRenderer } = {
    _renderer: renderer,
    get form$() {
      return renderer.form$;
    },
    get nodeMap() {
      return renderer.nodeMap;
    },
    abort() {
      parser?.abort();
    },
    destroy() {
      parser?.abort();
      renderer.destroy();
    },
    onDone(cb: () => void) {
      doneCallbacks.push(cb);
    },
  };

  return session;
}
