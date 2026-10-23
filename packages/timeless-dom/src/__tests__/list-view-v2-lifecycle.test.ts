import { afterEach, describe, expect, it, vi } from "vitest";
import { ListViewV2, ref, View } from "@timeless/timeless";
import { DOMListViewV2 } from "@/host/list-view-v2";
import { build } from "@/renderer/build";

function node() {
  const value: any = {
    nodeType: 1,
    style: {},
    clientHeight: 40,
    scrollTop: 0,
    children: [],
    get childNodes() { return this.children; },
    get parentElement() { return this.parentNode; },
    get textContent() { return this.nodeType === 3 ? this.data : this.children.map((child: any) => child.textContent).join(""); },
    set textContent(value: string) { this.data = value; },
    attributes: new Map(),
    classList: { add() {}, remove() {} },
    setAttribute(name: string, content: string) {
      this.attributes.set(name, content);
    },
    removeAttribute(name: string) {
      this.attributes.delete(name);
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild(child: any) { return this.insertBefore(child, null); },
    insertBefore(child: any, anchor: any) {
      if (child.nodeType === 11) {
        for (const nested of [...child.children]) this.insertBefore(nested, anchor);
        return child;
      }
      child.parentNode?.removeChild(child);
      const index = anchor ? this.children.indexOf(anchor) : this.children.length;
      if (index < 0) throw new Error("Anchor is not a child");
      child.parent = child.parentNode = this;
      this.children.splice(index, 0, child);
      return child;
    },
    removeChild(child: any) {
      this.children.splice(this.children.indexOf(child), 1);
      child.parent = child.parentNode = null;
    },
    replaceChildren() {
      for (const child of [...this.children]) this.removeChild(child);
    },
    remove() {
      if (this.parent)
        this.parent.children.splice(this.parent.children.indexOf(this), 1);
    },
    getBoundingClientRect: () => ({ height: 40 }),
  };
  return value;
}

it("permanently destroys rows on scroll, key replacement and list teardown", () => {
  vi.useFakeTimers();
  vi.stubGlobal("document", { createElement: node });
  vi.stubGlobal("window", { addEventListener() {}, removeEventListener() {} });
  const rows: any[] = [];
  const source = ref([{ id: 1 }, { id: 2 }]);
  const top = ref(0);
  const list = ListViewV2({
    each: source,
    key: "id",
    itemHeight: 40,
    buffer: 0,
    externalScroll: true,
    scrollTop: top,
    viewportHeight: 40,
    render: () => null,
  });
  // Exercise the host's teardown contract independently of the primitive's row wrapper.
  list.renderItem = () => {
    const row: any = {
      t: "view",
      $elm: null,
      children: [],
      state: {},
      beforeUnmounted: vi.fn(),
      onUnmounted: vi.fn(),
      onMounted: vi.fn(),
      destroy: vi.fn(),
    };
    rows.push(row);
    return row;
  };
  const host = DOMListViewV2({
    elm: list,
    build: () => ({ render: node }) as any,
  });
  host.render();
  top.as(40);
  vi.runOnlyPendingTimers();
  expect(rows[0].beforeUnmounted).toHaveBeenCalledTimes(1);
  expect(rows[0].destroy).toHaveBeenCalledTimes(1);
  expect(rows[0].onUnmounted).not.toHaveBeenCalled();
  source.as([{ id: 1 }, { id: 3 }]);
  vi.runOnlyPendingTimers();
  expect(rows[1].destroy).toHaveBeenCalledTimes(1);
  host.destroy();
  host.destroy();
  expect(rows[2].destroy).toHaveBeenCalledTimes(1);
  expect(source.getDeps()).toHaveLength(0);
  expect(top.getDeps()).toHaveLength(0);
  list.destroy?.();
});

it("mounts empty content after the virtual spacer and forwards its lifecycle", () => {
  vi.useFakeTimers();
  vi.stubGlobal("document", { createElement: node, createDocumentFragment: () => ({ ...node(), nodeType: 11 }) });
  vi.stubGlobal("window", { addEventListener() {}, removeEventListener() {} });
  const mounted = vi.fn(), before_unmount = vi.fn(), unmount = vi.fn();
  const list = ListViewV2({ each: [], render: () => null, empty: () => View({
    attributes: { n: "empty-list" }, onMounted: mounted,
    beforeUnmounted: before_unmount, onUnmounted: unmount,
  }) });
  const empty_dom = node();
  const host = DOMListViewV2({ elm: list, build: (child) => {
    child.$elm = { get$elm: () => empty_dom } as any;
    return { render: () => empty_dom } as any;
  } });
  list.$elm = host;
  const root = host.render();
  expect(root.children).toHaveLength(2);
  expect(root.children[0].style.height).toBe("0px");
  expect(root.children[1]).toBe(empty_dom);
  list.onMounted({ target: host });
  expect(mounted).toHaveBeenCalledOnce();
  list.beforeUnmounted?.();
  expect(before_unmount).toHaveBeenCalledOnce();
  list.destroy?.();
  list.destroy?.();
  expect(unmount).toHaveBeenCalledOnce();
});

it.each([false, true])("switches empty DOM content after hydration=%s", (hydrate) => {
  vi.useFakeTimers();
  vi.stubGlobal("document", {
    createElement: node,
    createDocumentFragment: () => Object.assign(node(), { nodeType: 11 }),
    createTextNode: (value: string) => Object.assign(node(), { nodeType: 3, textContent: value }),
  });
  vi.stubGlobal("window", { addEventListener() {}, removeEventListener() {} });
  const items = ref<{ id: number }[]>([]);
  const label = ref("No items");
  const list = ListViewV2({ each: items, render: () => null, empty: () => View({
    attributes: { n: "empty-list" },
  }, [label]) });
  const host = build(list) as DOMListViewV2;
  const root = hydrate ? node() : host.render();
  if (hydrate) host.hydrate(list, root, { $parent: node(), offset: 0, idx: 0 });
  list.onMounted({ target: host });
  expect(root.textContent).toBe("No items");
  label.as("Nothing here");
  expect(root.textContent).toBe("Nothing here");
  items.as([{ id: 1 }]);
  vi.runOnlyPendingTimers();
  expect(root.textContent).toBe("");
  expect(root.attributes.get("data-virtual-list-rendered")).toBe("1");
  items.as([]);
  vi.runOnlyPendingTimers();
  expect(root.textContent).toBe("Nothing here");
  expect(root.children[0].style.height).toBe("0px");
  list.destroy?.();
  expect(items.getDeps()).toHaveLength(0);
  expect(label.getDeps()).toHaveLength(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
