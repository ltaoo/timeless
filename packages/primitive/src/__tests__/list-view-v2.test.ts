import { describe, expect, it, vi } from "vitest";

import { createListViewV2Model, ListViewV2 } from "@/content/list-view-v2";

import { ref, refarr, computed, combine } from "@timeless/inner-reactive";
import { View } from "@/content/view";
import { For } from "@/reactive/for";
import { Show } from "@/reactive/show";
import { Scope, createContext, provide, use } from "@/context/context";

describe("ListViewV2", () => {
  it("keeps measured heights by key and finds the visible range", () => {
    const ada = { id: 1 };
    const bob = { id: 2 };
    const cara = { id: 3 };
    const model = createListViewV2Model({
      items: [ada, bob, cara],
      key: "id",
      itemHeight: 40,
      gutter: 4,
    });

    expect(model.getTotalHeight()).toBe(128);
    expect(model.measure(0, 80).changed).toBe(true);
    expect(model.getOffset(1)).toBe(84);
    expect(model.getRange(85, 20)).toEqual({
      start: 1,
      end: 2,
      visibleStart: 1,
    });

    model.measure(1, 60);
    model.setItems([bob, ada, cara]);
    expect(model.getItemHeight(0)).toBe(60);
    expect(model.getOffset(1)).toBe(64);
    expect(model.getItemHeight(1)).toBe(80);
  });

  it("creates a distinct semantic vnode", () => {
    const list = ListViewV2({ each: [], render: () => null });

    expect(list.t).toBe("list-view-v2");
    expect(list.state.attributes.n).toBe("list-view-v2");
    list.destroy?.();
  });
});

describe("ListViewV2 empty content", () => {
  it("shows eager content only for an empty list", () => {
    for (const each of [[], [{ id: 1 }]]) {
      const content = View({ attributes: { n: "empty-list" } }, ["No items"]);
      const list = ListViewV2({ each, render: () => null, empty: content });
      expect(list.children?.[0]?.children).toEqual(each.length ? [] : [content]);
      list.destroy?.();
    }
  });

  it("updates on array patches and releases lazy content subscriptions", () => {
    const items = refarr<{ id: number }>([]);
    const label = ref("No items");
    const render_empty = vi.fn(() => View(
      { attributes: { n: "empty-list" } },
      [computed(label, (value) => value)],
    ));
    const list = ListViewV2({ each: items, render: () => null, empty: render_empty });
    expect(render_empty).toHaveBeenCalledOnce();
    expect(label.getDeps()).toHaveLength(1);
    items.push({ id: 1 });
    expect(list.children?.[0]?.children).toEqual([]);
    expect(label.getDeps()).toHaveLength(0);
    items.clear();
    expect(render_empty).toHaveBeenCalledTimes(2);
    list.destroy?.();
    list.destroy?.();
    expect(label.getDeps()).toHaveLength(0);
    expect(items.getDeps()).toHaveLength(0);
    items.push({ id: 2 });
    items.clear();
    expect(render_empty).toHaveBeenCalledTimes(2);
  });

  it("defers the factory for populated lists and inherits context", () => {
    const context = createContext("empty-context");
    const items = ref([{ id: 1 }]);
    const render_empty = vi.fn(() => [View({ attributes: {
      n: "empty-list", title: use(context),
    } }), "No items"]);
    let list!: ReturnType<typeof ListViewV2>;
    const parent = Scope(() => provide(context, "parent"), () => {
      list = ListViewV2({ each: items, render: () => null, empty: render_empty });
      return list;
    });
    expect(render_empty).not.toHaveBeenCalled();
    items.as([]);
    expect(list.children?.[0]?.children?.[0]?.state.attributes.title).toBe("parent");
    expect(list.children?.[0]?.children?.[1]?.state.value).toBe("No items");
    parent.destroy?.();
    expect(items.getDeps()).toHaveLength(0);
  });
});

