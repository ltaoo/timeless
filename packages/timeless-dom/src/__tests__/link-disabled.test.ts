import { describe, expect, it, vi } from "vitest";

import { DOMLink } from "@/host/link";

describe("DOMLink disabled", () => {
  it("does not render href while disabled", () => {
    const anchor = {
      nodeType: 1,
      style: {},
      href: "",
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      appendChild: vi.fn(),
      addEventListener: vi.fn(),
    };
    const fragment = {
      appendChild: vi.fn(),
    };
    vi.stubGlobal("document", {
      createElement: vi.fn(() => anchor),
      createDocumentFragment: vi.fn(() => fragment),
    });

    const link = DOMLink({
      build: vi.fn(),
      elm: {
        state: {
          href: "/settings",
          disabled: true,
          style: {},
          styleSet: [],
          attributes: { "aria-disabled": "true" },
          dataset: {},
        },
        children: [],
        events: {},
      } as any,
    });

    expect(link.render()).toBe(anchor);
    expect(anchor.href).toBe("");
    expect(anchor.setAttribute).toHaveBeenCalledWith("aria-disabled", "true");
  });
});
