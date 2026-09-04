import { describe, expect, it } from "vitest";

import { createListViewV2Model, ListViewV2 } from "@/content/list-view-v2";

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
