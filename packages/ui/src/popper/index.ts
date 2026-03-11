import { BaseDomain, Handler } from "@timeless/base";
import { Rect } from "@/popper/types";
import {
  computePosition as computeDomPosition,
  flip,
  shift,
  offset,
  arrow,
} from "@floating-ui/dom";

import type { Placement, Strategy, MiddlewareData } from "./types";

const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
const ALIGN_OPTIONS = ["start", "center", "end"] as const;
export type Side = (typeof SIDE_OPTIONS)[number];
export type Align = (typeof ALIGN_OPTIONS)[number];

enum Events {
  /** 参考原始被加载 */
  ReferenceMounted,
  /** 内容元素被加载（可以获取宽高位置） */
  FloatingMounted,
  /** 被放置（其实就是计算好了浮动元素位置） */
  Placed,
  /** 鼠标进入内容区 */
  Enter,
  /** 鼠标离开内容区 */
  Leave,
  StateChange,
  /** 父容器改变 */
  ContainerChange,
}
type TheTypesOfEvents = {
  [Events.FloatingMounted]: {
    getRect: () => Rect;
    // width: number;
    // height: number;
    // x: number;
    // y: number;
  };
  [Events.ReferenceMounted]: {
    getRect: () => Rect;
    // width: number;
    // height: number;
    // x: number;
    // y: number;
  };
  [Events.ContainerChange]: Node;
  [Events.Placed]: PopperState;
  [Events.Enter]: void;
  [Events.Leave]: void;
  [Events.StateChange]: PopperState;
};
type PopperProps = {
  side: Side;
  align: Align;
  strategy: "fixed" | "absolute";
  offsetX?: number;
  offsetY?: number;
};
type PopperState = {
  strategy: Strategy;
  x: number;
  y: number;
  placement: Placement;
  isPlaced: boolean;
  placedSide: Side;
  placedAlign: Align;
  /** 是否设置了参考DOM */
  reference: boolean;
  arrow: {
    x?: number;
    y?: number;
  } | null;
  middlewareData: MiddlewareData;
};
export class PopperCore extends BaseDomain<TheTypesOfEvents> {
  unique_id = "PopperCore";
  debug = true;

  // side: Side = "bottom";
  // align: Align = "center";
  placement: Placement = "bottom";
  strategy: Strategy = "absolute";
  offsetX = 0;
  offsetY = 0;
  reference: {
    getRect: () => Rect;
    $el?: unknown;
    // x: number;
    // y: number;
    // width: number;
    // height: number;
  } | null = null;
  floating: {
    getRect: () => Rect;
    $el?: unknown;
    // x: number;
    // y: number;
    // width: number;
    // height: number;
  } | null = null;
  container: Node | null = null;
  arrow: {
    width: number;
    height: number;
  } | null = null;
  arrowElement: HTMLElement | null = null;

  state: PopperState = {
    strategy: "absolute",
    x: 0,
    y: 0,
    placement: "bottom",
    isPlaced: false,
    placedSide: "bottom",
    placedAlign: "center",
    reference: false,
    arrow: null,
    middlewareData: {},
  };

  _enter = false;
  _focus = false;