describe("ListViewV2 row disposal", () => {
  it("owns render-created subscriptions and permanently destroys nested branches", () => {
    const shared = ref(0);
    const condition = ref(true);
    const calculate = vi.fn((value: number) => value);
    const unmount = vi.fn();
    const list = ListViewV2({
      each: [{ id: 1 }],
      render: () => {
        const outer = computed(shared, calculate);
        Scope(
          () => {},
          () => [],
        ).destroy?.();
        // Nested owners must restore the outer disposal tracker.
        const combined = combine({ shared }, ({ shared }) => shared);
        return View(
          { attributes: { n: "virtual-row-test", "aria-label": outer } },
          [
            Scope(
              () => {},
              () =>
                View({ attributes: { n: "virtual-nested-scope" } }, [
                  computed(shared, calculate),
                ]),
            ),
            Show({
              when: condition,
              ok: () =>
                View(
                  { onUnmounted: unmount, attributes: { n: "virtual-branch" } },
                  [computed(shared, calculate), combined],
                ),
            }),
          ],
        );
      },
    });
    for (let index = 0; index < 100; index++) {
      const row = list.renderItem(ref({ id: 1 }), ref(index))!;
      row.onUnmounted();
      row.destroy?.();
    }
    expect(shared.getDeps()).toHaveLength(0);
    expect(condition.getDeps()).toHaveLength(0);
    expect(unmount).toHaveBeenCalledTimes(100);
    const before = calculate.mock.calls.length;
    shared.as(1);
    expect(calculate).toHaveBeenCalledTimes(before);
    const visible = list.renderItem(ref({ id: 1 }), ref(0))!;
    shared.as(2);
    expect(calculate).toHaveBeenCalledTimes(before + 6);
    visible.destroy?.();
    expect(shared.getDeps()).toHaveLength(0);
    expect(shared.value).toBe(2);
    list.destroy?.();
  });

  it("inherits context from the list even when rows are rendered later", () => {
    const context = createContext("virtual-context");
    let list!: ReturnType<typeof ListViewV2>;
    const parent = Scope(
      () => provide(context, "parent"),
      () => {
        list = ListViewV2({
          each: [{ id: 1 }],
          render: () =>
            View({
              attributes: { n: "virtual-context-row", title: use(context) },
            }),
        });
        return list;
      },
    );
    const row = list.renderItem(ref({ id: 1 }), ref(0))!;
    expect(row.children?.[0]?.state.attributes.title).toBe("parent");
    row.destroy?.();
    parent.destroy?.();
  });

  it("cleans up an empty or throwing render without destroying shared input", () => {
    const shared = ref(0);
    for (const fail of [false, true]) {
      const list = ListViewV2({
        each: [],
        render: () => {
          computed(shared, (value) => value);
          if (fail) throw new Error("row failed");
          return null;
        },
      });
      const render = () => list.renderItem(ref({}), ref(0));
      if (fail) expect(render).toThrow("row failed");
      else expect(render()).toBeNull();
      expect(shared.getDeps()).toHaveLength(0);
      list.destroy?.();
    }
  });

  it("destroys array results including refs constructed inside nested branches", () => {
    const shared = ref(0);
    const list = ListViewV2({
      each: [],
      render: () => [
        computed(shared, (value) => value),
        Show({ when: true, ok: () => computed(shared, (value) => value) }),
      ],
    });
    const row = list.renderItem(ref({}), ref(0))!;
    row.destroy?.();
    expect(shared.getDeps()).toHaveLength(0);
    list.destroy?.();
  });
});


it("virtual row destruction releases For item owners and shared list subscriptions", () => {
  const shared = ref(0);
  const children = ref([{ id: 1 }, { id: 2 }]);
  const unmount = vi.fn();
  const list = ListViewV2({ each: [], render: () => For({
    each: children, key: "id", render: () => View({ onUnmounted: unmount }, [computed(shared, value => value)]),
  }) });
  const row = list.renderItem(ref({}), ref(0))!;
  row.destroy?.();
  row.destroy?.();
  expect(shared.getDeps()).toHaveLength(0);
  expect(children.getDeps()).toHaveLength(0);
  expect(unmount).toHaveBeenCalledTimes(2);
  list.destroy?.();
});
