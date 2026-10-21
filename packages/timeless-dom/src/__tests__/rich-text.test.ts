import { afterEach, describe, expect, it, vi } from "vitest";
import { RichText } from "@timeless/timeless";

import { DOMRichText } from "@/host/rich-text";
import { build } from "@/renderer/build";

type FakeElement = {
  nodeType: number;
  innerHTML: string;
  style: { cssText: string };
  attributes: Map<string, string>;
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  addEventListener(): void;
  removeEventListener(): void;
};

function create_element(): FakeElement {
  return {
    nodeType: 1,
    innerHTML: "",
    style: { cssText: "" },
    attributes: new Map(),
    setAttribute(name, value) {
      this.attributes.set(name, value);
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
    addEventListener() {},
    removeEventListener() {},
  };
}

describe("DOMRichText", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("handles Markdown links after hydration and refreshes callbacks during HMR", () => {
    const $element = create_element();
    const listeners = new Map<string, (event: any) => void>();
    $element.addEventListener = vi.fn((name: string, handler: any) =>
      listeners.set(name, handler),
    ) as any;
    const link = { getAttribute: () => "https://example.com" };
    ($element as any).contains = (value: any) => value === link;
    const first = vi.fn();
    const second = vi.fn();
    const element = RichText({
      content: "[link](https://example.com)",
      format: "markdown",
      onLinkPress: first,
    });
    const host = build(element) as DOMRichText;
    host.hydrate(element, $element as unknown as HTMLDivElement);
    const event = { target: { closest: () => link }, preventDefault: vi.fn() };
    listeners.get("click")?.(event);
    expect(first).toHaveBeenCalledWith("https://example.com");
    expect(event.preventDefault).toHaveBeenCalledOnce();
    host.setupEventListener({ onLinkPress: second });
    listeners.get("click")?.(event);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledWith("https://example.com");
    element.onUnmounted();
  });

  it("renders HTML and updates content", () => {
    const $element = create_element();
    vi.stubGlobal("document", {
      createElement: vi.fn(() => $element),
    });
    const element = {
      t: "rich-text",
      $elm: null,
      state: {
        content: "<p>First</p>",
        style: {},
        styleSet: ["article-body"],
        attributes: { "data-format": "html" },
        dataset: {},
      },
      events: {},
    } as any;

    const host = build(element) as DOMRichText;
    const $rendered = host.render() as unknown as FakeElement;

    expect(host.t).toBe("rich-text");
    expect(element.$elm).toBe(host);
    expect($rendered.innerHTML).toContain('data-n="rich-text-p">First</p>');
    expect($rendered.attributes.get("class")).toBe("article-body");
    expect($rendered.attributes.get("data-format")).toBe("html");

    host.setContent("<strong>Updated</strong>");

    expect($rendered.innerHTML).toContain(">Updated</strong>");
    expect($rendered.innerHTML).toContain("font-weight:700");
  });
});
