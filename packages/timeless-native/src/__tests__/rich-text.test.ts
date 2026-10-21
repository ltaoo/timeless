import { RichText, ref, patch } from "@timeless/timeless";
import { describe, expect, it, vi } from "vitest";
import { buildAndRender, nativePlatform } from "../renderer";

describe("native RichText protocol", () => {
  it("forwards image metadata and exposes native layout invalidation", () => {
    const element = RichText({
      content: "![photo](https://example.com/photo.png)",
      format: "markdown",
    });
    const { dom } = buildAndRender(element);
    expect(dom.richText.spans[0].image).toEqual({
      src: "https://example.com/photo.png",
      alt: "photo",
    });
    expect(typeof dom._requestLayout).toBe("function");
    element.onUnmounted();
  });
  it("passes parsed spans, attributes, style and links to both native hosts", () => {
    const source = ref("😀 **bold** and [link](https://example.com)");
    const on_link = vi.fn();
    const element = RichText({
      content: source,
      format: "markdown",
      style: { fontSize: "18px" },
      attributes: { n: "article" },
      onLinkPress: on_link,
    });
    const { dom } = buildAndRender(element);
    expect(dom.type).toBe("text");
    expect(dom.value).toBe("😀 bold and link");
    expect(dom.style["font-size"]).toBe("18px");
    expect(dom.attrs.n).toBe("article");
    expect(dom.richText.spans).toContainEqual(
      expect.objectContaining({
        start: 3,
        end: 7,
        style: { "font-weight": "700" },
      }),
    );
    dom._onLinkPress("https://example.com");
    expect(on_link).toHaveBeenCalledWith("https://example.com");
    const update = vi.fn();
    dom._onRichTextChange = update;
    source.as("*updated*");
    expect(dom.value).toBe("updated");
    expect(update).toHaveBeenLastCalledWith(element.state.document);
    const next_link = vi.fn();
    const next = RichText({
      content: "[next](#next)",
      format: "markdown",
      onLinkPress: next_link,
    });
    patch(element, next, { buildAndRender, platform: nativePlatform() });
    dom._onLinkPress("#next");
    expect(next_link).toHaveBeenCalledWith("#next");
    expect(dom.value).toBe("next");
    next.onUnmounted();
    const calls = update.mock.calls.length;
    source.as("ignored");
    expect(update).toHaveBeenCalledTimes(calls);
  });
});
