import { afterEach, describe, expect, it, vi } from "vitest";
import { View, Input } from "@timeless/timeless";
import { DOMView } from "@/host/view";
import { DOMInput } from "@/host/input";

class FakeElement extends EventTarget {
  nodeType = 1;
  style = { cssText: "" };
  childNodes = [];
  value = "";
  setAttribute() {}
  removeAttribute() {}
  appendChild() {}
}

describe("View native form events", () => {
  afterEach(() => vi.unstubAllGlobals());
  it.each(["render", "hydrate"])(
    "dispatches input/change exactly once and removes handlers after %s",
    (mode) => {
      const element = new FakeElement();
      vi.stubGlobal("document", {
        createElement: () => element,
        createDocumentFragment: () => ({ appendChild() {} }),
      });
      const onInput = vi.fn(),
        onChange = vi.fn(),
        onKeyUp = vi.fn();
      const view = View({ onInput, onChange, onKeyUp });
      const host = DOMView({ build: vi.fn(), elm: view });
      if (mode === "render") host.render();
      else host.hydrate(view, element as any);
      for (const type of ["input", "change", "keyup"])
        element.dispatchEvent(new Event(type));
      expect(onInput).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onKeyUp).toHaveBeenCalledTimes(1);
      host.teardownEventListener(view.events);
      for (const type of ["input", "change", "keyup"])
        element.dispatchEvent(new Event(type));
      expect(onInput).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onKeyUp).toHaveBeenCalledTimes(1);
      const replacement = { onInput: vi.fn() };
      host.setupEventListener(replacement);
      element.dispatchEvent(new Event("input"));
      expect(replacement.onInput).toHaveBeenCalledTimes(1);
      expect(onInput).toHaveBeenCalledTimes(1);
    },
  );
  it("Input retains single dispatch when using shared native listeners", () => {
    const element = new FakeElement();
    vi.stubGlobal("document", { createElement: () => element });
    const onInput = vi.fn();
    const input = Input({ onInput });
    const host = DOMInput({ build: vi.fn(), elm: input });
    host.render();
    element.dispatchEvent(new Event("input"));
    expect(onInput).toHaveBeenCalledTimes(1);
    host.teardownEventListener(input.events);
    element.dispatchEvent(new Event("input"));
    expect(onInput).toHaveBeenCalledTimes(1);
  });
});
