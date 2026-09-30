import { describe, expect, it, vi } from "vitest";
import { GalleryCore } from "@/gallery";

describe("GalleryCore", () => {
  const items = [{ src: "a.jpg" }, { src: "b.jpg" }, { src: "c.jpg" }];
  it("opens the selected image and loops both ways", () => {
    const store = new GalleryCore({ items });
    const change = vi.fn();
    store.onStateChange(change);
    store.open(2);
    store.next();
    expect(store.state).toMatchObject({ open: true, index: 0 });
    store.previous();
    expect(store.state.index).toBe(2);
    store.close();
    expect(store.state.open).toBe(false);
    expect(change).toHaveBeenCalledTimes(4);
  });
  it("clamps indices, supports bounded navigation and empty galleries", () => {
    const store = new GalleryCore({ items, loop: false });
    store.open(Infinity);
    store.previous();
    expect(store.state.index).toBe(0);
    expect(store.state.can_previous).toBe(false);
    store.open(99);
    store.next();
    expect(store.state.can_next).toBe(false);
    store.setItems([]);
    store.open();
    expect(store.state).toMatchObject({ index: -1, current: null, open: false });
  });
  it("preserves the selected source on reorder and ignores stale image events", () => {
    const store = new GalleryCore({ items });
    store.open(1);
    store.setItems([items[1], items[0]]);
    expect(store.state.index).toBe(0);
    store.setStatus("b.jpg", "error");
    expect(store.state.status).toBe("error");
    store.setItems([{ src: "b.jpg", caption: "Updated" }, items[0]]);
    expect(store.state.status).toBe("error");
    store.setStatus("c.jpg", "loaded");
    expect(store.state.status).toBe("error");
    store.next();
    expect(store.state.status).toBe("loading");
  });
});
