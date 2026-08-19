import { ref } from "@timeless/inner-reactive";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/interaction/button";

describe("Button disabled", () => {
  it("maps a disabled prop to the native disabled attribute", () => {
    const enabled_button = Button({ disabled: false });
    const disabled_button = Button({ disabled: true });

    expect(enabled_button.state.disabled).toBe(false);
    expect(enabled_button.state.attributes.disabled).toBeUndefined();
    expect(disabled_button.state.disabled).toBe(true);
    expect(disabled_button.state.attributes.disabled).toBe("");
  });

  it("updates the native disabled attribute when a ref changes", () => {
    const disabled_ = ref(false);
    const set_attribute = vi.fn();
    const remove_attribute = vi.fn();
    const button = Button({ disabled: disabled_ });
    button.$elm = {
      setAttribute: set_attribute,
      removeAttribute: remove_attribute,
    } as any;

    disabled_.as(true);

    expect(button.state.disabled).toBe(true);
    expect(button.state.attributes.disabled).toBe("");
    expect(set_attribute).toHaveBeenCalledWith("disabled", "");

    disabled_.as(false);

    expect(button.state.disabled).toBe(false);
    expect(button.state.attributes.disabled).toBeUndefined();
    expect(remove_attribute).toHaveBeenCalledWith("disabled");
  });

  it("gives the disabled prop precedence over attributes.disabled", () => {
    const button = Button({
      disabled: false,
      attributes: { disabled: true, "aria-label": "Save" },
    });

    expect(button.state.attributes).toEqual({
      disabled: undefined,
      "aria-label": "Save",
    });
  });
});
