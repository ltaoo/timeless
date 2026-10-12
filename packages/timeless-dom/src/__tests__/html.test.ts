import { afterEach, describe, expect, it, vi } from "vitest";
import { Html, View, ref } from "@timeless/timeless";
import { DOMHtml } from "@/host/html";
import { parse_html } from "../html";

afterEach(() => vi.unstubAllGlobals());

describe("fixed semantic components", () => {
  it.each([
    ["H2", "h2"],
    ["Span", "span"],
    ["Button", "button"],
    ["Input", "input"],
    ["Details", "details"],
  ])("creates %s independently of View", (name, tag) => {
    const attrs: Record<string, string> = {};
    const element = {
      nodeType: 1,
      style: { cssText: "" },
      setAttribute: (k: string, v: string) => {
        attrs[k] = v;
      },
      removeAttribute: (k: string) => {
        delete attrs[k];
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      appendChild: vi.fn(),
    };
    const createElement = vi.fn(() => element);
    vi.stubGlobal("document", {
      createElement,
      createDocumentFragment: () => ({ appendChild() {} }),
    });
    const label = ref("Before");
    const content = (Html as any)[name]({
      attributes: { "aria-label": label },
    });
    expect(content.t).toBe("html:" + tag);
    expect(View({}).state).not.toHaveProperty("as");
    const host = DOMHtml({ build: vi.fn(), elm: content });
    content.$elm = host;
    host.render();
    expect(createElement).toHaveBeenCalledWith(tag);
    expect(attrs["aria-label"]).toBe("Before");
    label.set("After");
    expect(attrs["aria-label"]).toBe("After");
    content.destroy();
    label.set("Detached");
    expect(attrs["aria-label"]).toBe("After");
  });
});

it("provides detached HTML querying, mutation and serialization without exposing native nodes", () => {
  const attrs = new Map([["href", "/relative"]]);
  const link = {
    tagName: "A",
    textContent: "Link",
    innerHTML: "Link",
    remove: vi.fn(),
    getAttribute: (name: string) => attrs.get(name) || null,
    setAttribute: (name: string, value: string) => attrs.set(name, value),
    removeAttribute: (name: string) => attrs.delete(name),
  };
  const body = {
    tagName: "BODY",
    textContent: "Link",
    innerHTML: '<a href="/relative">Link</a>',
    querySelector: () => link,
    querySelectorAll: () => [link],
  };
  const doc = { documentElement: body, head: body, body };
  const parse = vi.fn(() => doc);
  vi.stubGlobal(
    "DOMParser",
    class {
      parseFromString = parse;
    },
  );
  const parsed = parse_html("<a>Link</a>");
  expect(parse).toHaveBeenCalledWith("<a>Link</a>", "text/html");
  const node = parsed.body.select("a")!;
  expect(node.tag).toBe("a");
  expect(node.text()).toBe("Link");
  node.attr("href", "https://example.test");
  expect(node.attr("href")).toBe("https://example.test");
  node.attr("href", null);
  expect(node.attr("href")).toBeNull();
  expect(parsed.body.selectAll("a")).toHaveLength(1);
  expect(parsed.body.html()).toContain("<a");
  node.remove();
  expect(link.remove).toHaveBeenCalled();
  expect("ownerDocument" in node).toBe(false);
});
