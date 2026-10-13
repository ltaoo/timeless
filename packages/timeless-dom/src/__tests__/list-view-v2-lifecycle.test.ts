import { afterEach, describe, expect, it, vi } from "vitest";
import { ListViewV2, ref } from "@timeless/timeless";
import { DOMListViewV2 } from "@/host/list-view-v2";

function node() {
  const value: any = {
    nodeType: 1,
    style: {},
    clientHeight: 40,
    scrollTop: 0,
    children: [],
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
    appendChild(child: any) {
      child.parent = this;
      this.children.push(child);
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

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
