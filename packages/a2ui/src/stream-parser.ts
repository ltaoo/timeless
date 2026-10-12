import { A2UIRenderer } from "./renderer";
export interface StreamParserOptions {
  format?: "sse" | "jsonl";
  onMessage?: (message: unknown) => void;
  onError?: (error: Error) => void;
  onDone?: () => void;
}
export class A2UIStreamParser {
  private renderer: A2UIRenderer;
  private options: StreamParserOptions;
  private reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  private event_source: EventSource | undefined;
  private aborted = false;
  constructor(renderer: A2UIRenderer, options: StreamParserOptions = {}) {
    this.renderer = renderer;
    this.options = options;
  }
  private dispatch(data: string): void {
    try {
      const message: unknown = JSON.parse(data);
      this.renderer.processMessage(message);
      this.options.onMessage?.(message);
    } catch (error) {
      if (this.options.onError)
        this.options.onError(
          error instanceof Error ? error : new Error(String(error)),
        );
      else throw error;
    }
  }
  connectEventSource(url: string): void {
    if (this.aborted || this.reader || this.event_source)
      throw new Error("Stream parser is already connected or aborted");
    this.event_source = new EventSource(url);
    this.event_source.addEventListener(
      "message",
      (event: MessageEvent<string>) => {
        if (!this.aborted) this.dispatch(event.data);
      },
    );
    this.event_source.addEventListener("error", () => {
      this.abort();
      this.options.onError?.(new Error("EventSource connection failed"));
    });
  }
  async connectStream(stream: ReadableStream<Uint8Array>): Promise<void> {
    if (this.aborted || this.reader || this.event_source)
      throw new Error("Stream parser is already connected or aborted");
    const reader = stream.getReader();
    this.reader = reader;
    const decoder = new TextDecoder();
    let buffer = "";
    let data: string[] = [];
    const line = (text: string) => {
      if (text.endsWith("\r")) text = text.slice(0, -1);
      if (this.options.format === "jsonl") {
        if (text.trim()) this.dispatch(text);
        return;
      }
      if (text === "") {
        if (data.length) this.dispatch(data.join("\n"));
        data = [];
      } else if (text.startsWith("data:"))
        data.push(text.slice(5).replace(/^ /, ""));
    };
    try {
      while (!this.aborted) {
        const { value, done } = await reader.read();
        buffer += done
          ? decoder.decode()
          : decoder.decode(value, { stream: true });
        let boundary: number;
        while ((boundary = buffer.indexOf("\n")) >= 0) {
          line(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 1);
          if (this.aborted) break;
        }
        if (done) {
          if (!this.aborted && buffer) line(buffer);
          break;
        }
      }
      // SSE dispatch requires an event boundary; an unterminated event is discarded.
      if (!this.aborted) this.options.onDone?.();
    } finally {
      this.reader = undefined;
      reader.releaseLock();
    }
  }
  abort(): void {
    if (this.aborted) return;
    this.aborted = true;
    this.event_source?.close();
    this.event_source = undefined;
    void this.reader?.cancel().catch(() => {});
  }
}
