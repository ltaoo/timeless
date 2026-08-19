import { ref } from "@timeless/inner-reactive";
import { describe, expect, it, vi } from "vitest";

import { Cascader } from "@/input/cascader";
import { Checkbox } from "@/input/checkbox";
import { DatePicker } from "@/input/date-picker";
import { DateRangePicker } from "@/input/date-range-picker";
import { DateTimePicker } from "@/input/date-time-picker";
import { FilePicker } from "@/input/file-picker";
import { Input } from "@/input/input";
import { NumberInput } from "@/input/number-input";
import { Radio } from "@/input/radio";
import { SearchSelect } from "@/input/search-select";
import { Select } from "@/input/select";
import { Switch } from "@/input/switch";
import { Textarea } from "@/input/textarea";
import { TimePicker } from "@/input/time-picker";
import { TreeSelect } from "@/input/tree-select";
import { Link } from "@/interaction/link";

function mock_host() {
  return {
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
  };
}

describe("native input disabled", () => {
  const factories = [
    (disabled: ReturnType<typeof ref<boolean>>) => Input({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => Textarea({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => Checkbox({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => Radio({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => Switch({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => NumberInput({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) =>
      Select({ disabled, options: [] }),
    (disabled: ReturnType<typeof ref<boolean>>) => FilePicker({ disabled }),
  ];

  it.each(factories)("updates and removes the native attribute", (factory) => {
    const disabled_ = ref(false);
    const host = mock_host();
    const element = factory(disabled_);
    element.$elm = host as any;

    disabled_.as(true);

    expect(element.state.disabled).toBe(true);
    expect(host.setAttribute).toHaveBeenCalledWith("disabled", "");

    disabled_.as(false);

    expect(element.state.disabled).toBe(false);
    expect(host.removeAttribute).toHaveBeenCalledWith("disabled");
  });

  it("stores static disabled as a boolean attribute", () => {
    const elements = [
      Input({ disabled: true }),
      Checkbox({ disabled: true }),
      Radio({ disabled: true }),
      Switch({ disabled: true }),
      NumberInput({ disabled: true }),
      Select({ disabled: true, options: [] }),
      FilePicker({ disabled: true }),
    ];

    for (const element of elements) {
      expect(element.state.disabled).toBe(true);
      expect(element.state.attributes.disabled).toBe("");
    }
    expect(Textarea({ disabled: true }).state.disabled).toBe(true);
  });
});

describe("Link disabled", () => {
  it("removes href, exposes aria-disabled, and blocks click handlers", () => {
    const disabled_ = ref(false);
    const on_click = vi.fn();
    const link = Link({
      href: "/settings",
      disabled: disabled_,
      onClick: on_click,
    });
    const host = mock_host();
    link.$elm = host as any;

    disabled_.as(true);

    expect(link.state.disabled).toBe(true);
    expect(link.state.attributes["aria-disabled"]).toBe("true");
    expect(host.removeAttribute).toHaveBeenCalledWith("href");

    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;
    link.events.onClick?.(event);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(on_click).not.toHaveBeenCalled();

    disabled_.as(false);

    expect(link.state.attributes["aria-disabled"]).toBeUndefined();
    expect(host.setAttribute).toHaveBeenCalledWith("href", "/settings");
  });
});

describe("composite input disabled", () => {
  const factories = [
    (disabled: ReturnType<typeof ref<boolean>>) => Cascader({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => DatePicker({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) =>
      DateRangePicker({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => DateTimePicker({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => TimePicker({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => SearchSelect({ disabled }),
    (disabled: ReturnType<typeof ref<boolean>>) => TreeSelect({ disabled }),
  ];

  it.each(factories)("toggles inert and aria-disabled", (factory) => {
    const disabled_ = ref(false);
    const host = mock_host();
    const element = factory(disabled_);
    element.$elm = host as any;

    disabled_.as(true);

    expect(element.state.disabled).toBe(true);
    expect(element.state.attributes.inert).toBe("");
    expect(element.state.attributes["aria-disabled"]).toBe("true");
    expect(host.setAttribute).toHaveBeenCalledWith("inert", "");
    expect(host.setAttribute).toHaveBeenCalledWith("aria-disabled", "true");

    disabled_.as(false);

    expect(element.state.disabled).toBe(false);
    expect(element.state.attributes.inert).toBeUndefined();
    expect(element.state.attributes["aria-disabled"]).toBeUndefined();
    expect(host.removeAttribute).toHaveBeenCalledWith("inert");
    expect(host.removeAttribute).toHaveBeenCalledWith("aria-disabled");
  });
});
