import { describe, expect, it, vi } from "vitest";
import { Img } from "@/content/img";

describe("Img events", () => {
  it("forwards load and error handlers to the host event table", () => {
    const on_load = vi.fn();
    const on_error = vi.fn();
    const image = Img({
      src: "/cover.jpg",
      onLoad: on_load,
      onError: on_error,
    });

    expect((image.events as any).onLoad).toBe(on_load);
    expect((image.events as any).onError).toBe(on_error);
  });
});
