import { Button, Modal, Popover, Tooltip, View, ref } from "@timeless/timeless";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAndRender } from "../renderer";
import { registerNativeStyleSheet } from "../stylesheet";

function floating(node: any): any {
  if (node.type === "floating") return node;
  return node.children?.map(floating).find(Boolean);
}

afterEach(() => {
  if (vi.isFakeTimers()) vi.runOnlyPendingTimers();
  vi.useRealTimers();
  delete (globalThis as any).__nativeBridge_relayout;
  registerNativeStyleSheet("floating-test", []);
});

describe("native floating surfaces", () => {
  it("does not schedule page layout when Tooltip mounts or repeats the current visibility", () => {
    vi.useFakeTimers();
    const visible = ref(false);
    const tooltip = Tooltip({ visible, content: "Help" }, [Button({}, ["Trigger"])]);
    const { dom, vnode } = buildAndRender(tooltip);
    vi.runAllTimers();
    const relayout = vi.fn();
    (globalThis as any).__nativeBridge_relayout = relayout;
    tooltip.onMounted({ target: tooltip.$elm });
    vi.runAllTimers();
    expect(relayout).not.toHaveBeenCalled();
    visible.as(true);
    vi.runAllTimers();
    expect(floating(dom).open).toBe(true);
    expect(relayout).toHaveBeenCalledTimes(1);
    vnode.setVisible(true);
    vi.runAllTimers();
    expect(relayout).toHaveBeenCalledTimes(1);
    visible.as(false);
    vi.runAllTimers();
    expect(floating(dom).open).toBe(false);
    expect(relayout).toHaveBeenCalledTimes(2);
    tooltip.onUnmounted();
  });

  it("synchronizes Modal state, controlled dismissal and unmount cleanup", () => {
    const open = ref(false);
    const close = vi.fn(() => open.as(false));
    const modal = Modal({ open, onClose: close, attributes: { n: "editor" } }, [
      View({}, ["Editor"]),
    ]);
    const { dom } = buildAndRender(modal);
    modal.onMounted({ target: modal.$elm });
    expect(dom).toMatchObject({ type: "floating", kind: "modal", open: false });
    open.as(true);
    expect(dom.open).toBe(true);
    expect(dom.modal).toBe(true);
    dom.listeners.dismiss();
    expect(close).toHaveBeenCalledOnce();
    expect(open.value).toBe(false);
    open.as(true);
    modal.onUnmounted();
    expect(dom.open).toBe(false);
    expect(dom.listeners.dismiss).toBeUndefined();
    open.as(false);
    open.as(true);
    expect(dom.open).toBe(false);
  });

  it("keeps an anchored Popover separate from its trigger, with placement metadata", () => {
    const open = ref(false);
    const anchor = Button({ attributes: { n: "trigger" } }, ["Open"]);
    const popover = Popover({
      anchor,
      open,
      side: "right",
      align: "end",
      offset: 12,
    });
    const root = View({}, [anchor, popover]);
    const { dom } = buildAndRender(root);
    root.onMounted({ target: root.$elm });
    const popup = floating(dom);
    expect(popup.anchor).toBe(dom.children[0]);
    expect(popup).toMatchObject({
      kind: "popover",
      modal: false,
      side: "right",
      align: "end",
      offset: 12,
    });
    open.as(true);
    expect(popup.open).toBe(true);
    popup.listeners.dismiss();
    expect(popup.open).toBe(false);
    root.onUnmounted();
  });

  it("renders Tooltip content in a floating surface and leaves the trigger unstyled", () => {
    registerNativeStyleSheet("floating-test", [
      {
        classes: ["hint"],
        states: [],
        style: { "background-color": "#18181b", color: "#ffffff" },
      },
    ]);
    const visible = ref(false);
    const mounted = vi.fn();
    const unmounted = vi.fn();
    const tooltip = Tooltip(
      {
        visible,
        class: "hint",
        attributes: { n: "hint" },
        content: [
          View({ onMounted: mounted, onUnmounted: unmounted }, ["Help text"]),
        ],
        onClose: () => visible.as(false),
      },
      [Button({}, ["Trigger"])],
    );
    const { dom } = buildAndRender(tooltip);
    tooltip.onMounted({ target: tooltip.$elm });
    const popup = floating(dom);
    expect(popup).toMatchObject({ kind: "tooltip", modal: false, open: false });
    expect(popup.anchor).toBe(dom);
    expect(popup.style.color).toBe("#ffffff");
    expect(dom.style["background-color"]).toBeUndefined();
    expect(popup.children[0].children[0].children[0].value).toBe("Help text");
    expect(mounted).toHaveBeenCalledOnce();
    visible.as(true);
    expect(popup.open).toBe(true);
    popup.listeners.dismiss();
    expect(visible.value).toBe(false);
    visible.as(true);
    tooltip.$elm.removeChildren();
    tooltip.onUnmounted();
    expect(popup.open).toBe(false);
    expect(unmounted).toHaveBeenCalledOnce();
  });
});
