import { describe, expect, it } from "vitest";
import { SelectCore } from "@timeless/inner-vm";

import { PopperPositionContent } from "@/modules/select";

describe("SelectPrimitive item-aligned content", () => {
  it("constrains the content so its viewport can scroll", () => {
    const select = new SelectCore({ position: "item-aligned" });
    const content = PopperPositionContent(
      { store: select, style: { overflow: "hidden" } },
      [],
    );

    expect(content.children[0].state.style).toMatchObject({
      overflow: "hidden",
      "box-sizing": "border-box",
      "max-height": "100%",
      display: "flex",
      "flex-direction": "column",
    });
  });
});
