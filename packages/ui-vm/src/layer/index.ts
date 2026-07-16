/**
 * LayerManager - 平台无关的浮动层管理器
 *
 * 核心思想：用栈顺序隐式表达层级关系，无需显式传递 parent
 *
 * 使用方式：
 * 1. 层打开时调用 register(layer)
 * 2. 层关闭时调用 unregister(id)
 * 3. 点击/触摸事件时调用 handlePointerDown(x, y)
 *
 * 跨平台实现：
 * - Web: layer.containsPoint 用 getBoundingClientRect
 * - Swift: layer.containsPoint 用 view.frame.contains(CGPoint)
 * - Kotlin: layer.containsPoint 用 Rect.contains(x, y)
 */

import { BaseDomain, Handler } from "@timeless/base";

export type LayerType = 'sheet' | 'dialog' | 'popover' | 'tooltip';

export const BASE_Z_INDEX: Record<LayerType, number> = {
  sheet: 100,
  dialog: 200,
  popover: 300,
  tooltip: 400,
};

export const Z_INDEX_NEST_GAP = 50;

export interface Layer {
  id: string;
  /** 检查坐标是否在层内（各平台实现不同） */
  containsPoint(x: number, y: number): boolean;
  /** 关闭层 */
  dismiss(event?: PointerEvent): void;
  /** 是否阻止向下传播关闭（可选） */
  preventDismissBelow?: boolean;
}

enum Events {
  LayerAdded,
  LayerRemoved,
  /** 点击发生在所有层外部 */
  PointerDownOutside,
}

type TheTypesOfEvents = {
  [Events.LayerAdded]: Layer;
  [Events.LayerRemoved]: string;
  [Events.PointerDownOutside]: { x: number; y: number };
};

export class LayerManager extends BaseDomain<TheTypesOfEvents> {
  private stack: Layer[] = [];
  private consumedPointerDown: {
    x: number;
    y: number;
    time: number;
  } | null = null;

  /** 注册一个新层（push 到栈顶） */
  register(layer: Layer) {
    // 避免重复注册
    const existing = this.stack.find((l) => l.id === layer.id);
    if (existing) {
      console.log("[LayerManager] register skipped (already exists)", layer.id);
      return;
    }
    this.stack.push(layer);
    console.log(
      "[LayerManager] register",
      layer.id,
      "stack size:",
      this.stack.length,
    );
    this.emit(Events.LayerAdded, layer);
  }

