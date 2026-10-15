import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button, For, Fragment, Show, Text, View, ref } from "@timeless/timeless";
import { hydrate } from "@/renderer/hydrate";

class FakeNode extends EventTarget {
  childNodes: FakeNode[] = [];
  parentNode: FakeNode | null = null;
  style = { cssText: "" };
  constructor(public nodeType: number, public data = "") { super(); }
  get parentElement() { return this.parentNode; }
  get firstChild() { return this.childNodes[0] || null; }
  get textContent(): string { return this.nodeType === 3 ? this.data : this.childNodes.map(node => node.textContent).join(""); }
  set textContent(value: string) { this.data = value; }
  setAttribute() {}
  removeAttribute() {}
  appendChild(node: FakeNode) { return this.insertBefore(node, null); }
  insertBefore(node: FakeNode, anchor: FakeNode | null) {
    if (node.nodeType === 11) {
      for (const child of [...node.childNodes]) this.insertBefore(child, anchor);
      return node;
    }
    node.parentNode?.removeChild(node);
    const index = anchor ? this.childNodes.indexOf(anchor) : this.childNodes.length;
    if (index < 0) throw new Error("Anchor is not a child");
    this.childNodes.splice(index, 0, node);
    node.parentNode = this;
    return node;
  }
  removeChild(node: FakeNode) {
    const index = this.childNodes.indexOf(node);
    if (index < 0) throw new Error("Node is not a child");
    this.childNodes.splice(index, 1);
    node.parentNode = null;
    return node;
  }
  splitText(offset: number) {
    const tail = new FakeText(this.data.slice(offset));
    this.data = this.data.slice(0, offset);
    const parent = this.parentNode!;
    parent.insertBefore(tail, parent.childNodes[parent.childNodes.indexOf(this) + 1] || null);
    return tail;
  }
}
class FakeElement extends FakeNode { constructor() { super(1); } }
class FakeText extends FakeNode { constructor(value: string) { super(3, value); } }
const element = (...children: FakeNode[]) => {
  const node = new FakeElement();
  children.forEach(child => node.appendChild(child));
  return node;
};
const view = (name: string, children: any[] = []) => View({ attributes: { n: name } }, children);

describe("SSR hydration DOM cursor", () => {
  beforeEach(() => {
    vi.stubGlobal("HTMLElement", FakeElement);
    vi.stubGlobal("Text", FakeText);
    vi.stubGlobal("document", {
      createTextNode: (value: string) => new FakeText(value),
      createElement: () => new FakeElement(),
      createDocumentFragment: () => new FakeNode(11),
    });
    vi.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("reuses siblings after empty Show and For anchors and keeps their events", () => {
    const clicked = vi.fn();
    const button = element(new FakeText("click"));
    const first = element(new FakeText("first"));
    const parent = element(first, button);
    const root = element(parent);
    const items = ref<string[]>([]);
    const vnode = view("root", [
      Show({ when: ref(false), ok: () => view("hidden") }),
      For({ each: items, render: value => view("item", [value]) }),
      view("first", ["first"]),
      Button({ attributes: { n: "button" }, onClick: clicked }, ["click"]),
    ]);
    expect(() => hydrate(vnode, root as any)).not.toThrow();
    expect(first.parentNode).toBe(parent);
    expect(button.parentNode).toBe(parent);
    button.dispatchEvent(new Event("click"));
    expect(clicked).toHaveBeenCalledOnce();
    items.set(["added"]);
    expect(parent.textContent).toBe("addedfirstclick");
    items.set([]);
    expect(parent.textContent).toBe("firstclick");
  });

  it("restores missing empty text and splits browser-coalesced reactive text", () => {
    const count = ref(1);
    const combined = new FakeText("count:1");
    const button = element(new FakeText("tail"));
    const parent = element(combined, button);
    const empty = Text("");
    const label = Text("count:");
    const value = Text(count);
    const tail = Button({ attributes: { n: "tail-button" } }, ["tail"]);
    expect(() => hydrate(view("root", [empty, label, value, tail]), element(parent) as any)).not.toThrow();
    expect(label.$elm?.get$elm()).toBe(combined);
    expect(tail.$elm?.get$elm()).toBe(button);
    count.set(2);
    expect(parent.textContent).toBe("count:2tail");
  });

  it("tracks nested transparent anchors without consuming the following button", () => {
    const shown = ref(true);
    const items = ref(["item"]);
    const existing = element(new FakeText("item"));
    const button = element(new FakeText("tail"));
    const parent = element(existing, button);
    const clicked = vi.fn();
    const vnode = view("root", [
      Show({ when: shown, ok: () => Fragment({}, [
        For({ each: items, render: value => view("item", [value]) }),
        Show({ when: ref(false), ok: () => view("hidden") }),
      ]) }),
      Button({ attributes: { n: "tail-button" }, onClick: clicked }, ["tail"]),
    ]);
    expect(() => hydrate(vnode, element(parent) as any)).not.toThrow();
    button.dispatchEvent(new Event("click"));
    expect(clicked).toHaveBeenCalledOnce();
    shown.set(false);
    expect(parent.textContent).toBe("tail");
    expect(button.parentNode).toBe(parent);
  });
});
