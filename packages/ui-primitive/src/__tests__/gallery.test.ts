import { describe, expect, it, vi } from "vitest";
import { GalleryCore } from "@timeless/inner-vm";
import { Thumbnail, Preview } from "../modules/gallery";

describe("GalleryPrimitive", () => {
  it("opens through thumbnails and respects prevented clicks", () => {
    const item = { src: "a.jpg", alt: "First image" };
    const store = new GalleryCore({ items: [item] });
    const thumbnail = Thumbnail({ store, item, index: 0 });
    expect(thumbnail.state.attributes["aria-label"]).toBe("First image");
    thumbnail.events.onClick?.({ defaultPrevented: false } as MouseEvent);
    expect(store.state.open).toBe(true);
    store.close();
    thumbnail.events.onClick?.({ defaultPrevented: true } as MouseEvent);
    expect(store.state.open).toBe(false);
  });
  it("constructs without browser globals and navigates by keyboard", () => {
    const store = new GalleryCore({ items: [{ src: "a.jpg" }, { src: "b.jpg" }] });
    const preview = Preview({ store });
    expect(preview.state.as).toBe("dialog");
    const preventDefault = vi.fn();
    preview.events.onKeyDown?.({ key: "ArrowRight", preventDefault, defaultPrevented: false } as unknown as KeyboardEvent);
    expect(store.state.index).toBe(1);
    expect(preventDefault).toHaveBeenCalledOnce();
  });
});
