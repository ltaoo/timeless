import { describe, expect, it, vi } from "vitest";
import { ref } from "@timeless/inner-reactive";

import { Circle, Line, Path, SVG } from "@/content/svg";

describe("SVG attributes", () => {
  it("stores SVG-specific props as DOM attributes", () => {
    const mounted = vi.fn();
    const chart = SVG({
      viewBox: "0 0 600 96",
      preserveAspectRatio: "none",
      role: "img",
      "aria-label": "Download speed",
      class: "chart",
      dataset: { task: "42" },
      onMounted: mounted,
    });

    expect(chart.state.attributes).toEqual({
      viewBox: "0 0 600 96",
      preserveAspectRatio: "none",
      role: "img",
      "aria-label": "Download speed",
    });
    expect(chart.state.styleSet).toEqual(["chart"]);
    expect(chart.state.dataset).toEqual({ task: "42" });
    expect(chart.state.attributes).not.toHaveProperty("onMounted");
  });

  it("stores geometry and presentation props for shape elements", () => {
    const line = Line({
      x1: 0,
      y1: 48,
      x2: 600,
      y2: 48,
      stroke: "currentColor",
      "stroke-width": 1,
    });
    const path = Path({
      d: "M0,90 L600,6",
      fill: "none",
      stroke: "#2563eb",
      "stroke-linecap": "round",
    });

    expect(line.state.attributes).toEqual({
      x1: 0,
      y1: 48,
      x2: 600,
      y2: 48,
      stroke: "currentColor",
      "stroke-width": 1,
    });
    expect(path.state.attributes).toEqual({
      d: "M0,90 L600,6",
      fill: "none",
      stroke: "#2563eb",
      "stroke-linecap": "round",
    });
  });

  it("updates a mounted DOM attribute when a reactive prop changes", () => {
    const d = ref("M0,90 L600,6");
    const path = Path({ d });
    const setAttribute = vi.fn();

    path.$elm = { setAttribute, removeAttribute: vi.fn() } as any;
    d.set("M0,80 L600,12");

    expect(path.state.attributes.d).toBe("M0,80 L600,12");
    expect(setAttribute).toHaveBeenCalledWith("d", "M0,80 L600,12");
  });

  it("merges `attributes` into actual element attributes for SVG root and shapes", () => {
    const chart = SVG({
      attributes: { width: "50", height: "50", viewBox: "0 0 50 50" },
      preserveAspectRatio: "none",
    });
    const circle = Circle({
      cx: 25,
      attributes: {
        cy: 25,
        r: 25,
        fill: "black",
      },
      stroke: "red",
    });

    expect(chart.state.attributes).toEqual({
      width: "50",
      height: "50",
      viewBox: "0 0 50 50",
      preserveAspectRatio: "none",
    });
    expect(circle.state.attributes).toEqual({
      cx: 25,
      cy: 25,
      r: 25,
      fill: "black",
      stroke: "red",
    });
    expect(chart.state.attributes).not.toHaveProperty("attributes");
    expect(circle.state.attributes).not.toHaveProperty("attributes");
  });
});
