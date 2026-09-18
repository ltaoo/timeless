/**
 * 指针（鼠标 / 触摸 / 触控笔）位移追踪。
 *
 * 参考 kit 里的 CanvasPointer：按下时记录起点，移动时给出相对起点的
 * 位移（dx / dy）、距离与方向，抬起后结束。View 的 onPointerDown /
 * onPointerMove / onPointerUp 由它统一派发。
 */
import { PointerDirection, PointerInfo } from "@/event";
import { getPlatform } from "@/platform";

export type PointerHandlers = {
  onPointerDown?: (event: PointerEvent, info: PointerInfo) => void;
  onPointerMove?: (event: PointerEvent, info: PointerInfo) => void;
  onPointerUp?: (event: PointerEvent, info: PointerInfo) => void;
};

/** 按位移的主导轴给出四向方向 */
export function pointer_direction(dx: number, dy: number): PointerDirection {
  if (dx === 0 && dy === 0) return "none";
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

function pointer_position(event: any) {
  return {
    x: Number(event?.clientX ?? event?.x ?? 0),
    y: Number(event?.clientY ?? event?.y ?? 0),
  };
}

/**
 * 创建指针追踪器。
 *
 * - `handleDown(event)` 由元素自身的 pointerdown 触发；
 * - 仅在存在 onPointerMove / onPointerUp 时才挂全局监听（拖动可移出元素）；
 * - `dispose()` 释放全局监听并还原 body 样式。
 */
export function createPointerTracker(handlers: PointerHandlers) {
  let pressing = false;
  let start_x = 0;
  let start_y = 0;
  let pointer_id = -1;
  let body_patched = false;
  let cleanups: (() => void)[] = [];

  function build_info(x: number, y: number, is_pressing = pressing): PointerInfo {
    const dx = x - start_x;
    const dy = y - start_y;
    return {
      x,
      y,
      startX: start_x,
      startY: start_y,
      dx,
      dy,
      distance: Math.round(Math.hypot(dx, dy) * 100) / 100,
      direction: pointer_direction(dx, dy),
      pressing: is_pressing,
      dragging: dx !== 0 || dy !== 0,
      pointerId: pointer_id,
    };
  }

  function detach() {
    pressing = false;
    pointer_id = -1;
    const fns = cleanups;
    cleanups = [];
    for (let i = 0; i < fns.length; i += 1) fns[i]();
    if (body_patched) {
      body_patched = false;
      getPlatform().patchBodyStyle({ userSelect: "" });
    }
  }

  function handle_move(event: PointerEvent) {
    if (!pressing) return;
    const { x, y } = pointer_position(event);
    handlers.onPointerMove?.(event, build_info(x, y));
  }

  function handle_up(event: PointerEvent) {
    if (!pressing) return;
    const { x, y } = pointer_position(event);
    const info = build_info(x, y, false);
    detach();
    handlers.onPointerUp?.(event, info);
  }

  function handle_down(event: PointerEvent) {
    if (pressing) return;
    const { x, y } = pointer_position(event);
    pressing = true;
    start_x = x;
    start_y = y;
    pointer_id = Number(event?.pointerId ?? -1);
    const info = build_info(x, y);
    // 只有需要跟踪移动 / 抬起时才挂全局监听，形成一次「按下会话」。
    const track_move = Boolean(handlers.onPointerMove || handlers.onPointerUp);
    if (track_move) {
      const platform = getPlatform();
      cleanups = [
        platform.addEventListener("pointermove", handle_move as EventListener),
        platform.addEventListener("pointerup", handle_up as EventListener),
        platform.addEventListener("pointercancel", handle_up as EventListener),
      ];
      platform.patchBodyStyle({ userSelect: "none" });
      body_patched = true;
    }
    handlers.onPointerDown?.(event, info);
    // 仅监听按下时没有「会话」可言，立即收尾，保证下一次按下依然会派发。
    if (!track_move) detach();
    return info;
  }

  return {
    get pressing() {
      return pressing;
    },
    handleDown: handle_down,
    dispose: detach,
  };
}

export type PointerTracker = ReturnType<typeof createPointerTracker>;
