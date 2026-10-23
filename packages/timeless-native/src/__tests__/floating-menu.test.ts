import { afterEach, expect, it, vi } from "vitest";
import { Drawer, View, ref, vm } from "@timeless/timeless";
import { DropdownMenu } from "../../../shadcn/src/modules/dropdown-menu";
import { ContextMenu } from "../../../shadcn/src/modules/context-menu";
import { Button } from "../../../shadcn/src/modules/button";
import { buildAndRender } from "../renderer";

function all(node: any): any[] {
  return [node, ...(node.children ?? []).flatMap(all)];
}
function mount(view: any) {
  const { dom } = buildAndRender(view);
  view.onMounted({ target: view.$elm });
  return dom;
}
afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

it("opens real shadcn DropdownMenu with a host anchor and navigates enabled items", () => {
  vi.useFakeTimers();
  const selected = vi.fn();
  const store = new vm.DropdownMenuCore({
    trigger: "click",
    offsetX: 12,
    offsetY: 6,
    items: [
      new vm.MenuItemCore({ label: "Edit", onClick: selected }),
      new vm.MenuItemCore({ label: "Disabled", disabled: true }),
      new vm.MenuSeparatorCore(),
      new vm.MenuItemCore({ label: "Copy" }),
    ] as any,
  });
  const view = DropdownMenu({ store, attributes: { n: "dropdown" } }, [
    Button({ store: new vm.ButtonCore(), attributes: { n: "trigger" } }, [
      "Open",
    ]),
  ]);
  const dom = mount(view);
  const trigger = all(dom).find((node) => node.attrs?.n === "trigger");
  trigger._dispatchNativeEvent("pointerdown");
  vi.runAllTimers();
  const surface = all(dom).find((node) => node.type === "floating");
  expect(surface.open).toBe(true);
  expect(surface.attrs.role).toBe("menu");
  expect(surface.anchor).toBe(trigger);
  expect(surface.offset).toBe(10);
  expect(surface.crossOffset).toBe(12);
  expect(trigger.attrs["aria-expanded"]).toBe("true");
  const items = all(surface).filter((node) => node.attrs?.role === "menuitem");
  expect(items).toHaveLength(3);
  items[1]._dispatchNativeEvent("click");
  expect(selected).not.toHaveBeenCalled();
  items[0]._dispatchNativeEvent("keydown", { key: "Home" });
  expect(store.items[0].state.focused).toBe(true);
  items[0]._dispatchNativeEvent("keydown", { key: "ArrowDown" });
  expect(store.items[3].state.focused).toBe(true);
  items[2]._dispatchNativeEvent("keydown", { key: "ArrowDown" });
  expect(store.items[0].state.focused).toBe(true);
  items[0]._dispatchNativeEvent("click");
  expect(selected).toHaveBeenCalledOnce();
  surface.listeners.dismiss();
  vi.runAllTimers();
  expect(trigger.attrs["aria-expanded"]).toBe("false");
  expect(all(dom).some((node) => node.type === "floating")).toBe(false);
  trigger._dispatchNativeEvent("keydown", { key: "ArrowUp" });
  vi.runAllTimers();
  expect(store.menu.state.open).toBe(true);
  expect(store.items[3].state.focused).toBe(true);
  view.onUnmounted?.();
});

it("positions real shadcn ContextMenu at the pointer or keyboard target", () => {
  vi.useFakeTimers();
  const store = new vm.ContextMenuCore({
    items: [new vm.MenuItemCore({ label: "Copy" })],
  });
  const view = ContextMenu({ store }, [
    View({ attributes: { n: "target" } }, ["Target"]),
  ]);
  const dom = mount(view);
  const trigger = all(dom).find((node) => node.attrs?.n === "target");
  trigger._dispatchNativeEvent("contextmenu", { clientX: 140, clientY: 90 });
  vi.runAllTimers();
  let surface = all(dom).find((node) => node.type === "floating");
  expect(surface.anchor.getBoundingClientRect()).toMatchObject({
    x: 140,
    y: 90,
    width: 0,
    height: 0,
  });
  surface.listeners.dismiss();
  vi.runAllTimers();
  trigger._getBoundingClientRect = () => ({ left: 20, bottom: 80 });
  trigger._dispatchNativeEvent("keydown", { key: "F10", shiftKey: true });
  vi.runAllTimers();
  surface = all(dom).find((node) => node.type === "floating");
  expect(surface.anchor.getBoundingClientRect()).toMatchObject({
    x: 20,
    y: 80,
  });
  view.onUnmounted?.();
});

it("composes Drawer from the modal shape and synchronizes controlled visibility", () => {
  vi.useFakeTimers();
  for (const side of ["top", "right", "bottom", "left"] as const) {
    const open = ref(false);
    const close = vi.fn(() => open.as(false));
    const view = Drawer(
      {
        visible: open,
        side,
        onClose: close,
        attributes: { n: `drawer-${side}` },
      },
      ["Details"],
    );
    const dom = mount(view);
    expect(dom.type).toBe("floating");
    expect(dom.modal).toBe(true);
    expect(dom.drawerSide).toBe(side);
    expect(dom.open).toBe(false);
    open.as(true);
    expect(dom.open).toBe(true);
    dom.listeners.dismiss();
    expect(close).toHaveBeenCalledOnce();
    expect(dom.open).toBe(false);
    view.onUnmounted?.();
  }
});
