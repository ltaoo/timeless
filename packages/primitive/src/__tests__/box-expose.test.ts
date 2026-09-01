import { describe, expect, it, vi } from "vitest";

import { Box } from "@/content/box";
import { Img } from "@/content/img";

describe("Box exposure event", () => {
  it("is inherited by Img", () => {
    const on_expose = vi.fn();
    const image = Img({ src: "/cover.jpg", onExpose: on_expose });

    expect(image.events?.onExpose).toBe(on_expose);
  });

  it("forwards onExpose through Box events", () => {
    const on_expose = vi.fn();
    const box = Box({ onExpose: on_expose }, {});

    box.methods.add_event();

    expect(box.events.onExpose).toBe(on_expose);
  });
});
