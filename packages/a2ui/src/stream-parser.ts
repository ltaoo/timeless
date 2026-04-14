import { StreamOp } from "./types";
import { A2UIRenderer } from "./renderer";

export interface StreamParserOptions {
  /** Called when the stream is done */
  onDone?: () => void;
  /** Called on each parsed operation */
  onOp?: (op: StreamOp) => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

/**
 * A2UIStreamParser — parses SSE streams and dispatches ops to the renderer.
 *
 * Supports:
 * - EventSource URL
 * - ReadableStream (from fetch SSE)
 * - Direct ops array (non-streaming mode)
 */
export class A2UIStreamParser {
  private _renderer: A2UIRenderer;
  private _options: StreamParserOptions;
  private _abortController: AbortController | null = null;
  private _eventSource: EventSource | null = null;
  private _aborted = false;

  constructor(renderer: A2UIRenderer, options: StreamParserOptions = {}) {
    this._renderer = renderer;
    this._options = options;
  }

  /**
   * Connect to an SSE endpoint using EventSource.
   */
  connectEventSource(url: string) {
    this._eventSource = new EventSource(url);

    this._eventSource.addEventListener("op", (event: MessageEvent) => {
      if (this._aborted) return;
      try {
        const op: StreamOp = JSON.parse(event.data);
        this._handleOp(op);
      } catch (err) {
        this._options.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    });

    this._eventSource.addEventListener("message", (event: MessageEvent) => {
      if (this._aborted) return;
      try {
        const op: StreamOp = JSON.parse(event.data);
        this._handleOp(op);
      } catch (err) {
        this._options.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    });

    this._eventSource.addEventListener("error", () => {
      if (this._aborted) return;
      this._options.onError?.(new Error("EventSource connection error"));
      this.abort();
    });
  }

  /**
   * Parse a ReadableStream (from fetch with SSE).
   */
  async connectStream(stream: ReadableStream<Uint8Array>) {
    this._abortController = new AbortController();
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        if (this._aborted) break;

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? "";

        let currentData = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            // Event type tracked for future use
          } else if (line.startsWith("data:")) {
            currentData = line.slice(5).trim();
          } else if (line === "" && currentData) {
            // Empty line marks end of event
            try {
              const op: StreamOp = JSON.parse(currentData);
              this._handleOp(op);
            } catch (err) {
              this._options.onError?.(err instanceof Error ? err : new Error(String(err)));
            }
            currentData = "";
          }
        }
      }
    } catch (err) {
      if (!this._aborted) {
        this._options.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Apply an array of ops directly (non-streaming mode).
   */
  applyOps(ops: StreamOp[]) {
    for (const op of ops) {
      this._handleOp(op);
    }
  }

  /**
   * Abort the stream connection.
   */
  abort() {
    this._aborted = true;
    if (this._eventSource) {
      this._eventSource.close();
      this._eventSource = null;
    }
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  }

  private _handleOp(op: StreamOp) {
    this._options.onOp?.(op);
    this._renderer.applyOp(op);

    if (op.op === "done") {
      this._options.onDone?.();
      // Close EventSource on done
      if (this._eventSource) {
        this._eventSource.close();
        this._eventSource = null;
      }
    }
  }
}
