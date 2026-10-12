import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Text, View } from "@timeless/timeless";
import { createDOMRenderer } from "../../../ui-renderer-dom/src/index";
import type { Observable, SlotDefinition } from "../index";

declare module "../index" {
  interface SlotMap {
    actions: SlotDefinition<"list", { title: string }>;
  }
}

/** Minimal DOM carrier; rendering itself uses the real Timeless DOM host. */
class NodeFixture {
  nodeType: number;
  parentNode: NodeFixture | null = null;
  childNodes: NodeFixture[] = [];
  attributes = new Map<string, string>();
  style: Record<string, string> = { cssText: "" };
  private text = "";
  constructor(nodeType: number, text = "") {
    this.nodeType = nodeType;
    this.text = text;
  }
  get parentElement(): NodeFixture | null {
    return this.parentNode?.nodeType === 1 ? this.parentNode : null;
  }
  get textContent(): string {
    return this.nodeType === 3
      ? this.text
      : this.childNodes.map((node) => node.textContent).join("");
  }
  set textContent(text: string) {
    this.text = text;
  }
  appendChild(node: NodeFixture): NodeFixture {
    return this.insertBefore(node, null);
  }
  insertBefore(node: NodeFixture, before: NodeFixture | null): NodeFixture {
    if (node.nodeType === 11) {
      for (const child of [...node.childNodes])
        this.insertBefore(child, before);
      return node;
    }
    node.parentNode?.removeChild(node);
    const index =
      before === null
        ? this.childNodes.length
        : this.childNodes.indexOf(before);
    if (index < 0) throw new Error("Anchor is not a child");
    this.childNodes.splice(index, 0, node);
    node.parentNode = this;
    return node;
  }
  removeChild(node: NodeFixture): NodeFixture {
    const index = this.childNodes.indexOf(node);
    if (index < 0) throw new Error("Node is not a child");
    this.childNodes.splice(index, 1);
    node.parentNode = null;
    return node;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  addEventListener() {}
  removeEventListener() {}
}

class Counter implements Observable<number> {
  private value = 0;
  readonly listeners = new Set<() => void>();
  getSnapshot = () => this.value;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  increment() {
    this.value += 1;
    for (const listener of [...this.listeners]) listener();
  }
}

describe("DOM renderer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("document", {
      createElement: () => new NodeFixture(1),
      createTextNode: (text: string) => new NodeFixture(3, text),
      createDocumentFragment: () => new NodeFixture(11),
    });
  });
  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("updates actual host text, removes replaced components, and permits remount", () => {
    const counter = new Counter();
    const renderer = createDOMRenderer();
    const container = new NodeFixture(1);
    const sentinel = new NodeFixture(3, "sentinel:");
    container.appendChild(sentinel);
    renderer.slots.register(
      { name: "root", children: { actions: "list" } },
      (props) =>
        View({ attributes: { n: "app" } }, [
          props.renderSlot("actions", { title: "Actions" }),
        ]),
    );
    const remove_counter = renderer.slots.register(
      { name: "actions", id: "counter" },
      (props) => Text(props.observe(counter, (value) => value)),
    );
    const unmount = renderer.mount(container as unknown as HTMLElement);
    expect(container.textContent).toBe("sentinel:0");
    counter.increment();
    expect(container.textContent).toBe("sentinel:1");
    const remove_override = renderer.slots.register(
      { name: "actions", id: "counter", priority: -1 },
      () => "override",
    );
    expect(container.textContent).toBe("sentinel:override");
    expect(counter.listeners.size).toBe(0);
    remove_override();
    expect(container.textContent).toBe("sentinel:1");
    remove_counter();
    expect(container.textContent).toBe("sentinel:");
    unmount();
    expect(container.childNodes).toEqual([sentinel]);
    const stop = renderer.mount(container as unknown as HTMLElement);
    stop();
    renderer.dispose();
    expect(container.childNodes).toEqual([sentinel]);
  });

  it("unmounts before deferred mounts without reviving a removed plugin", () => {
    const renderer = createDOMRenderer();
    const container = new NodeFixture(1);
    const mounted = vi.fn();
    const cleaned = vi.fn();
    renderer.slots.register(
      { name: "root", children: { actions: "list" } },
      (props) => props.renderSlot("actions", { title: "Actions" }),
    );
    const unmount = renderer.mount(container as unknown as HTMLElement);
    renderer.slots.register({ name: "actions", id: "late" }, (props) => {
      props.onCleanup(cleaned);
      return View({ attributes: { n: "late-action" }, onMounted: mounted });
    });
    unmount();
    const before = mounted.mock.calls.length;
    vi.runAllTimers();
    expect(mounted.mock.calls.length).toBe(before);
    expect(cleaned).toHaveBeenCalledOnce();
    expect(container.childNodes).toEqual([]);
    renderer.dispose();
  });

  it("keeps list nodes ordered and removable after insertions and priority replacement", () => {
    const renderer = createDOMRenderer();
    const container = new NodeFixture(1);
    const created = vi.fn();
    renderer.slots.register(
      { name: "root", children: { actions: "list" } },
      (props) => props.renderSlot("actions", { title: "Actions" }),
    );
    const unmount = renderer.mount(container as unknown as HTMLElement);
    const remove_b = renderer.slots.register(
      { name: "actions", id: "b", order: 20 },
      () => {
        created();
        return "B";
      },
    );
    const remove_c = renderer.slots.register(
      { name: "actions", id: "c", order: 30 },
      () => "C",
    );
    const remove_a = renderer.slots.register(
      { name: "actions", id: "a", order: 10 },
      () => "A",
    );
    expect(container.textContent).toBe("ABC");
    expect(created).toHaveBeenCalledOnce();
    const remove_override = renderer.slots.register(
      { name: "actions", id: "b", priority: -1, order: 40 },
      () => "b",
    );
    expect(container.textContent).toBe("ACb");
    remove_override();
    expect(container.textContent).toBe("ABC");
    remove_c();
    expect(container.textContent).toBe("AB");
    remove_a();
    expect(container.textContent).toBe("B");
    remove_b();
    expect(container.textContent).toBe("");
    unmount();
    renderer.dispose();
  });
});
