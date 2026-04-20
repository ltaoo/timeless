import { BaseDomain, Handler, Platform } from "@timeless/base";

import { ScrollViewCore } from "@/scroll-view/index";
import { Logger } from "@/util";

import { compute_position, flip, shift, offset, arrow, size } from "./floating";
import type { Rect, Placement, Strategy, MiddlewareData } from "./types";

const logger = Logger({ prefix: "vm", scope: "popper" });

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
  defaultPlaced?: boolean;
  view$?: ScrollViewCore;
  /**
   * 可用空间计算模式
   * - "popper": 根据放置侧计算（底部放置时取下方空间，顶部放置时取上方空间）
   * - "item-aligned": 取视口最大可用空间（内容可以同时向上下延伸）
   */
  mode?: "popper" | "item-aligned";
  /**
   * item-aligned 模式：获取位置状态的回调
   */
  // getItemAlignedPosition?: () => any;
  platform?: Platform;
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
  /** 浮动元素在放置方向上的可用高度（px） */
  availableHeight: number;
  /** 浮动元素在交叉轴上的可用宽度（px） */
  availableWidth: number;
  /** viewport 可以向上滚动 */
  canScrollUp: boolean;
  /** viewport 可以向下滚动 */
  canScrollDown: boolean;
};
export class PopperCore extends BaseDomain<TheTypesOfEvents> {
  unique_id = "PopperCore";
  debug = true;

