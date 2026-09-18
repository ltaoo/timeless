import { describe, expect, it, vi } from "vitest";

import { WindowManager } from "@/window";

describe("WindowManager", () => {
  it("open 追加窗口并按列表顺序给出 z 与 activeId", () => {
    const windows = new WindowManager();
    const opened = windows.open("a", { x: 10, y: 20 });

    expect(opened).toEqual({
      id: "a",
      position: { x: 10, y: 20 },
      z: 240,
    });
    expect(windows.size).toBe(1);
    expect(windows.activeId).toBe("a");
    expect(windows.state).toEqual({
      windows: [{ id: "a", position: { x: 10, y: 20 }, z: 240 }],
      activeId: "a",
    });

    windows.open("b", { x: 30, y: 40 });
    expect(windows.state.windows.map((item) => item.id)).toEqual(["a", "b"]);
    expect(windows.zIndexOf("a")).toBe(240);
    expect(windows.zIndexOf("b")).toBe(241);
    expect(windows.activeId).toBe("b");
  });

  it("已存在的 id 再次 open 只聚焦，位置与 z 之外的层级不动", () => {
    const windows = new WindowManager();
    windows.open("a", { x: 10, y: 20 });
    windows.open("b", { x: 30, y: 40 });

    const again = windows.open("a", { x: 999, y: 999 });

    expect(again.position).toEqual({ x: 10, y: 20 });
    expect(windows.size).toBe(2);
    expect(windows.positionOf("a")).toEqual({ x: 10, y: 20 });
    expect(windows.zIndexOf("a")).toBe(241);
    expect(windows.zIndexOf("b")).toBe(240);
    expect(windows.activeId).toBe("a");
  });

  it("focus 移到栈顶并更新 activeId", () => {
    const windows = new WindowManager();
    windows.open("a", { x: 0, y: 0 });
    windows.open("b", { x: 0, y: 0 });

    expect(windows.focus("a")).toBe(true);
    expect(windows.activeId).toBe("a");
    expect(windows.zIndexOf("a")).toBe(241);
    expect(windows.zIndexOf("b")).toBe(240);
    expect(windows.state.windows.map((item) => item.id)).toEqual(["b", "a"]);

    expect(windows.focus("missing")).toBe(false);
    expect(windows.activeId).toBe("a");
  });

  it("close 后 activeId 变为新的栈顶，栈空为 \"\"", () => {
    const windows = new WindowManager();
    windows.open("a", { x: 0, y: 0 });
    windows.open("b", { x: 0, y: 0 });

    expect(windows.close("b")).toBe(true);
    expect(windows.activeId).toBe("a");
    expect(windows.zIndexOf("a")).toBe(240);

    expect(windows.close("a")).toBe(true);
    expect(windows.activeId).toBe("");
    expect(windows.size).toBe(0);
    expect(windows.close("a")).toBe(false);
  });

  it("closeAll 清空所有窗口", () => {
    const windows = new WindowManager();
    windows.open("a", { x: 0, y: 0 });
    windows.open("b", { x: 0, y: 0 });

    windows.closeAll();

    expect(windows.size).toBe(0);
    expect(windows.activeId).toBe("");
    expect(windows.state.windows).toEqual([]);
    expect(windows.has("a")).toBe(false);
  });

  it("moveTo 只改位置，不动层级", () => {
    const windows = new WindowManager();
    windows.open("a", { x: 0, y: 0 });
    windows.open("b", { x: 0, y: 0 });

    expect(windows.moveTo("a", { x: 50, y: 60 })).toBe(true);
    expect(windows.positionOf("a")).toEqual({ x: 50, y: 60 });
    expect(windows.state.windows.map((item) => item.id)).toEqual(["a", "b"]);
    expect(windows.zIndexOf("a")).toBe(240);
    expect(windows.zIndexOf("b")).toBe(241);
    expect(windows.activeId).toBe("b");

    expect(windows.moveTo("a", { x: 50, y: 60 })).toBe(false);
    expect(windows.moveTo("missing", { x: 1, y: 1 })).toBe(false);
  });

  it("has / zIndexOf / positionOf 对未知 id 给出稳定结果", () => {
    const windows = new WindowManager();
    windows.open("a", { x: 4, y: 5 });

    expect(windows.has("a")).toBe(true);
    expect(windows.has("b")).toBe(false);
    expect(windows.zIndexOf("a")).toBe(240);
    expect(windows.zIndexOf("b")).toBe(-1);
    expect(windows.positionOf("a")).toEqual({ x: 4, y: 5 });
    expect(windows.positionOf("b")).toEqual({ x: 0, y: 0 });
  });

  it("支持自定义 baseZ / stepZ", () => {
    const windows = new WindowManager({ baseZ: 300, stepZ: 10 });
    windows.open("a", { x: 0, y: 0 });
    windows.open("b", { x: 0, y: 0 });

    expect(windows.zIndexOf("a")).toBe(300);
    expect(windows.zIndexOf("b")).toBe(310);
  });

  it("emit 前已改内部状态，订阅方可读到最新位置", () => {
    const windows = new WindowManager();
    const seen: { x: number; y: number }[] = [];
    windows.onStateChange(() => {
      seen.push(windows.positionOf("a"));
    });

    windows.open("a", { x: 5, y: 6 });
    windows.moveTo("a", { x: 7, y: 8 });

    expect(seen).toEqual([
      { x: 5, y: 6 },
      { x: 7, y: 8 },
    ]);
  });

  it("三个事件的 payload 各自正确", () => {
    const windows = new WindowManager();
    const on_state = vi.fn();
    const on_windows = vi.fn();
    const on_active = vi.fn();
    windows.onStateChange(on_state);
    windows.onWindowsChange(on_windows);
    windows.onActiveChange(on_active);

    windows.open("a", { x: 1, y: 2 });
    expect(on_windows).toHaveBeenLastCalledWith({ opened: ["a"], closed: [] });
    expect(on_active).toHaveBeenLastCalledWith("a");
    expect(on_state).toHaveBeenLastCalledWith({
      windows: [{ id: "a", position: { x: 1, y: 2 }, z: 240 }],
      activeId: "a",
    });

    on_state.mockClear();
    on_windows.mockClear();
    on_active.mockClear();
    windows.focus("a");
    expect(on_state).not.toHaveBeenCalled();
    expect(on_windows).not.toHaveBeenCalled();
    expect(on_active).not.toHaveBeenCalled();

    windows.close("a");
    expect(on_windows).toHaveBeenLastCalledWith({ opened: [], closed: ["a"] });
    expect(on_active).toHaveBeenLastCalledWith("");
    expect(on_state).toHaveBeenLastCalledWith({ windows: [], activeId: "" });
  });

  it("closeAll 广播关闭的 id 列表", () => {
    const windows = new WindowManager();
    windows.open("a", { x: 0, y: 0 });
    windows.open("b", { x: 0, y: 0 });
    const on_windows = vi.fn();
    const on_active = vi.fn();
    windows.onWindowsChange(on_windows);
    windows.onActiveChange(on_active);

    windows.closeAll();

    expect(on_windows).toHaveBeenLastCalledWith({
      opened: [],
      closed: ["a", "b"],
    });
    expect(on_active).toHaveBeenLastCalledWith("");
  });
});
