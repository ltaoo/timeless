import { BaseDomain, Handler } from "@timeless/base";

import { LayerManager, Layer, getGlobalLayerManager } from "@/layer/index";

enum Events {
  Dismiss,
  FocusOutside,
  PointerDownOutside,
  InteractOutside,
}

type TheTypesOfEvents = {
  [Events.Dismiss]: void;
  [Events.PointerDownOutside]: void;
  [Events.FocusOutside]: void;
  [Events.InteractOutside]: void;
};

let idCounter = 0;

/**
 * DismissableLayerCore - 可关闭的浮动层
 *
 * 基于 LayerManager 实现，自动处理嵌套层的点击外部关闭逻辑
 */
export class DismissableLayerCore extends BaseDomain<TheTypesOfEvents> {
  name = "DismissableLayerCore";

  readonly id: string;
  private layerManager: LayerManager;
  private getRect:
    | (() => { x: number; y: number; width: number; height: number })
    | null = null;
  private registered = false;

  constructor(
    options: Partial<{
      _name: string;
      layerManager: LayerManager;
    }> = {},
  ) {
    super(options);
    this.id = `dismissable-layer-${++idCounter}`;
    this.layerManager = options.layerManager || getGlobalLayerManager();
  }

  /**
   * 设置层的位置信息（用于 containsPoint 检测）
   * 在层挂载时调用
   */
  setRect(
    getRect: () => { x: number; y: number; width: number; height: number },
  ) {
    this.getRect = getRect;
  }

  /**
   * 注册到 LayerManager
   * 在层显示/挂载时调用
   */
  register() {
    if (this.registered) {
      return;
    }

    const layer: Layer = {
      id: this.id,
      containsPoint: (x: number, y: number) => {
        if (!this.getRect) {
          return false;
        }
        const rect = this.getRect();
        return (
          x >= rect.x &&
          x <= rect.x + rect.width &&
          y >= rect.y &&
          y <= rect.y + rect.height
        );
      },
      dismiss: () => {
        this.emit(Events.PointerDownOutside);
        this.emit(Events.InteractOutside);
        this.emit(Events.Dismiss);
      },
    };

    this.layerManager.register(layer);
    this.registered = true;
  }

  /**
   * 从 LayerManager 注销
   * 在层隐藏/卸载时调用
   */
  unregister() {
    if (!this.registered) {
      return;
    }
    this.layerManager.unregister(this.id);
    this.registered = false;
  }

  /** 手动触发关闭 */
  dismiss() {
    this.emit(Events.Dismiss);
  }

  onDismiss(handler: Handler<TheTypesOfEvents[Events.Dismiss]>) {
    return this.on(Events.Dismiss, handler);
  }

  onPointerDownOutside(
    handler: Handler<TheTypesOfEvents[Events.PointerDownOutside]>,
  ) {
    return this.on(Events.PointerDownOutside, handler);
  }

  onFocusOutside(handler: Handler<TheTypesOfEvents[Events.FocusOutside]>) {
    return this.on(Events.FocusOutside, handler);
  }

  onInteractOutside(
    handler: Handler<TheTypesOfEvents[Events.InteractOutside]>,
  ) {
    return this.on(Events.InteractOutside, handler);
  }
}
