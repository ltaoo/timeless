import { describe, expect, it, vi } from "vitest";

import { ListItemView } from "@/content/list-item-view";
import { View } from "@/content/view";

describe("ListItemView", () => {
  it("replaces retained children on rebind and clears them on unbind", () => {
    const first = View({}, ["first"]);
    const second = View({}, ["second"]);
    const removeChildren = vi.fn();
    const insertChildren = vi.fn();

    const slot = ListItemView(
      {
        uid: 1,
        top: 0,
        height: 20,
        payload: { id: 1 },
        bound: true,
      },
      [first],
    );

    slot.$elm = {
      setStyle: vi.fn(),
      removeChildren,
      insertChildren,
    };

    expect(slot.children).toEqual([first]);

    slot.rebind({
      uid: 2,
      top: 40,
      height: 24,
      payload: { id: 2 },
      child: second,
    });

    expect(removeChildren).toHaveBeenCalledTimes(1);
    expect(insertChildren).toHaveBeenCalledWith([second]);
    expect(slot.children).toEqual([second]);
    expect(slot.state.top).toBe(40);
    expect(slot.state.height).toBe(24);
    expect(slot.state.payload).toEqual({ id: 2 });

    slot.unbind();

    expect(removeChildren).toHaveBeenCalledTimes(2);
    expect(slot.children).toEqual([]);
    expect(slot.state.bound).toBe(false);
  });
});
