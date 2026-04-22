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

export interface Layer {
  id: string;
  /** 检查坐标是否在层内（各平台实现不同） */
  containsPoint(x: number, y: number): boolean;
  /** 关闭层 */
  dismiss(): void;
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
   * 处理点击/触摸事件
   * 从栈顶向下检查，关闭不包含点击点的层
   */
  handlePointerDown(x: number, y: number) {
    console.log("[LayerManager] handlePointerDown", {
      x,
      y,
      stackSize: this.stack.length,
    });

    if (this.stack.length === 0) {
      return;
    }

    // 先收集需要关闭的层（避免遍历时修改栈）
    const layersToDismiss: Layer[] = [];

    // 从栈顶向下遍历
    for (let i = this.stack.length - 1; i >= 0; i--) {
      const layer = this.stack[i];
      const contains = layer.containsPoint(x, y);
      console.log("[LayerManager] checking layer", { id: layer.id, contains });

      if (contains) {
        // 点击在这层内部，停止检查
        // 这层及其下面的所有层都保持打开
        break;
      } else {
        // 点击在这层外部，标记为需要关闭
        layersToDismiss.push(layer);
      }
    }

    console.log(
      "[LayerManager] layers to dismiss:",
      layersToDismiss.map((l) => l.id),
    );

    // 统一关闭（从栈顶到栈底的顺序）
    for (const layer of layersToDismiss) {
      layer.dismiss();
    }

    // 如果所有层都被检查完且都在外部，发出事件
    if (this.stack.length === 0) {
      this.emit(Events.PointerDownOutside, { x, y });
    }
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

  document.addEventListener("pointerdown", (e) => {
    layer$.handlePointerDown(e.clientX, e.clientY);
  });
}

/** 用于测试：重置全局实例 */
export function resetGlobalLayerManager() {
  globalLayerManager = null;
  globalListenerInitialized = false;
}
