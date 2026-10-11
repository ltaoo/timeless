import { describe, expect, it, vi } from "vitest";
import { View } from "@/content/view";
import { Html } from "@/content/html";

describe("View form events", () => {
  it("forwards input, change and keyup handlers without requiring an Input component", () => {
    const onInput = vi.fn(), onChange = vi.fn(), onKeyUp = vi.fn();
    const view = Html.Input({ onInput, onChange, onKeyUp });
    expect(view.events.onInput).toBe(onInput);
    expect(view.events.onChange).toBe(onChange);
    expect(view.events.onKeyUp).toBe(onKeyUp);
  });
});
