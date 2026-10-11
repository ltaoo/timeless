import { afterEach, describe, expect, it, vi } from "vitest";
import { View } from "@timeless/timeless";
import { DOMView } from "@/host/view";

describe("DOMView tag", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("keeps View a div regardless of an untyped legacy tag", () => {
    const element = {
      nodeType: 1, style: { cssText: "" }, setAttribute: vi.fn(), removeAttribute: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), appendChild: vi.fn(),
    };
    const createElement = vi.fn(() => element);
    vi.stubGlobal("document", { createElement, createDocumentFragment: vi.fn(() => ({ appendChild: vi.fn() })) });
    DOMView({ build: vi.fn(), elm: View({ as: "dialog" } as any) }).render();
    expect(createElement).toHaveBeenCalledWith("div");
  });
});
