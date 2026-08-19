import { describe, expect, it, vi } from "vitest";
import { ref } from "@timeless/inner-reactive";

import { Select } from "@/input/select";

describe("Select class", () => {
  it("stores a static class in the element state", () => {
    const select = Select<{ label: string; value: string }>({
      class: "field compact",
      options: [],
    });

    expect(select.state.styleSet).toEqual(["field", "compact"]);
  });

  it("updates the mounted host when a reactive class changes", () => {
    const class_name = ref("field");
    const select = Select<{ label: string; value: string }>({
      class: class_name,
      options: [],
    });
    const set_style_set = vi.fn();

    select.$elm = { setStyleSet: set_style_set };
    class_name.set("field compact");

    expect(select.state.styleSet).toEqual(["field", "compact"]);
    expect(set_style_set).toHaveBeenCalledWith(["field", "compact"]);
  });
});
