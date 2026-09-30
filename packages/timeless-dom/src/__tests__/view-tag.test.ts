import { afterEach, describe, expect, it, vi } from "vitest";
import { View } from "@timeless/timeless";
import { DOMView } from "@/host/view";

describe("DOMView tag", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("creates the declared dialog element", () => {
    const element = {
      nodeType: 1, style: { cssText: "" }, setAttribute: vi.fn(), removeAttribute: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), appendChild: vi.fn(),
    };
    const createElement = vi.fn(() => element);
    vi.stubGlobal("document", { createElement, createDocumentFragment: vi.fn(() => ({ appendChild: vi.fn() })) });
    DOMView({ build: vi.fn(), elm: View({ as: "dialog" }) }).render();
    expect(createElement).toHaveBeenCalledWith("dialog");
  });
});
