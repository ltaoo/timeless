import { afterEach, describe, expect, it, vi } from "vitest";
import { Form, ui, vm } from "@timeless/timeless";
import { DOMForm } from "@/host/form";
import { DOMInput } from "@/host/input";
class FakeElement extends EventTarget {
  nodeType = 1;
  style = { cssText: "" };
  childNodes = [];
  attributes: Record<string, string> = {};
  value = "";
  setAttribute(name: string, value: string) { this.attributes[name] = String(value); }
  removeAttribute(name: string) { delete this.attributes[name]; }
  appendChild() {}
}
describe("native authentication controls", () => {
  afterEach(() => vi.unstubAllGlobals());
  it.each(["render", "hydrate"])("dispatches submit/reset once and removes listeners after %s", mode => {
    const element = new FakeElement();
    const createElement = vi.fn(() => element);
    vi.stubGlobal("document", { createElement, createDocumentFragment: () => ({ appendChild() {} }) });
    const onSubmit = vi.fn(event => event.preventDefault()), onReset = vi.fn();
    const form = Form({ onSubmit, onReset });
    const host = DOMForm({ build: vi.fn(), elm: form });
    if (mode === "render") { host.render(); expect(createElement).toHaveBeenCalledWith("form"); }
    else host.hydrate(form, element as any);
    const event = new Event("submit", { cancelable: true });
    element.dispatchEvent(event); element.dispatchEvent(new Event("reset"));
    expect(event.defaultPrevented).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(1); expect(onReset).toHaveBeenCalledTimes(1);
    host.teardownEventListener(form.events);
    element.dispatchEvent(new Event("submit")); element.dispatchEvent(new Event("reset"));
    expect(onSubmit).toHaveBeenCalledTimes(1); expect(onReset).toHaveBeenCalledTimes(1);
  });
  it.each(["username", "current-password", "new-password"])("preserves %s from the first render before mounting", autocomplete => {
    const element = new FakeElement();
    vi.stubGlobal("document", { createElement: () => element });
    const store = new vm.InputCore({ type: autocomplete === "username" ? "email" : "password" });
    const input = ui.InputPrimitive.Input({ store, attributes: { autocomplete, name: "password" } });
    const host = DOMInput({ build: vi.fn(), elm: input });
    host.render();
    expect(element.attributes.autocomplete).toBe(autocomplete);
    expect(element.attributes.type).toBe(autocomplete === "username" ? "email" : "password");
    input.onUnmounted();
  });
  it("serializes legacy boolean autocomplete as valid on/off tokens", () => {
    const element = new FakeElement();
    vi.stubGlobal("document", { createElement: () => element });
    const input = ui.InputPrimitive.Input({ store: new vm.InputCore({}) });
    for (const enabled of [false, true]) {
      input.state.autoComplete = enabled;
      DOMInput({ build: vi.fn(), elm: input }).render();
      expect(element.attributes.autocomplete).toBe(enabled ? "on" : "off");
    }
    input.onUnmounted();
  });
  it("initializes passwords, toggles their types without altering values and cleans up subscriptions", () => {
    const element = new FakeElement();
    vi.stubGlobal("document", { createElement: () => element });
    const store = new vm.InputCore({ type: "password", defaultValue: "secret" });
    const input = ui.InputPrimitive.Input({ store });
    const host = DOMInput({ build: vi.fn(), elm: input });
    input.$elm = host; host.render(); input.onMounted({ target: host });
    expect(element.attributes.type).toBe("password");
    store.showText(); expect(element.attributes.type).toBe("text");
    store.hideText(); expect(element.attributes.type).toBe("password");
    expect(element.value).toBe("secret");
    input.onUnmounted(); store.showText();
    expect(element.attributes.type).toBe("password");
  });
});
