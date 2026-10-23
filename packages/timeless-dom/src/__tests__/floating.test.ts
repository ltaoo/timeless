import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DOMModal } from "../host/modal";
import { DOMPopover } from "../host/popover";
import { DOMTooltip } from "../host/tooltip";

const hosts = vi.hoisted(() => ({ views: [] as any[] }));
vi.mock("../host/view", () => ({
  DOMView: () => {
    const node = hosts.views.shift();
    return { render: () => node, get$elm: () => node, removeChildren: () => { node.childNodes = []; } };
  },
}));

class Surface extends EventTarget {
  style = { display: "flex" } as CSSStyleDeclaration;
  childNodes: any[] = [];
  open = false;
  isConnected = true;
  focus = vi.fn();
  appendChild(node: any) { this.childNodes.push(node); }
  getBoundingClientRect() { return { left: 40, right: 140, top: 40, bottom: 80, width: 100, height: 40 }; }
  querySelector() { return { focus: this.focus }; }
  contains(node: unknown) { return node === this; }
  matches() { return this.open; }
  showModal() { expect(this.style.display).not.toBe("none"); this.open = true; }
  showPopover() { this.showModal(); }
  hidePopover() { this.open = false; }
  close() { this.open = false; this.dispatchEvent(new Event("close")); }
}

beforeEach(() => {
  hosts.views = [];
  vi.stubGlobal("document", Object.assign(new EventTarget(), {
    activeElement: new Surface(),
    createElement: () => new Surface(),
    createDocumentFragment: () => new Surface(),
  }));
  vi.stubGlobal("window", new EventTarget());
  vi.stubGlobal("innerWidth", 1000);
  vi.stubGlobal("innerHeight", 720);
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("keeps a flex Modal hidden while closed and restores display on reopen", () => {
  const host = DOMModal({ build: vi.fn(), elm: { state: {}, events: {}, children: [] } as any });
  const surface = host.render() as unknown as Surface;
  expect(surface.style.display).toBe("none");
  const unbind = host.bindDismiss();
  host.setOpen(true);
  expect(surface.open).toBe(true);
  expect(surface.style.display).toBe("flex");
  host.setOpen(false);
  expect(surface.style.display).toBe("none");
  host.setOpen(true);
  expect(surface.style.display).toBe("flex");
  unbind();
});

it("hides a flex Popover and dismisses it with Escape", () => {
  const surface = new Surface();
  hosts.views.push(surface);
  const host = DOMPopover({ build: vi.fn(), elm: { state: { anchor: () => new Surface(), crossOffset: 7 } } as any });
  host.render();
  expect(surface.style.display).toBe("none");
  const dismiss = vi.fn(() => host.setOpen(false));
  const unbind = host.bindDismiss(dismiss);
  host.setOpen(true);
  expect(surface.style.display).toBe("flex");
  expect(surface.focus).toHaveBeenCalledOnce();
  expect(surface.style.left).toBe("47px");
  expect(surface.style.top).toBe("88px");
  document.dispatchEvent(Object.assign(new Event("keydown", { cancelable: true }), { key: "Escape" }));
  expect(dismiss).toHaveBeenCalledOnce();
  expect(surface.open).toBe(false);
  expect(surface.style.display).toBe("none");
  unbind();
});

it("opens Tooltip content without taking focus and releases listeners on hide", () => {
  const trigger = new Surface();
  const surface = new Surface();
  hosts.views.push(trigger, surface);
  const host = DOMTooltip({ build: vi.fn(), elm: { state: { content: {}, attributes: { n: "hint" } }, children: [] } as any });
  const remove = vi.spyOn(document, "removeEventListener");
  expect(host.render().childNodes).toContain(surface);
  expect(surface.open).toBe(false);
  host.setVisible(true);
  expect(surface.open).toBe(true);
  expect(surface.focus).not.toHaveBeenCalled();
  host.setVisible(false);
  expect(remove).toHaveBeenCalledTimes(2);
  expect(surface.style.display).toBe("none");
});
