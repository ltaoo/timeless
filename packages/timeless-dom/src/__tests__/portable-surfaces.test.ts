import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal, Canvas, Input, ref } from "@timeless/timeless";
import { DOMModal } from "@/host/modal";
import { DOMInput } from "@/host/input";
import { DOMCanvas } from "@/host/canvas";

class Element extends EventTarget {
  nodeType = 1;
  style = { cssText: "" };
  childNodes = [];
  open = false;
  setAttribute(_name?: string, _value?: string) {}
  removeAttribute() {}
  appendChild() {}
  showModal = vi.fn(() => {
    this.open = true;
  });
  show = vi.fn(() => {
    this.open = true;
  });
  close = vi.fn(() => {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  });
  getBoundingClientRect() {
    return { left: 0, right: 100, top: 0, bottom: 100 };
  }
}
afterEach(() => vi.unstubAllGlobals());
describe("portable surface hosts", () => {
  it("keeps native modal opening, Escape dismissal and cleanup inside the host", () => {
    const element = new Element();
    const createElement = vi.fn(() => element);
    vi.stubGlobal("document", {
      createElement,
      createDocumentFragment: () => ({ appendChild() {} }),
    });
    const open = ref(false),
      onClose = vi.fn(() => open.set(false));
    const modal = Modal({ open, onClose });
    const host = DOMModal({ build: vi.fn(), elm: modal });
    modal.$elm = host;
    host.render();
    modal.onMounted({ target: host });
    expect(createElement).toHaveBeenCalledWith("dialog");
    open.set(true);
    expect(element.showModal).toHaveBeenCalledOnce();
    const cancel = new Event("cancel", { cancelable: true });
    element.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    expect(element.open).toBe(false);
    open.set(true);
    modal.onUnmounted();
    const count = onClose.mock.calls.length;
    element.dispatchEvent(new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(count);
  });
  it("preserves an attribute-only control value without setting a dirty initial value", () => {
    let value = "",
      dirty = false;
    const element = new Element();
    Object.defineProperty(element, "value", {
      get: () => value,
      set(next) {
        dirty = true;
        value = next;
      },
    });
    element.setAttribute = (name: string, next: string) => {
      if (name === "value" && !dirty) value = next;
    };
    vi.stubGlobal("document", { createElement: () => element });
    const input = Input({
      attributes: { type: "radio", value: "selected-option" },
    });
    const host = DOMInput({ build: vi.fn(), elm: input });
    input.$elm = host;
    host.render();
    expect(value).toBe("selected-option");
    expect(dirty).toBe(false);
  });
  it("creates a drawing surface from Canvas without a primitive tag selector", () => {
    const createElement = vi.fn(() => new Element());
    vi.stubGlobal("document", {
      createElement,
      createDocumentFragment: () => ({ appendChild() {} }),
    });
    const canvas = Canvas({ attributes: { width: 512, height: 512 } });
    const host = DOMCanvas({ build: vi.fn(), elm: canvas });
    canvas.$elm = host;
    host.render();
    expect(createElement).toHaveBeenCalledWith("canvas");
    expect(canvas.state).not.toHaveProperty("tag");
  });
});