  // side: Side = "bottom";
  // align: Align = "center";
  platform: Platform;
  placement: Placement = "bottom";
  strategy: Strategy = "absolute";
  offsetX = 0;
  offsetY = 0;
  /** 可用空间计算模式
   * - "popper": 根据放置侧计算（底部放置时取下方空间，顶部放置时取上方空间）
   * - "item-aligned": 取视口最大可用空间（内容可以同时向上下延伸）
   */
  mode: "popper" | "item-aligned" = "popper";
  /** item-aligned 模式：选中项在列表中的垂直偏移量，用于将面板对齐到选中项 */
  itemOffset = 0;
  /** item-aligned 模式：获取位置状态的回调 */
  // getItemAlignedPosition?: () => any;
  view$?: ScrollViewCore;
  reference: {
    getRect: () => Rect;
    $el?: unknown;
    // x: number;
    // y: number;
    // width: number;
    // height: number;
  } | null = null;
  /** item-aligned 模式：trigger 中的 value 节点 */
  valueNode: { getBoundingClientRect: () => DOMRect } | null = null;
  /** item-aligned 模式：content wrapper 元素（用于设置 fixed 定位） */
  contentWrapper: { $el?: HTMLElement } | null = null;
  /** item-aligned 模式：viewport 元素（用于 scroll） */
  viewport: { $el?: HTMLElement } | null = null;
  /** item-aligned 模式：选中的 item 元素 */
  selectedItem: {
    $el?: HTMLElement;
    offsetTop: number;
    offsetHeight: number;
  } | null = null;
  /** item-aligned 模式：选中的 item 文本元素 */
  selectedItemText: { getBoundingClientRect: () => DOMRect } | null = null;
  _item: {
    x: number;
    y: number;
  };
  floating: {
    getRect: () => Rect;
    $el?: {};
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
  $arrow: any | null = null;

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
    availableHeight: 0,
    availableWidth: 0,
    canScrollUp: false,
    canScrollDown: false,
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
      defaultPlaced = false,
      platform,
      mode = "popper",
      view$,
    } = options;
    if (_name) {
      this.unique_id = _name;
    }
    this.strategy = strategy;
    this.placement = (side +
      (align !== "center" ? "-" + align : "")) as Placement;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.mode = mode;
    this.view$ = view$;
    this.platform = platform;
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
    // console.log(
    //   "[DEBUG-POPPER] setReference",
    //   "$reference",
    //   reference,
    //   "floating:",
    //   this.floating,
    // );
    if (!reference) {
      return;
    }
    this.reference = reference;
    this.state.reference = !!reference;
    this.place();
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
      const el = floating.getRect();
      console.log(
        "[DEBUG-POPPER] tryPlace - checking element",
        this.unique_id,
        {
          hasEl: !!el,
          // offsetWidth: el?.offsetWidth,
          // offsetHeight: el?.offsetHeight,
          // isConnected: el?.isConnected,
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
  setArrowElement($arrow: any | null) {
    this.$arrow = $arrow;
    // if we have arrow element, we might want to re-place
    if (this.reference && this.floating) {
      this.place();
    }
  }
  setContainer(container: Node) {
    // this.container = container;
    // this.emit(Events.ContainerChange, container);
  }
  /** viewport 滚动时由 primitive 调用，更新滚动按钮可见性 */
  handleViewportScroll(
    scrollTop: number,
    clientHeight: number,
    scrollHeight: number,
  ) {
    const canScrollUp = scrollTop > 0;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;
    if (
      this.state.canScrollUp === canScrollUp &&
      this.state.canScrollDown === canScrollDown
    ) {
      return;
    }
    this.state.canScrollUp = canScrollUp;
    this.state.canScrollDown = canScrollDown;
    this.emit(Events.StateChange, { ...this.state });
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
  /** 设置 item-aligned 模式下选中项的偏移量 */
  setItemOffset(data: { x: number; y: number; height: number; bottom: number }) {
    this._item = data;
  }
  /** 计算浮动元素位置 */
  async place() {
    // const has$el = !!(this.reference as any)?.$el;
    if (!this.reference || !this.floating) {
      logger.warn(
        "place missing",
        (() => {
          if (this.reference) {
            return "floating";
          }
          if (this.floating) {
            return "reference";
          }
          return "floating and reference";
        })(),
      );
      return;
    }
    const coords = await this.computePosition();
    // const { x, y, width, height } = this.reference.getRect();
    const { x, y, middleware_data } = coords;
    let x_with_offset = x + this.offsetX;
    let y_with_offset = y + this.offsetY;
    // In item-aligned mode, offset the floating panel by the selected item's offset
    // This makes the selected item align with the trigger button
    if (this.mode === "item-aligned" && this.itemOffset !== 0) {
      y_with_offset -= this.itemOffset;
    }
    const [placed_side, placed_align] = getSideAndAlignFromPlacement(
      coords.placement,
    );
    // When the reference is wider/taller than the floating element,
    // override arrow position based on alignment instead of pointing at reference center
    // if (middleware_data.arrow && this.floating && this.reference) {
    //   const floating_rect = this.floating.getRect();
    //   const reference_rect = this.reference.getRect();
    //   const arrow_padding = 12;
    //   const is_vertical_side =
    //     placed_side === "top" || placed_side === "bottom";
    //   if (is_vertical_side && reference_rect.width > floating_rect.width) {
    //     const arrow_width = this.arrow?.width || 10;
    //     if (placed_align === "start") {
    //       middleware_data.arrow.x = arrow_padding;
    //     } else if (placed_align === "end") {
    //       middleware_data.arrow.x =
    //         floating_rect.width - arrow_width - arrow_padding;
    //     }
    //   } else if (
    //     !is_vertical_side &&
    //     reference_rect.height > floating_rect.height
    //   ) {
    //     const arrow_height = this.arrow?.height || 10;
    //     if (placed_align === "start") {
    //       middleware_data.arrow.y = arrow_padding;
    //     } else if (placed_align === "end") {
    //       middleware_data.arrow.y =
    //         floating_rect.height - arrow_height - arrow_padding;
    //     }
    //   }
    // }
    // Extract available dimensions from size middleware
    let available_height = 0;
    let available_width = 0;
    if (this.mode === "item-aligned") {
      // item-aligned mode: content can extend both above and below the reference,
      // so available height is the full viewport minus margins
      const CONTENT_MARGIN = 10;
      if (typeof window !== "undefined") {
        available_height = window.innerHeight - CONTENT_MARGIN * 2;
        available_width = window.innerWidth - CONTENT_MARGIN * 2;
      }
    } else if (middleware_data.size) {
      // popper mode: use the side-aware values from size middleware
      available_height = middleware_data.size.availableHeight ?? 0;
      available_width = middleware_data.size.availableWidth ?? 0;
    }
    this.state = {
      x: x_with_offset,
      y: y_with_offset,
      strategy: this.strategy,
      placement: coords.placement,
      isPlaced: true,
      placedSide: placed_side,
      placedAlign: placed_align,
      reference: true,
      arrow: middleware_data.arrow || null,
      middlewareData: middleware_data,
      availableHeight: available_height,
      availableWidth: available_width,
      canScrollUp: false,
      canScrollDown: false,
    };
    logger.log("place - before emit placed", {
      x,
      y,
      offsetX: this.offsetX,
      arrow: middleware_data.arrow,
    });
    this.emit(Events.StateChange, { ...this.state });
  }
  async computePosition() {
    const reference$ = this.reference;
    const floating$ = this.floating;

    if (!floating$) {
      logger.log("computePosition early return - no floatingEl");
      return {
        x: 0,
        y: 0,
        placement: this.placement,
        strategy: this.strategy,
        middleware_data: {} as MiddlewareData,
      };
    }

    // Use real element or virtual element (for updateReference with only getRect)
    // const useVirtual = !(referenceEl instanceof Element);
    const useVirtual = false;

    const middleware: any[] = [
      offset(this.$arrow ? 12 : 4),
      flip(),
      shift({ padding: 8 }),
      size({ padding: 8 }),
    ];
    if (this.$arrow) {
      middleware.push(arrow({ element: this.$arrow, padding: 12 }));
    }

    // Reset floating element position and force reflow before computing
    // (floatingEl as HTMLElement).style.transform = "translate3d(0, 0, 0)";
    // void (floatingEl as HTMLElement).offsetHeight;

    // Manual test: compute position without floating-ui
    const reference_rect = reference$.getRect();
    const floating_rect = floating$.getRect();
    logger.log(
      "MANUAL TEST before computeDomPosition",
      this.unique_id,
      {
        x: reference_rect.x,
        y: reference_rect.y,
        width: reference_rect.width,
        height: reference_rect.height,
      },
      {
        x: floating_rect.x,
        y: floating_rect.y,
        width: floating_rect.width,
        height: floating_rect.height,
      },
      this.placement,
    );

    const result = await compute_position(reference$, floating$, {
      placement: this.placement,
      strategy: this.strategy,
      middleware,
      platform: this.platform,
    });
    logger.log("computePosition result", this.unique_id, {
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
      middleware_data: result.middlewareData as MiddlewareData,
    };
  }

  getItemAlignedPosition() {
    return {
      ...this._item,
      bottom: 0,
      x: this.state.x,
      y: this.state.y,
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
