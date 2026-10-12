import { describe, expect, it } from "vitest";
import { create_text_range, highlight_text } from "../text-range";

class TestNode {
  nodeType = 1;
  parentNode: TestNode | null = null;
  childNodes: TestNode[] = [];
  style: Record<string, string> = {};
  attributes = new Map<string, string>();
  constructor(
    public ownerDocument: TestDocument,
    public tagName = "SPAN",
  ) {}
  get parentElement() {
    return this.parentNode;
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  get textContent(): string {
    return this.childNodes.map((node) => node.textContent).join("");
  }
  set textContent(value: string) {
    this.childNodes = [];
    this.appendChild(new TestText(this.ownerDocument, value));
  }
  appendChild(node: TestNode) {
    node.remove();
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }
  remove() {
    if (this.parentNode) {
      const parent = this.parentNode;
      parent.childNodes.splice(parent.childNodes.indexOf(this), 1);
      this.parentNode = null;
    }
  }
  contains(node: TestNode): boolean {
    return (
      node === this || this.childNodes.some((child) => child.contains(node))
    );
  }
  closest(selector: string): TestNode | null {
    return this.attributes.has(selector)
      ? this
      : this.parentNode?.closest(selector) || null;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  replaceChild(next: TestNode, previous: TestNode) {
    const index = this.childNodes.indexOf(previous);
    this.childNodes[index] = next;
    previous.parentNode = null;
    next.parentNode = this;
  }
  insertBefore(node: TestNode, before: TestNode) {
    node.remove();
    this.childNodes.splice(this.childNodes.indexOf(before), 0, node);
    node.parentNode = this;
  }
  normalize() {
    for (let index = this.childNodes.length - 1; index > 0; index--) {
      const node = this.childNodes[index],
        previous = this.childNodes[index - 1];
      if (node instanceof TestText && previous instanceof TestText) {
        previous.value += node.value;
        node.remove();
      }
    }
  }
}
class TestText extends TestNode {
  nodeType = 3;
  constructor(
    doc: TestDocument,
    public value: string,
  ) {
    super(doc);
  }
  get length() {
    return this.value.length;
  }
  get textContent() {
    return this.value;
  }
  splitText(offset: number) {
    const next = new TestText(this.ownerDocument, this.value.slice(offset));
    this.value = this.value.slice(0, offset);
    const parent = this.parentNode!;
    parent.childNodes.splice(parent.childNodes.indexOf(this) + 1, 0, next);
    next.parentNode = parent;
    return next;
  }
}
class TestRange {
  startContainer!: TestText;
  endContainer!: TestText;
  startOffset = 0;
  endOffset = 0;
  setStart(node: TestText, offset: number) {
    this.startContainer = node;
    this.startOffset = offset;
  }
  setEnd(node: TestText, offset: number) {
    this.endContainer = node;
    this.endOffset = offset;
  }
  toString() {
    return this.startContainer.value.slice(this.startOffset, this.endOffset);
  }
  getClientRects() {
    return [
      { x: 1, y: 2, width: 3, height: 4, top: 2, left: 1, right: 4, bottom: 6 },
    ];
  }
  detach() {}
}
class TestDocument {
  head = new TestNode(this, "HEAD");
  defaultView: any = null;
  createElement(tag: string) {
    return new TestNode(this, tag.toUpperCase());
  }
  createRange() {
    return new TestRange();
  }
  createTreeWalker(root: TestNode) {
    const nodes: TestNode[] = [];
    const collect = (node: TestNode) => {
      for (const child of node.childNodes) {
        if (child.nodeType === 3) nodes.push(child);
        else collect(child);
      }
    };
    collect(root);
    let index = -1;
    return {
      currentNode: root,
      nextNode() {
        index++;
        this.currentNode = nodes[index];
        return nodes[index] || null;
      },
    };
  }
}
function fixture(native = false) {
  const doc = new TestDocument(),
    root = new TestNode(doc);
  root.appendChild(new TestText(doc, "hello "));
  const emphasis = new TestNode(doc, "EM");
  root.appendChild(emphasis);
  emphasis.appendChild(new TestText(doc, "world"));
  if (native)
    doc.defaultView = { CSS: { highlights: new Map() }, Highlight: Set };
  return { doc, root };
}

describe("renderer text ranges and highlights", () => {
  it("resolves cross-node UTF-16 offsets and releases opaque handles", () => {
    const { root } = fixture();
    const range = create_text_range({ target: { get$elm: () => root } }, 3, 9);
    expect(range.text()).toBe("lo wor");
    expect(range.rects()).toHaveLength(2);
    range.release();
    expect(range.text()).toBe("");
    expect(range.rects()).toEqual([]);
    expect(() => highlight_text([range], { name: "note" })).toThrow("released");
    expect(() => create_text_range(root, 0, 12)).toThrow(RangeError);
  });
  it("excludes UI subtrees from both offsets and highlighting", () => {
    const { root, doc } = fixture(true);
    const ui = new TestNode(doc);
    ui.setAttribute(".ui", "1");
    ui.appendChild(new TestText(doc, "IGNORED"));
    root.appendChild(ui);
    const range = create_text_range(root, 0, 11, { exclude: ".ui" });
    expect(range.text()).toBe("hello world");
    const highlight = highlight_text([range], { name: "note" });
    expect(doc.defaultView.CSS.highlights.get("note").size).toBe(2);
    highlight.clear();
    expect(doc.defaultView.CSS.highlights.has("note")).toBe(false);
  });
  it("clears only its own native ranges without deleting another owner's highlight", () => {
    const { root, doc } = fixture(true),
      registry = doc.defaultView.CSS.highlights;
    const foreign = new TestRange();
    registry.set("note", new Set([foreign]));
    const range = create_text_range(root, 0, 5),
      highlight = highlight_text([range], { name: "note", color: "yellow" });
    expect(registry.get("note").size).toBe(2);
    expect(doc.head.childNodes).toHaveLength(1);
    highlight.clear();
    highlight.clear();
    expect(registry.get("note")).toEqual(new Set([foreign]));
    expect(doc.head.childNodes).toHaveLength(0);
  });
  it("fallback merges overlaps and restores the original text and markup", () => {
    const { root } = fixture();
    const emphasis = root.childNodes[1];
    const first = create_text_range(root, 0, 5),
      second = create_text_range(root, 3, 9);
    const highlight = highlight_text([first, second], { name: "note" });
    expect(root.textContent).toBe("hello world");
    expect(root.childNodes[0].tagName).toBe("MARK");
    expect(first.text()).toBe("hello");
    expect(second.text()).toBe("lo wor");
    highlight.clear();
    expect(root.textContent).toBe("hello world");
    expect(root.childNodes[1]).toBe(emphasis);
    expect(root.childNodes).toHaveLength(2);
    expect(highlight.rects()).toEqual([]);
    expect(first.text()).toBe("hello");
    expect(second.text()).toBe("lo wor");
    expect(create_text_range(root, 3, 9).text()).toBe("lo wor");
  });
  it("keeps a shared native range until its final owner clears", () => {
    const { root, doc } = fixture(true),
      range = create_text_range(root, 0, 5);
    const first = highlight_text([range], { name: "note" }),
      second = highlight_text([range], { name: "note" });
    first.clear();
    expect(doc.defaultView.CSS.highlights.get("note").size).toBe(1);
    second.clear();
    expect(doc.defaultView.CSS.highlights.has("note")).toBe(false);
  });
  it("rejects unsafe names/colors and ranges from different documents", () => {
    const one = create_text_range(fixture().root, 0, 1),
      two = create_text_range(fixture().root, 0, 1);
    expect(() => highlight_text([one], { name: "bad}" })).toThrow("name");
    expect(() =>
      highlight_text([one], { name: "note", color: "yellow;}" }),
    ).toThrow("color");
    expect(() => highlight_text([one, two], { name: "note" })).toThrow(
      "one document",
    );
  });
});
