import { describe, expect, it, vi } from "vitest";

import { WindowModel } from "@/window";

describe("WindowModel", () => {
  it("应包含 header、body、footer 的布局状态", () => {
    const win = WindowModel({
      title: "Console",
      position: { x: 10, y: 20 },
      size: { width: 400, height: 300 },
      headerHeight: 44,
      footerHeight: 36,
    });

    expect(win.state.header.role).toBe("header");
    expect(win.state.header.title).toBe("Console");
    expect(win.state.header.rect).toEqual({
      x: 10,
      y: 20,
      width: 400,
      height: 44,
    });
    expect(win.state.body.role).toBe("body");
    expect(win.state.body.rect).toEqual({
      x: 10,
      y: 64,
      width: 400,
      height: 220,
    });
    expect(win.state.footer.role).toBe("footer");
    expect(win.state.footer.rect).toEqual({
      x: 10,
      y: 284,
      width: 400,
      height: 36,
    });
  });

  it("拖拽 header 应改变 window 位置", () => {
    const win = WindowModel({
      position: { x: 100, y: 80 },
      size: { width: 320, height: 240 },
    });

    win.methods.pointerDownHeader(10, 10);
    expect(win.state.dragging).toBe(true);
    expect(win.state.header.dragging).toBe(true);

    win.methods.pointerMoveHeader(50, 70);
    expect(win.state.position).toEqual({ x: 140, y: 140 });
    expect(win.state.rect).toEqual({
      x: 140,
      y: 140,
      width: 320,
      height: 240,
    });

    win.methods.pointerUpHeader(50, 70);
    expect(win.state.dragging).toBe(false);
    expect(win.state.header.dragging).toBe(false);
  });

  it("拖拽右边缘应改变宽度且不改变位置", () => {
    const win = WindowModel({
      position: { x: 20, y: 30 },
      size: { width: 300, height: 200 },
    });

    win.methods.pointerDownResize("right", 320, 120);
    expect(win.state.resizing).toBe(true);
    expect(win.state.resizeEdge).toBe("right");

    win.methods.pointerMoveResize(380, 120);
    expect(win.state.position).toEqual({ x: 20, y: 30 });
    expect(win.state.size).toEqual({ width: 360, height: 200 });

    win.methods.pointerUpResize(380, 120);
    expect(win.state.resizing).toBe(false);
    expect(win.state.resizeEdge).toBe(null);
  });

  it("拖拽下边缘应改变高度且不改变位置", () => {
    const win = WindowModel({
      position: { x: 20, y: 30 },
      size: { width: 300, height: 200 },
    });

    win.methods.pointerDownResize("bottom", 120, 230);
    win.methods.pointerMoveResize(120, 290);

    expect(win.state.position).toEqual({ x: 20, y: 30 });
    expect(win.state.size).toEqual({ width: 300, height: 260 });
  });

  it("拖拽左边缘应同步改变 x 和宽度", () => {
    const win = WindowModel({
      position: { x: 100, y: 30 },
      size: { width: 300, height: 200 },
    });

    win.methods.pointerDownResize("left", 100, 120);
    win.methods.pointerMoveResize(140, 120);

    expect(win.state.position).toEqual({ x: 140, y: 30 });
    expect(win.state.size).toEqual({ width: 260, height: 200 });
  });

  it("拖拽上边缘应同步改变 y 和高度", () => {
    const win = WindowModel({
      position: { x: 100, y: 80 },
      size: { width: 300, height: 200 },
    });

    win.methods.pointerDownResize("top", 180, 80);
    win.methods.pointerMoveResize(180, 110);

    expect(win.state.position).toEqual({ x: 100, y: 110 });
    expect(win.state.size).toEqual({ width: 300, height: 170 });
  });

  it("拖拽左上角遇到最小尺寸时应保持右下角不动", () => {
    const win = WindowModel({
      position: { x: 100, y: 80 },
      size: { width: 300, height: 200 },
      minSize: { width: 180, height: 120 },
    });

    win.methods.pointerDownResize("top-left", 100, 80);
    win.methods.pointerMoveResize(280, 220);

    expect(win.state.position).toEqual({ x: 220, y: 160 });
    expect(win.state.size).toEqual({ width: 180, height: 120 });
    expect(win.state.rect.x + win.state.rect.width).toBe(400);
    expect(win.state.rect.y + win.state.rect.height).toBe(280);
  });

  it("拖拽时应触发位置和尺寸事件", () => {
    const win = WindowModel({
      position: { x: 0, y: 0 },
      size: { width: 200, height: 160 },
    });
    const positionHandler = vi.fn();
    const sizeHandler = vi.fn();
    win.onPositionChange(positionHandler);
    win.onSizeChange(sizeHandler);

    win.methods.pointerDownHeader(0, 0);
    win.methods.pointerMoveHeader(20, 30);
    win.methods.pointerUpHeader(20, 30);
    win.methods.pointerDownResize("right", 200, 0);
    win.methods.pointerMoveResize(240, 0);

    expect(positionHandler).toHaveBeenCalledWith({ x: 20, y: 30 });
    expect(sizeHandler).toHaveBeenCalledWith({ width: 240, height: 160 });
  });
});
