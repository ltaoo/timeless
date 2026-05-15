import { BaseDomain, Handler } from "@timeless/base";

import { LayerManager, Layer, getGlobalLayerManager } from "@/layer/index";

enum Events {
  Dismiss,
  FocusOutside,
  PointerDownOutside,
  InteractOutside,
}

type TheTypesOfEvents = {
  [Events.Dismiss]: PointerEvent | undefined;
  [Events.PointerDownOutside]: PointerEvent | undefined;
  [Events.FocusOutside]: void;
  [Events.InteractOutside]: PointerEvent | undefined;
};

type RectLike = {
  x?: number;
  y?: number;
  left?: number;
  top?: number;
  width: number;
  height: number;
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
  private getRect: (() => RectLike | null | undefined) | null = null;
  private branches: Array<() => RectLike | null | undefined> = [];
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
  setRect(getRect: () => RectLike | null | undefined) {
    this.getRect = getRect;
  }

  addBranch(getRect: () => RectLike | null | undefined) {
    this.branches.push(getRect);
    return () => {
      const index = this.branches.indexOf(getRect);
      if (index !== -1) {
        this.branches.splice(index, 1);
      }
    };
  }

  private rectContainsPoint(
    rect: RectLike | null | undefined,
    x: number,
    y: number,
  ) {
    if (!rect) {
      return false;
    }
    const left = rect.left ?? rect.x ?? 0;
    const top = rect.top ?? rect.y ?? 0;
    return (
      x >= left && x <= left + rect.width && y >= top && y <= top + rect.height
    );
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
        if (this.getRect && this.rectContainsPoint(this.getRect(), x, y)) {
          return true;
        }
        return this.branches.some((getRect) =>
          this.rectContainsPoint(getRect(), x, y),
        );
      },
      dismiss: (event?: PointerEvent) => {
        this.emit(Events.PointerDownOutside, event);
        this.emit(Events.InteractOutside, event);
        this.emit(Events.Dismiss, event);
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