  /** 注销层 */
  unregister(id: string) {
    const index = this.stack.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.stack.splice(index, 1);
      console.log(
        "[LayerManager] unregister",
        id,
        "stack size:",
        this.stack.length,
      );
      this.emit(Events.LayerRemoved, id);
    } else {
      console.log("[LayerManager] unregister skipped (not found)", id);
    }
  }

  /** 获取栈顶层 */
  getTopLayer(): Layer | undefined {
    return this.stack[this.stack.length - 1];
  }

  /** 获取所有层（从底到顶） */
  getAllLayers(): Layer[] {
    return [...this.stack];
  }

  /** 获取层数量 */
  get size(): number {
    return this.stack.length;
  }

  /**
   * 计算 z-index
   * 基于层类型的基础值 + 栈深度 * 嵌套增量
   * 手动传入 zIndex 时跳过自动计算
   */
  getZIndex(type: LayerType, manualZIndex?: number): number {
    if (manualZIndex !== undefined) return manualZIndex;
    return BASE_Z_INDEX[type] + this.stack.length * Z_INDEX_NEST_GAP;
  }

  /**
   * 处理点击/触摸事件
   * 只允许栈顶层消费一次 outside 交互，避免子层关闭后父层继续关闭。
   */
  handlePointerDown(eventOrX: PointerEvent | number, y?: number) {
    const event = typeof eventOrX === "number" ? undefined : eventOrX;
    const x = typeof eventOrX === "number" ? eventOrX : eventOrX.clientX;
    const pointY = typeof eventOrX === "number" ? y || 0 : eventOrX.clientY;

    if (this.stack.length === 0) {
      return;
    }

    const layer = this.getTopLayer();
    if (!layer) {
      return;
    }

    const inside = layer.containsPoint(x, pointY);
    console.log("[DEBUG] LayerManager.handlePointerDown", {
      stackSize: this.stack.length,
      topLayerId: layer.id,
      x, y: pointY,
      inside,
    });
    if (inside) {
      return;
    }

    console.log("[DEBUG] LayerManager DISMISSING top layer", layer.id);
    this.markPointerDownConsumed(x, pointY);
    layer.dismiss(event);

    if (this.stack.length === 0) {
      this.emit(Events.PointerDownOutside, { x, y: pointY });
    }
  }

  private markPointerDownConsumed(x: number, y: number) {
    this.consumedPointerDown = {
      x,
      y,
      time: Date.now(),
    };
  }

  /**
   * 判断当前 click 是否紧跟一次已被子层消费的 pointerdown。
   * pointerdown 和 click 是两个不同事件，因此用坐标和短时间窗口关联。
   */
  isRecentlyConsumedEvent(event: MouseEvent | PointerEvent | Event) {
    if (typeof MouseEvent === "undefined" || !(event instanceof MouseEvent)) {
      return false;
    }
    const consumed = this.consumedPointerDown;
    if (!consumed) {
      return false;
    }
    const isExpired = Date.now() - consumed.time > 800;
    if (isExpired) {
      this.consumedPointerDown = null;
      return false;
    }
    const matched =
      Math.abs(event.clientX - consumed.x) <= 2 &&
      Math.abs(event.clientY - consumed.y) <= 2;
    if (matched) {
      this.consumedPointerDown = null;
    }
    return matched;
  }

  /** 关闭所有层 */
  dismissAll() {
    // 从栈顶开始关闭
    while (this.stack.length > 0) {
      const layer = this.stack[this.stack.length - 1];
      layer.dismiss();
    }
  }

  /** 关闭栈顶层 */
  dismissTop() {
    const top = this.getTopLayer();
    if (top) {
      top.dismiss();
    }
  }

  onLayerAdded(handler: Handler<TheTypesOfEvents[Events.LayerAdded]>) {
    return this.on(Events.LayerAdded, handler);
  }

  onLayerRemoved(handler: Handler<TheTypesOfEvents[Events.LayerRemoved]>) {
    return this.on(Events.LayerRemoved, handler);
  }

  onPointerDownOutside(
    handler: Handler<TheTypesOfEvents[Events.PointerDownOutside]>,
  ) {
    return this.on(Events.PointerDownOutside, handler);
  }
}

/** 全局单例（Web 端使用） */
let globalLayerManager: LayerManager | null = null;
let globalListenerInitialized = false;

export function getGlobalLayerManager(): LayerManager {
  if (!globalLayerManager) {
    globalLayerManager = new LayerManager();
  }
  return globalLayerManager;
}

/**
 * 计算 z-index（便捷函数）
 * 基于层类型的基础值 + 全局 LayerManager 栈深度 * 嵌套增量
 * 手动传入 zIndex 时跳过自动计算
 */
export function computeZIndex(type: LayerType, manualZIndex?: number): number {
  if (manualZIndex !== undefined) return manualZIndex;
  const lm = getGlobalLayerManager();
  return BASE_Z_INDEX[type] + lm.size * Z_INDEX_NEST_GAP;
}

/**
 * 初始化全局 pointerdown 监听器（Web 端）
 * 确保只注册一次
 */
const isBrowser = typeof document !== "undefined";

export function initGlobalPointerListener() {
  if (globalListenerInitialized) {
    return;
  }
  if (!isBrowser) {
    return;
  }
  globalListenerInitialized = true;
  // console.log("[LayerManager] initGlobalPointerListener");

  const layer$ = getGlobalLayerManager();

  document.addEventListener(
    "pointerdown",
    (e) => {
      layer$.handlePointerDown(e);
    },
    true,
  );
}

/** 用于测试：重置全局实例 */
export function resetGlobalLayerManager() {
  globalLayerManager = null;
  globalListenerInitialized = false;
}
