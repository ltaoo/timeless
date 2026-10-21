import { describe, expect, it, vi } from "vitest";

import { ref } from "@timeless/inner-reactive";

import { RichText } from "@/content/rich-text";
import { parseRichText } from "@/content/rich-text-document";
import { patch } from "@/hmr/patch";

describe("RichText", () => {
  it("retains Markdown and HTML image metadata without merging surrounding runs", () => {
    const doc = parseRichText(
      "😀 before ![picture](https://example.com/image.png) after",
      "markdown",
    );
    const images = doc.spans.filter((span) => span.image);
    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({
      start: 10,
      end: 17,
      image: { src: "https://example.com/image.png", alt: "picture" },
    });
    expect(doc.text.slice(images[0].end)).toBe(" after");
    const html = parseRichText(
      '<a href="https://example.com"><img src="/image.png" alt="" width="200" height="100"></a>',
    );
    expect(html.text).toBe("\uFFFC");
    expect(html.spans[0]).toMatchObject({
      start: 0,
      end: 1,
      href: "https://example.com",
      image: { src: "/image.png", alt: "", width: 200, height: 100 },
    });
    expect(html.html).toContain('width="200" height="100"');
    const unsafe = parseRichText(
      '<img src="javascript:bad()" alt="fallback" width="-1">',
    );
    expect(unsafe.text).toBe("fallback");
    expect(unsafe.spans[0].image).toBeUndefined();
  });
  it("keeps quotes and loose list markers with their text and composes decorations", () => {
    expect(parseRichText("> quoted\n\nnext", "markdown").text).toBe(
      "│ quoted\n\nnext",
    );
    const list = parseRichText("- first\n\n- second\n  - nested", "markdown");
    expect(list.text).toContain("• first");
    expect(list.text).toContain("• second");
    expect(list.text).toContain("  • nested");
    const nested = parseRichText("<u><del>both</del></u>");
    expect(nested.spans[0].style["text-decoration"]).toBe(
      "underline line-through",
    );
  });
  it("parses Markdown to portable UTF-16 runs without host APIs", () => {
    const doc = parseRichText(
      "# 标题\n\n😀 **粗 *斜*** 与 [链接](https://example.com)\n\n- 一\n- 二\n\n```js\nlet a = 1;\n```",
      "markdown",
    );
    const runs = doc.spans.map((span) => ({
      ...span,
      text: doc.text.slice(span.start, span.end),
    }));
    expect(doc.text).toContain("标题\n\n😀 粗 斜 与 链接");
    expect(doc.text).toContain("• 一\n• 二");
    expect(runs).toContainEqual(
      expect.objectContaining({
        text: "斜",
        style: { "font-weight": "700", "font-style": "italic" },
      }),
    );
    expect(runs).toContainEqual(
      expect.objectContaining({ text: "链接", href: "https://example.com" }),
    );
    expect(runs.find((run) => run.text === "粗 ")?.start).toBe(7);
    expect(doc.html).toContain('data-n="rich-text-h1"');
    expect(doc.html).toContain("let a = 1;");
  });

  it("reads HTML safely, preserving formatting, entities and code whitespace", () => {
    const doc = parseRichText(
      '<p>Hi &amp; <b><i>there</i></b><a href="java&#x73;cript:alert(1)" onclick="bad()">link</a></p><script>bad()</script><pre> a  b \n</pre>',
    );
    expect(doc.text).toBe("Hi & therelink\n\n a  b \n");
    expect(doc.spans.some((span) => span.href)).toBe(false);
    expect(doc.html).not.toMatch(/script|onclick|bad\(\)/);
    expect(
      doc.spans.find((span) => doc.text.slice(span.start, span.end) === "there")
        ?.style,
    ).toMatchObject({ "font-weight": "700", "font-style": "italic" });
    expect(parseRichText("<p>one<br>two</p><p>three</p>").text).toBe(
      "one\ntwo\n\nthree",
    );
    expect(
      parseRichText(
        '<p class="article" id="intro" title="A &quot;title&quot;">text</p>',
      ).html,
    ).toContain('class="article" id="intro" title="A &quot;title&quot;"');
    expect(parseRichText("<div hidden>secret</div><p>shown</p>").text).toBe(
      "shown",
    );
  });

  it("updates the document on reactive changes and patches HMR content", () => {
    const source = ref("**old**");
    const old = RichText({ content: source, format: "markdown" });
    const host = {
      setDocument: vi.fn(),
      teardownEventListener: vi.fn(),
      setupEventListener: vi.fn(),
    };
    old.$elm = host as any;
    source.as("*new*");
    expect(host.setDocument).toHaveBeenLastCalledWith(old.state.document);
    expect(old.state.document.text).toBe("new");
    const next = RichText({ content: "# Heading", format: "markdown" });
    patch(old, next, { buildAndRender: vi.fn() });
    expect(host.setDocument).toHaveBeenLastCalledWith(next.state.document);
    const calls = host.setDocument.mock.calls.length;
    source.as("ignored");
    expect(host.setDocument).toHaveBeenCalledTimes(calls);
    next.onUnmounted();
  });
  it("stores content and forwards reactive updates to its host", () => {
    const content = ref("<p>First</p>");
    const element = RichText({ content });
    const host = { setContent: vi.fn() };

    expect(element.state.content).toBe("<p>First</p>");

    element.$elm = host;
    content.as("<strong>Updated</strong>");

    expect(element.state.content).toBe("<strong>Updated</strong>");
    expect(host.setContent).toHaveBeenCalledWith("<strong>Updated</strong>");

    element.onUnmounted();
    content.as("<em>Ignored</em>");

    expect(host.setContent).toHaveBeenCalledOnce();
  });
});
