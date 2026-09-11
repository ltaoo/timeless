import { SplitView, View } from "@timeless/timeless";
import { describe, expect, it } from "vitest";

import { buildAndRender } from "@/renderer";

describe("NativeSplitView", () => {
  it("renders only panes and preserves fixed/auto sizes", () => {
    const split = SplitView({
      direction: "horizontal",
      panels: [
        { size: 280, style: {}, content: View({}, ["Sidebar"]) },
        { size: "auto", style: {}, content: View({}, ["Content"]) },
      ],
    });

    const { dom } = buildAndRender(split);

    expect(dom.defaultSizes).toEqual([280, 0]);
    expect(dom.children.map((child: any) => child.type)).toEqual([
      "split-pane",
      "split-pane",
    ]);
    expect(dom.children[1].style.flex).toBe("1");
  });
});
