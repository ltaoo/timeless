import { describe, expect, it, vi } from "vitest";

import { View } from "@/content/view";
import { setPlatform } from "@/platform";

type Listeners = Record<string, ((event: any) => void)[]>;

function install_platform() {
  const listeners: Listeners = {};
  const addEventListener = vi.fn((type: string, handler: (event: any) => void) => {
    (listeners[type] ||= []).push(handler);
    return () => {
      listeners[type] = (listeners[type] || []).filter((fn) => fn !== handler);
    };
  });
  const patchBodyStyle = vi.fn();

  setPlatform({ addEventListener, patchBodyStyle } as any);

  return {
    addEventListener,
    patchBodyStyle,
    emit(type: string, event: any) {
      for (const handler of listeners[type] || []) handler(event);
    },
  };
}

describe("View pointer events", () => {
  it("reports down position, movement delta and direction", () => {
    const on_down = vi.fn();
    const on_move = vi.fn();
    const on_up = vi.fn();
    const platform = install_platform();

    const view = View({ onPointerDown: on_down, onPointerMove: on_move, onPointerUp: on_up });

    (view.events as any).onPointerDown({ clientX: 10, clientY: 20, pointerId: 7 });

    expect(on_down).toHaveBeenCalledTimes(1);
    expect(on_down.mock.calls[0][1]).toEqual({
      x: 10,
      y: 20,
      startX: 10,
      startY: 20,
      dx: 0,
      dy: 0,
      distance: 0,
      direction: "none",
      pressing: true,
      dragging: false,
      pointerId: 7,
    });

    platform.emit("pointermove", { clientX: 40, clientY: 20 });

    expect(on_move.mock.calls[0][1]).toMatchObject({
      x: 40,
      y: 20,
      dx: 30,
      dy: 0,
      distance: 30,
      direction: "right",
      pressing: true,
      dragging: true,
    });

    platform.emit("pointerup", { clientX: 40, clientY: 60 });

    expect(on_up.mock.calls[0][1]).toMatchObject({
      x: 40,
      y: 60,
      dx: 30,
      dy: 40,
      distance: 50,
      direction: "down",
      pressing: false,
      dragging: true,
    });
  });

  it("patches the body style while pressing and restores it on release", () => {
    const platform = install_platform();
    const view = View({ onPointerDown: () => {}, onPointerMove: () => {} });

    (view.events as any).onPointerDown({ clientX: 1, clientY: 1 });

    expect(platform.patchBodyStyle).toHaveBeenCalledWith({ userSelect: "none" });

    platform.emit("pointerup", { clientX: 2, clientY: 2 });

    expect(platform.patchBodyStyle).toHaveBeenLastCalledWith({ userSelect: "" });
  });

  it("ignores move and up before a down", () => {
    const on_move = vi.fn();
    const on_up = vi.fn();
    const platform = install_platform();

    View({ onPointerDown: () => {}, onPointerMove: on_move, onPointerUp: on_up });

    platform.emit("pointermove", { clientX: 5, clientY: 5 });
    platform.emit("pointerup", { clientX: 5, clientY: 5 });

    expect(on_move).not.toHaveBeenCalled();
    expect(on_up).not.toHaveBeenCalled();
  });

  it("does not attach global listeners for down-only consumers", () => {
    const on_down = vi.fn();
    const platform = install_platform();
    const view = View({ onPointerDown: on_down });

    (view.events as any).onPointerDown({ clientX: 1, clientY: 1 });
    (view.events as any).onPointerDown({ clientX: 2, clientY: 2 });

    expect(platform.addEventListener).not.toHaveBeenCalled();
    // 没有移动 / 抬起可跟踪时不保留按下会话，第二次按下仍需派发。
    expect(on_down).toHaveBeenCalledTimes(2);
    expect(on_down.mock.calls[1][1]).toMatchObject({
      x: 2,
      y: 2,
      startX: 2,
      startY: 2,
      dx: 0,
      dy: 0,
    });
  });

  it("ignores a second down while a press is active", () => {
    const on_down = vi.fn();
    const platform = install_platform();
    const view = View({ onPointerDown: on_down, onPointerMove: () => {} });

    (view.events as any).onPointerDown({ clientX: 1, clientY: 1 });
    (view.events as any).onPointerDown({ clientX: 2, clientY: 2 });

    expect(on_down).toHaveBeenCalledTimes(1);
    platform.emit("pointerup", { clientX: 2, clientY: 2 });

    (view.events as any).onPointerDown({ clientX: 3, clientY: 3 });

    expect(on_down).toHaveBeenCalledTimes(2);
  });

  it("keeps the native event as the first handler argument", () => {
    const on_down = vi.fn();
    const view = View({ onPointerDown: on_down, onPointerMove: () => {} });
    const event = { clientX: 3, clientY: 4 };

    (view.events as any).onPointerDown(event);

    expect(on_down.mock.calls[0][0]).toBe(event);
  });

  it("releases listeners on unmount", () => {
    const on_move = vi.fn();
    const platform = install_platform();
    const view = View({ onPointerDown: () => {}, onPointerMove: on_move });

    (view.events as any).onPointerDown({ clientX: 1, clientY: 1 });
    view.onUnmounted();
    platform.emit("pointermove", { clientX: 9, clientY: 9 });

    expect(on_move).not.toHaveBeenCalled();
  });
});
