import { afterEach, describe, expect, it, vi } from "vitest";

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
    expect($rendered.innerHTML).toBe("<p>First</p>");
    expect($rendered.attributes.get("class")).toBe("article-body");
    expect($rendered.attributes.get("data-format")).toBe("html");

    host.setContent("<strong>Updated</strong>");

    expect($rendered.innerHTML).toBe("<strong>Updated</strong>");
  });
});
