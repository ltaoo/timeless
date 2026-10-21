import { describe, expect, it, vi } from "vitest";
import { RichText, ref } from "@timeless/timeless";
import { CanvasRichText } from "./rich-text";
import { createCanvasDocument } from "./draw";

describe("CanvasRichText", () => {
  it("measures, paints and updates the same styled document and dispatches its links", async () => {
    const handlers = new Map<string, Function>();
    const fill_text = vi.fn();
    const canvas = {
      width: 160,
      height: 300,
      clientWidth: 160,
      clientHeight: 300,
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 160,
        height: 300,
      }),
      addEventListener: (name: string, handler: Function) =>
        handlers.set(name, handler),
      removeEventListener: (name: string) => handlers.delete(name),
    } as unknown as HTMLCanvasElement;
    const context = new Proxy(
      {
        canvas,
        fillText: fill_text,
        measureText: (text: string) => ({ width: Array.from(text).length * 8 }),
      },
      {
        get(target, key) {
          return key in target ? target[key as keyof typeof target] : () => {};
        },
      },
    ) as unknown as CanvasRenderingContext2D;
    canvas.getContext = (() => context) as any;
    const document = createCanvasDocument(canvas, { context });
    const content = ref("**bold** [link](#target)");
    const on_link = vi.fn();
    const element = RichText({
      content,
      format: "markdown",
      onLinkPress: on_link,
      style: { paddingLeft: "8px" },
    });
    const host = CanvasRichText({
      canvas: document,
      elm: element,
      build: vi.fn(),
    });
    element.$elm = host;
    document.appendChild(document.body, host.render());
    document.draw();
    expect(fill_text.mock.calls.some(([text]) => text === "bold")).toBe(true);
    expect(host.$elm.richTextLayout?.height).toBeGreaterThan(0);
    const link = host.$elm.richTextLayout!.fragments.find(
      (fragment) => fragment.href,
    )!;
    handlers.get("click")?.({
      offsetX: link.x + 1,
      offsetY: link.y + 1,
      stopPropagation() {},
    });
    expect(on_link).toHaveBeenCalledWith("#target");
    content.as("*changed*");
    document.draw();
    expect(host.$elm.richText?.text).toBe("changed");
    expect(fill_text.mock.calls.some(([text]) => text === "changed")).toBe(
      true,
    );
    element.onUnmounted();
    await Promise.resolve();
    document.destroy();
  });
});
