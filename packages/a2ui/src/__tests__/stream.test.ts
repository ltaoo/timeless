import { describe, expect, it, vi } from "vitest";
import { A2UIRenderer, A2UIStreamParser, BASIC_CATALOG_ID } from "../index";
const create = JSON.stringify({
  version: "v0.9.1",
  createSurface: { surfaceId: "中文", catalogId: BASIC_CATALOG_ID },
});
function stream(text: string): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream({
    start(controller) {
      for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
      controller.close();
    },
  });
}
describe("A2UI transport framing", () => {
  it("parses UTF-8 SSE split at every byte, CRLF boundaries, comments, and multiline data", async () => {
    const renderer = new A2UIRenderer();
    const done = vi.fn();
    const parser = new A2UIStreamParser(renderer, { onDone: done });
    const payload = create.replace(',"createSurface"', ',\n"createSurface"');
    await parser.connectStream(
      stream(
        `: comment\r\nevent: message\r\n${payload
          .split("\n")
          .map((line) => `data: ${line}`)
          .join("\r\n")}\r\n\r\n`,
      ),
    );
    expect(renderer.model.surfaces.has("中文")).toBe(true);
    expect(done).toHaveBeenCalledOnce();
    renderer.destroy();
  });
  it("parses the final JSONL message without a newline and continues after reported errors", async () => {
    const renderer = new A2UIRenderer();
    const errors = vi.fn();
    await new A2UIStreamParser(renderer, {
      format: "jsonl",
      onError: errors,
    }).connectStream(stream(`not json\n${create}`));
    expect(errors).toHaveBeenCalledOnce();
    expect(renderer.model.surfaces.has("中文")).toBe(true);
    renderer.destroy();
  });
  it("cancels a pending reader on abort", async () => {
    const renderer = new A2UIRenderer();
    const cancel = vi.fn();
    const done = vi.fn();
    const parser = new A2UIStreamParser(renderer, { onDone: done });
    const pending = parser.connectStream(new ReadableStream({ cancel }));
    parser.abort();
    await pending;
    expect(cancel).toHaveBeenCalledOnce();
    expect(done).not.toHaveBeenCalled();
    renderer.destroy();
  });
});