  constructor(options: Partial<{ _name: string }> & Partial<PopperProps> = {}) {
    super(options);

    const {
      _name,
      side = "bottom",
      align = "center",
      strategy = "absolute",
      offsetX = 0,
      offsetY = 0,
    } = options;
    if (_name) {
      this.unique_id = _name;
    }
    this.strategy = strategy;
    this.placement = (side +
      (align !== "center" ? "-" + align : "")) as Placement;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  checkIsClickAnchor: (target: any) => boolean = (target: any) => {
    if (!this.reference) {
      return false;
    }
    // If reference has $el (real element)
    const el = (this.reference as any).$el as HTMLElement;
    if (el && target instanceof Node && el.contains(target)) {
      return true;
    }
    return false;
  };

  /** 基准元素加载完成 */
  setReference(
    reference: { $el?: unknown; getRect: () => Rect },
    opt: Partial<{ force: boolean }> = {},
  ) {
    console.log(
      "[DEBUG-POPPER] setReference",
      this.unique_id,
      "has$el:",
      !!(reference as any)?.$el,
      "hasGetRect:",
      !!reference?.getRect,
      "prevRef:",
      !!this.reference,
    );
    if (!reference) {
      return;
    }
    this.reference = reference;
    this.state.reference = !!reference;
    this.emit(Events.ReferenceMounted, reference);
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 更新基准元素（右键菜单时会用到这个方法） */
  updateReference(reference: { $el?: unknown; getRect: () => Rect }) {
    console.log(
      "[DEBUG-POPPER] updateReference",
      this.unique_id,
      "hasPrevRef:",
      !!this.reference,
      "has$el:",
      !!(reference as any)?.$el,
    );
    if (!this.reference) {
      return;
    }
    this.reference = reference;
  }
  removeReference() {
    if (this.reference === null) {
      return;
    }
    this.state.reference = false;
    this.reference = null;
    this.emit(Events.StateChange, { ...this.state });
  }
  /** 内容元素加载完成 */
  setFloating(floating: PopperCore["floating"]) {
    console.log(
      "[DEBUG-POPPER] setFloating",
      this.unique_id,
      "floating:",
      !!floating,
      "hasRef:",
      !!this.reference,
      "has$el:",
      !!(this.reference as any)?.$el,
    );
    if (!floating) {
      this.floating = null;
      this.state.isPlaced = false;
      this.emit(Events.StateChange, { ...this.state });
      return;
    }
    this.floating = floating;
    this.emit(Events.FloatingMounted, floating);
    const tryPlace = () => {
      if (this.floating !== floating) {
        console.log(
          "[DEBUG-POPPER] tryPlace - floating mismatch",
          this.unique_id,
          "this.floating:",
          !!this.floating,
          "floating:",
          !!floating,
        );
        return;
      }
      const el = (floating as any)?.$el as HTMLElement | undefined;
      console.log(
        "[DEBUG-POPPER] tryPlace - checking element",
        this.unique_id,
        {
          hasEl: !!el,
          offsetWidth: el?.offsetWidth,
          offsetHeight: el?.offsetHeight,
          isConnected: el?.isConnected,
        },
      );
      this.place();
      // if (el && (el.offsetWidth > 0 || el.offsetHeight > 0)) {
      //   console.log("[DEBUG-POPPER] tryPlace - calling place()", this.unique_id);
      //   this.place();
      // } else {
      //   console.log("[DEBUG-POPPER] tryPlace - retrying", this.unique_id);
      //   requestAnimationFrame(tryPlace);
      // }
    };
    requestAnimationFrame(tryPlace);
  }
  /** 箭头加载完成 */
  setArrow(arrow: PopperCore["arrow"]) {
    this.arrow = arrow;
  }
  setArrowElement(arrowElement: HTMLElement | null) {
    this.arrowElement = arrowElement;
    // if we have arrow element, we might want to re-place
    if (this.reference && this.floating) {
      this.place();
    }
  }
  setContainer(container: Node) {
    // this.container = container;
    // this.emit(Events.ContainerChange, container);
  }
  setConfig(config: { placement?: Placement; strategy?: Strategy }) {
    if (config.placement) {
      this.placement = config.placement;
    }
    if (config.strategy) {
      this.strategy = config.strategy;
    }
  }
  setState(v: { x: number; y: number }) {
    this.state.x = v.x;
    this.state.y = v.y;
    this.state.isPlaced = true;
    this.emit(Events.StateChange, {
      ...this.state,
    });
  }
  setOffset(offset: { x: number; y: number }) {
    this.offsetX = offset.x;
    this.offsetY = offset.y;
  }
  /** 计算浮动元素位置 */
  async place() {
    const has$el = !!(this.reference as any)?.$el;
    const refRect = this.reference?.getRect?.();
    const floatingRect = this.floating?.getRect?.();
    console.log("[DEBUG-POPPER] place()", this.unique_id, {
      hasRef: !!this.reference,
      hasFloating: !!this.floating,
      has$el,
      refRect,
      floatingRect,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    });
    if (this.reference === null || this.floating === null) {
      console.log(
        "[DEBUG-POPPER] place() early return - missing ref or floating",
        this.reference?.$el ?? null,
        this.floating?.$el ?? null,
      );
      return;
    }
    const coords = await this.computePosition();
    // const { x, y, width, height } = this.reference.getRect();
    const { x, y, middlewareData } = coords;
    const xWithOffset = x + this.offsetX;
    const yWithOffset = y + this.offsetY;
    const [placedSide, placedAlign] = getSideAndAlignFromPlacement(
      coords.placement,
    );
    this.state = {
      x: xWithOffset,
      y: yWithOffset,
      strategy: this.strategy,
      placement: coords.placement,
      isPlaced: true,
      placedSide,
      placedAlign,
      reference: true,
      arrow: middlewareData.arrow || null,
      middlewareData,
    };
    console.log(
      ...this.log("place - before emit placed", {
        x,
        y,
        offsetX: this.offsetX,
        arrow: middlewareData.arrow,
      }),
    );
    this.emit(Events.StateChange, {
      ...this.state,
    });
  }
  async computePosition() {
    const { placement, strategy } = this;

    const referenceEl = (this.reference as any)?.$el as HTMLElement | undefined;
    const floatingEl = (this.floating as any)?.$el as HTMLElement | undefined;

    console.log("[DEBUG-POPPER] computePosition", this.unique_id, {
      refIsElement: referenceEl instanceof Element,
      floatingIsElement: floatingEl instanceof Element,
      refElRect:
        referenceEl instanceof Element
          ? referenceEl.getBoundingClientRect()
          : null,
      floatingElRect:
        floatingEl instanceof Element
          ? floatingEl.getBoundingClientRect()
          : null,
      placement,
      strategy,
    });

    if (!floatingEl || !(floatingEl instanceof Element)) {
      console.log(
        "[DEBUG-POPPER] computePosition early return - no floatingEl",
      );
      return {
        x: 0,
        y: 0,
        placement,
        strategy,
        middlewareData: {} as MiddlewareData,
      };
    }

    // Use real element or virtual element (for updateReference with only getRect)
    const useVirtual = !(referenceEl instanceof Element);
    const referenceArg: any =
      referenceEl instanceof Element
        ? referenceEl
        : {
            getBoundingClientRect: () => {
              const r = this.reference!.getRect();
              console.log(
                "[DEBUG-POPPER] virtual getBoundingClientRect called",
                this.unique_id,
                r,
              );
              return {
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                top: r.y,
                left: r.x,
                right: r.x + r.width,
                bottom: r.y + r.height,
              };
            },
          };

    const middleware: any[] = [
      offset(this.arrowElement ? 12 : 4),
      flip(),
      shift({ padding: 8 }),
    ];
    if (this.arrowElement) {
      middleware.push(arrow({ element: this.arrowElement }));
    }

    // Reset floating element position and force reflow before computing
    (floatingEl as HTMLElement).style.transform = "translate3d(0, 0, 0)";
    void (floatingEl as HTMLElement).offsetHeight;

    // Manual test: compute position without floating-ui
    const refRect =
      referenceEl instanceof Element
        ? referenceEl.getBoundingClientRect()
        : referenceArg.getBoundingClientRect();
    const floatRect = floatingEl.getBoundingClientRect();
    console.log(
      "[DEBUG-POPPER] MANUAL TEST before computeDomPosition",
      this.unique_id,
      {
        refRect: {
          x: refRect.x,
          y: refRect.y,
          width: refRect.width,
          height: refRect.height,
        },
        floatRect: {
          x: floatRect.x,
          y: floatRect.y,
          width: floatRect.width,
          height: floatRect.height,
        },
        floatTransform: (floatingEl as HTMLElement).style.transform,
        floatComputedTransform: getComputedStyle(floatingEl).transform,
        floatParent: floatingEl.parentElement?.tagName,
        floatInDOM: document.body.contains(floatingEl),
        placement,
      },
    );

    const result = await computeDomPosition(referenceArg, floatingEl, {
      placement,
      strategy,
      middleware,
    });
    console.log("[DEBUG-POPPER] computeDomPosition result", this.unique_id, {
      x: result.x,
      y: result.y,
      useVirtual,
      placement: result.placement,
    });
    return {
      x: result.x,
      y: result.y,
      placement: result.placement as Placement,
      strategy: result.strategy as Strategy,
      middlewareData: result.middlewareData as MiddlewareData,
    };
  }
  handleEnter() {
    // this.log("enter", this.reference?.x, this._enter);
    if (this._enter === true) {
      return;
    }
    this._enter = true;
    this.emit(Events.Enter);
  }
  handleLeave() {
    // this.log("leave", this.reference?.x, this._enter);
    if (this._enter === false) {
      return;
    }
    this._enter = false;
    this.emit(Events.Leave);
  }
  reset() {
    this._enter = false;
    this._focus = false;
    this.state.isPlaced = false;
    this.state.x = 0;
    this.state.y = 0;
    this.emit(Events.StateChange, { ...this.state });
  }

  onReferenceMounted(
    handler: Handler<TheTypesOfEvents[Events.ReferenceMounted]>,
  ) {
    return this.on(Events.ReferenceMounted, handler);
  }
  onFloatingMounted(
    handler: Handler<TheTypesOfEvents[Events.FloatingMounted]>,
  ) {
    return this.on(Events.FloatingMounted, handler);
  }
  onContainerChange(
    handler: Handler<TheTypesOfEvents[Events.ContainerChange]>,
  ) {
    return this.on(Events.ContainerChange, handler);
  }
  onEnter(handler: Handler<TheTypesOfEvents[Events.Enter]>) {
    return this.on(Events.Enter, handler);
  }
  onLeave(handler: Handler<TheTypesOfEvents[Events.Leave]>) {
    return this.on(Events.Leave, handler);
  }
  onPlaced(handler: Handler<TheTypesOfEvents[Events.Placed]>) {
    return this.on(Events.Placed, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }

  get [Symbol.toStringTag]() {
    return "PopperCore";
  }
}

/* -----------------------------------------------------------------------------------------------*/

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side as Side, align as Align] as const;
}
