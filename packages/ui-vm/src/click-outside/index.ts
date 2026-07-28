import { base, Handler, BizError } from "@timeless/inner-base";

enum Events {
  ClickOutside,
  Error,
}

type TheTypesOfEvents = {
  [Events.ClickOutside]: { x: number; y: number };
  [Events.Error]: BizError;
};

let idCounter = 0;

export function ClickOutsideModel(
  props: Partial<{
    /** 判断点击是否在目标元素外部的回调 */
    onOutside?: (event: { x: number; y: number }) => void;
  }> = {},
) {
  const instanceId = `click-outside-${++idCounter}`;
  const bus = base<TheTypesOfEvents>();
  const listeners: Array<() => void> = [];

  let _active = false;
  let _getTargetRect:
    | (() => { x: number; y: number; width: number; height: number })
    | null = null;

  /** 判断坐标是否在目标元素内 */
  function containsPoint(x: number, y: number): boolean {
    if (!_getTargetRect) return false;
    const rect = _getTargetRect();
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  }

  /** 处理 document 上的 pointerdown 事件 */
  function handlePointerDown(e: PointerEvent) {
    if (!_active) return;
    const { clientX: x, clientY: y } = e;
    if (!containsPoint(x, y)) {
      props.onOutside?.({ x, y });
      bus.emit(Events.ClickOutside, { x, y });
    }
  }

  const methods = {
    /**
     * 设置目标元素的矩形区域
     * 传入一个返回 {x, y, width, height} 的函数
     */
    setTargetRect(
      getRect: () => { x: number; y: number; width: number; height: number },
    ) {
      _getTargetRect = getRect;
    },

    /** 激活点击外部检测 */
    activate() {
      if (_active) return;
      _active = true;
      document.addEventListener("pointerdown", handlePointerDown, true);
      listeners.push(() => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
      });
    },

    /** 停止点击外部检测（保留目标引用，可再次 activate） */
    deactivate() {
      _active = false;
      while (listeners.length > 0) {
        listeners.pop()?.();
      }
    },
  };

  const ui = {};

  const state = {
    get active() {
      return _active;
    },
  };

  return {
    instanceId,
    methods,
    ui,
    state,
    ready() {},
    destroy() {
      methods.deactivate();
      bus.destroy();
    },
    onClickOutside(handler: Handler<TheTypesOfEvents[Events.ClickOutside]>) {
      return bus.on(Events.ClickOutside, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
  };
}
