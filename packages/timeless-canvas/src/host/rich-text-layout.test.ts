import { describe, expect, it } from "vitest";
import { parseRichText } from "@timeless/timeless";
import { layoutRichText } from "./rich-text-layout";

const ctx = {
  save() {},
  restore() {},
  measureText(text: string) {
    return { width: Array.from(text).length * 8 };
  },
} as CanvasRenderingContext2D;

describe("canvas rich text layout", () => {
  it("wraps runs, preserves nested styles and uses link boxes from the same layout", () => {
    const doc = parseRichText(
      "**bold** text [link](#target)\n\n中文😀",
      "markdown",
    );
    const layout = layoutRichText(doc, 80, { "font-size": "16px" }, ctx);
    expect(layout.fragments.map((fragment) => fragment.text).join("")).toBe(
      doc.text.replace(/\n/g, ""),
    );
    expect(
      layout.fragments.find((fragment) => fragment.text === "bold")?.font,
    ).toContain("700 16px");
    expect(
      layout.fragments.find((fragment) => fragment.href === "#target")?.y,
    ).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(48);
    expect(layout.width).toBeLessThanOrEqual(80);
    expect(layoutRichText(doc, 400, {}, ctx).height).toBeLessThan(
      layout.height,
    );
  });

  it("keeps combining marks and joined emoji intact when breaking long words", () => {
    const doc = parseRichText("<p>éé👩‍💻é</p>");
    const layout = layoutRichText(doc, 20, {}, ctx);
    expect(layout.fragments.map((fragment) => fragment.text)).toContain("👩‍💻");
    expect(
      layout.fragments.every((fragment) => !fragment.text.startsWith("́")),
    ).toBe(true);
    expect(layoutRichText(parseRichText(""), 20, {}, ctx).height).toBe(0);
  });
});
