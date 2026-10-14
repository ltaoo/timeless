import { afterEach, expect, it, vi } from "vitest";
import { parse_html } from "../html";
afterEach(() => vi.unstubAllGlobals());

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
