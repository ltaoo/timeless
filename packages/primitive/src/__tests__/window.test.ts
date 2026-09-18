import { describe, expect, it, vi } from "vitest";
import { ref } from "@timeless/inner-reactive";

import { Window } from "@/layout/window";

function child_at(elm: any, index: number) {
  return elm.state.children[index];
}

describe("Window", () => {
  it("roots at a fixed-position view derived from x/y", () => {
    const window$ = Window({ title: "执行日志", x: 24, y: 24 });

    expect(window$.t).toBe("view");
    expect(window$.state.style.position).toBe("fixed");
    expect(window$.state.style.width).toBe("420px");
    expect(window$.state.style.height).toBe("auto");
    expect(window$.state.style["z-index"]).toBe(240);
    expect(window$.state.style.left).toBe("24px");
    expect(window$.state.style.top).toBe("24px");
  });

  it("uses custom position and size", () => {
    const window$ = Window({ title: "t", x: 120, y: 80, width: 320, height: 400 });

    expect(window$.state.style.left).toBe("120px");
    expect(window$.state.style.top).toBe("80px");
    expect(window$.state.style.width).toBe("320px");
    expect(window$.state.style.height).toBe("400px");
  });

  it("passes css size strings through and falls back on invalid numbers", () => {
    const sized$ = Window({ title: "t", width: "100%", height: "60vh" });
    expect(sized$.state.style.width).toBe("100%");
    expect(sized$.state.style.height).toBe("60vh");

    const fallback$ = Window({ title: "t", width: NaN, height: "" });
    expect(fallback$.state.style.width).toBe("420px");
    expect(fallback$.state.style.height).toBe("auto");
  });

  it("reports the current position", () => {
    const window$ = Window({ title: "t", x: 12, y: 34 });

    expect(window$.methods.getPosition()).toEqual({ x: 12, y: 34 });
  });

  it("moves by the pointer delta between beginDrag and dragTo", () => {
    const on_position_change = vi.fn();
    const window$ = Window({
      title: "t",
      x: 24,
      y: 24,
      onPositionChange: on_position_change,
    });

    window$.methods.beginDrag(10, 10);
    window$.methods.dragTo(40, 30);
    window$.methods.endDrag();

    expect(window$.methods.getPosition()).toEqual({ x: 54, y: 44 });
    expect(on_position_change).toHaveBeenCalledWith({ x: 54, y: 44 });
    expect(window$.state.style.left).toBe("54px");
    expect(window$.state.style.top).toBe("44px");
  });

  it("ignores dragTo before beginDrag", () => {
    const window$ = Window({ title: "t", x: 10, y: 10 });

    expect(window$.methods.dragTo(90, 90)).toBeNull();
    expect(window$.methods.getPosition()).toEqual({ x: 10, y: 10 });
  });

  it("ignores invalid positions", () => {
    const window$ = Window({ title: "t" });

    expect(window$.methods.setPosition({ x: NaN, y: 1 })).toBeNull();
    expect(window$.methods.setPosition(null)).toBeNull();
    expect(window$.methods.getPosition()).toEqual({ x: 24, y: 24 });
  });

  it("renders the title in the header", () => {
    const window$ = Window({ title: "节点 A · 执行日志" });
    const header = child_at(window$, 0);
    const title = child_at(header, 0);

    expect(header.state.styleSet).toContain("timeless-window__header");
    expect(child_at(title, 0).state.value).toBe("节点 A · 执行日志");
  });

  it("renders a close button only when onClose is provided", () => {
    const without_close = Window({ title: "t" });
    const with_close = Window({ title: "t", onClose: () => {} });

    const header_without = child_at(without_close, 0);
    const header_with = child_at(with_close, 0);

    expect(header_without.state.children.length).toBe(1);
    expect(header_with.state.children.length).toBe(2);

    const close = child_at(header_with, 1);
    expect(close.state.attributes.role).toBe("button");
    expect(close.state.attributes["aria-label"]).toBe("关闭");
  });

  it("calls onClose when the close button is clicked", () => {
    const on_close = vi.fn();
    const window$ = Window({ title: "t", onClose: on_close });
    const close = child_at(child_at(window$, 0), 1);

    close.events.onClick({ stopPropagation() {} });

    expect(on_close).toHaveBeenCalledTimes(1);
  });

  it("shows the body children", () => {
    const window$ = Window({ title: "t" }, "body content");
    const body = child_at(window$, 1);

    expect(body.state.styleSet).toContain("timeless-window__body");
    expect(child_at(body, 0).state.value).toBe("body content");
  });

  it("defaults z-index to 240 and honors a zIndex ref", () => {
    const fallback$ = Window({ title: "t" });
    expect(fallback$.state.style["z-index"]).toBe(240);

    const z$ = ref(300);
    const window$ = Window({ title: "t", zIndex: z$ });
    expect(window$.state.style["z-index"]).toBe(300);

    z$.as(312);
    expect(window$.state.style["z-index"]).toBe(312);
  });

  it("calls onActivate on root pointerdown without dropping the caller callback", () => {
    const on_activate = vi.fn();
    const on_pointer_down = vi.fn();
    const window$ = Window({
      title: "t",
      onActivate: on_activate,
      onPointerDown: on_pointer_down,
    });

    window$.events.onPointerDown({});

    expect(on_pointer_down).toHaveBeenCalledTimes(1);
    expect(on_activate).toHaveBeenCalledTimes(1);
  });

  it("calls onDragFinish after endDrag with the final position", () => {
    const on_drag_finish = vi.fn();
    const window$ = Window({
      title: "t",
      x: 24,
      y: 24,
      onDragFinish: on_drag_finish,
    });

    window$.methods.beginDrag(10, 10);
    window$.methods.dragTo(40, 30);
    window$.methods.endDrag();

    expect(on_drag_finish).toHaveBeenCalledTimes(1);
    expect(on_drag_finish).toHaveBeenCalledWith({ x: 54, y: 44 });
  });

  it("does not call onDragFinish when endDrag runs without pressing", () => {
    const on_drag_finish = vi.fn();
    const window$ = Window({ title: "t", onDragFinish: on_drag_finish });

    window$.methods.endDrag();

    expect(on_drag_finish).not.toHaveBeenCalled();
  });
});
