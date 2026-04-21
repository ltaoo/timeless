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
  /**
   * Popper 关心的，可滚动容器
   * 当容器滚动时，可以更新 Popper 的位置
   */
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
  top?: number;
  bottom?: number;
  placement: Placement;
  isPlaced: boolean;
  /** PopperContent height */
  height: number;
  maxHeight?: number;
  minWidth?: number;
  margin?: number;
  viewportOffsetTop?: number;
  /** 是否设置了参考DOM */
  reference: boolean;
  arrow: {
    x?: number;
    y?: number;
  } | null;
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
  view$?: ScrollViewCore;
  reference: {
    getRect: () => Rect;
    $el?: unknown;
  } | null = null;
  floating: {
    getRect: () => Rect;
    $el?: {};
  } | null = null;

  /** item-aligned 模式：选中项在列表中的垂直偏移量，用于将面板对齐到选中项 */
  itemOffset = 0;
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
  /** item-aligned 模式：content 元素的测量数据（用于计算定位） */
  _contentMeasurement: ItemAlignedContentMeasurement | null = null;
  /** item-aligned 模式：viewport 元素的测量数据（用于计算定位） */
  _viewportMeasurement: ItemAlignedViewportMeasurement | null = null;
  /** item-aligned 模式：计算好的容器样式 */
  _itemAlignedStyle: ItemAlignedContentWrapperStyle | null = null;
  _item: {
    offsetTop: number;
    offsetHeight: number;
    x: number;
    y: number;
  };
  container: Node | null = null;
  arrow: {
    width: number;
    height: number;
  } | null = null;
  $arrow: any | null = null;
  viewport$: ScrollViewCore;

  state: PopperState = {
    strategy: "absolute",
    x: 0,
    y: 0,
    placement: "bottom",
    isPlaced: false,
    height: 0,
    maxHeight: 0,
    reference: false,
    arrow: null,
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

    const handleScroll = this.handleViewportScroll.bind(this);
    this.viewport$ = new ScrollViewCore({
      onScroll: handleScroll,
    });
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
      // this.state.isPlaced = false;
      this.emit(Events.StateChange, { ...this.state });
      return;
    }
    this.floating = floating;
    this.emit(Events.FloatingMounted, floating);
    // const tryPlace = () => {
    //   if (this.floating !== floating) {
    //     console.log(
    //       "[DEBUG-POPPER] tryPlace - floating mismatch",
    //       this.unique_id,
    //       "this.floating:",
    //       !!this.floating,
    //       "floating:",
    //       !!floating,
    //     );
    //     return;
    //   }
    //   const el = floating.getRect();
    //   logger.log("tryPlace - checking element", this.unique_id, {
    //     hasEl: !!el,
    //     // offsetWidth: el?.offsetWidth,
    //     // offsetHeight: el?.offsetHeight,
    //     // isConnected: el?.isConnected,
    //   });
    //   this.place();
    //   // if (el && (el.offsetWidth > 0 || el.offsetHeight > 0)) {
    //   //   console.log("[DEBUG-POPPER] tryPlace - calling place()", this.unique_id);
    //   //   this.place();
    //   // } else {
    //   //   console.log("[DEBUG-POPPER] tryPlace - retrying", this.unique_id);
    //   //   requestAnimationFrame(tryPlace);
    //   // }
    // };
    // requestAnimationFrame(tryPlace);
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
  handleViewportScroll(event: {
    scrollTop: number;
    clientHeight: number;
    scrollHeight: number;
  }) {
    const { scrollTop, clientHeight, scrollHeight } = event;
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
  adjustContentPositonWithOffsetTop(data: {
    selectedItem: {
      offsetTop: number;
      offsetHeight: number;
      bottom: number;
      isFirst?: boolean;
      isLast?: boolean;
    };
    content?: {
      borderTopWidth: number;
      paddingTop: number;
      borderBottomWidth: number;
      paddingBottom: number;
      clientHeight: number;
    };
    viewport?: {
      scrollHeight: number;
      offsetTop: number;
      offsetHeight: number;
      paddingTop: number;
      paddingBottom: number;
    };
    scrollButtonHeight?: number;
  }) {
    logger.log(
      "adjustContentPositonWithOffsetTop",
      this.viewport$,
      this.reference,
      this.floating,
    );
    const scrollButtonHeight = data.scrollButtonHeight ?? 0;

    if (!this.viewport$ || !this.reference || !this.floating) {
      return;
    }

    const viewport$ = this.viewport$;
    const reference_rect = this.reference.getRect();
    const floating_rect = this.floating.getRect();
    const windowSize = this.platform.getViewportSize();

    const {
      offsetHeight,
      offsetTop: selectedItemOffsetTop,
      bottom,
      isFirst = false,
      isLast = false,
    } = data.selectedItem;

    const content = data.content ?? {
      borderTopWidth: 0,
      paddingTop: 0,
      borderBottomWidth: 0,
      paddingBottom: 0,
      clientHeight: floating_rect.height,
    };

    const viewportData = data.viewport ?? {
      scrollHeight: viewport$.rect.contentHeight ?? 0,
      offsetTop: 0,
      offsetHeight: viewport$.rect.height ?? 0,
      paddingTop: 0,
      paddingBottom: 0,
    };

    const contentMargin = 10;

    const availableHeight = windowSize.height - contentMargin * 2;
    const {
      borderTopWidth,
      paddingTop,
      borderBottomWidth,
      paddingBottom,
      clientHeight: contentClientHeight,
    } = content;

    const fullContentHeight =
      borderTopWidth +
      paddingTop +
      viewportData.scrollHeight +
      paddingBottom +
      borderBottomWidth;
    const minContentHeight = Math.min(offsetHeight * 5, fullContentHeight);

    const topEdgeToTriggerMiddle =
      reference_rect.top + reference_rect.height / 2 - contentMargin;
    const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;

    const selectedItemHalfHeight = offsetHeight / 2;
    const itemOffsetMiddle = selectedItemOffsetTop + selectedItemHalfHeight;
    const contentTopToItemMiddle =
      borderTopWidth + paddingTop + itemOffsetMiddle;
    const itemMiddleToContentBottom =
      fullContentHeight - contentTopToItemMiddle;

    const willAlignWithoutTopOverflow =
      contentTopToItemMiddle <= topEdgeToTriggerMiddle;

    let left: number | undefined;
    let right: number | undefined;
    let minWidth: number;
    let top: number | undefined;
    let bottomVal: number | undefined;
    let height: number;
    let viewportScrollTop: number | undefined;

    // 水平方向计算 (简化版，始终 left 对齐)
    left = reference_rect.left + 1;
    minWidth = reference_rect.width - 1;

    // 垂直方向计算
    if (willAlignWithoutTopOverflow) {
      bottomVal = 0;
      const viewportOffsetBottom =
        contentClientHeight -
        viewportData.offsetTop -
        viewportData.offsetHeight;
      const clampedTriggerMiddleToBottomEdge = Math.max(
        triggerMiddleToBottomEdge,
        selectedItemHalfHeight +
          (isLast ? viewportData.paddingBottom : 0) +
          viewportOffsetBottom +
          borderBottomWidth,
      );
      height = Math.min(
        contentTopToItemMiddle + clampedTriggerMiddleToBottomEdge,
        availableHeight,
      );
    } else {
      top = 0;
      const clampedTopEdgeToTriggerMiddle = Math.max(
        topEdgeToTriggerMiddle,
        borderTopWidth +
          viewportData.offsetTop +
          (isFirst ? viewportData.paddingTop : 0) +
          selectedItemHalfHeight,
      );
      height = Math.min(
        clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom,
        availableHeight,
      );
      viewportScrollTop =
        contentTopToItemMiddle -
        topEdgeToTriggerMiddle +
        viewportData.offsetTop;
    }

    this.state.x = left ?? 0;
    this.state.y = 0;
    this.state.top = top;
    this.state.bottom = bottomVal;
    this.state.height = height;
    this.state.minWidth = minWidth;
    this.state.isPlaced = true;
    this.state.margin = contentMargin;
    this.state.placement = bottomVal === 0 ? "bottom" : "top";
    this.state.strategy = "fixed";
    this.state.maxHeight = availableHeight;
    this.state.canScrollDown = true;
    this.state.canScrollUp = true;
    // this.state.viewportOffsetTop = viewportScrollTop;

    if (viewportScrollTop !== undefined) {
      viewport$.setScrollTop(viewportScrollTop);
    }

    this.emit(Events.StateChange, { ...this.state });
  }
  /** 设置 item-aligned 模式下的 DOM 元素和测量数据 */
  setItemAlignedElements(data: {
    valueNode: { getBoundingClientRect: () => DOMRect };
    contentWrapper: { $el?: HTMLElement };
    viewport: { $el?: HTMLElement };
    selectedItem: {
      $el?: HTMLElement;
      offsetTop: number;
      offsetHeight: number;
    };
    selectedItemText: { getBoundingClientRect: () => DOMRect };
  }) {
    this.valueNode = data.valueNode;
    this.contentWrapper = data.contentWrapper;
    this.viewport = data.viewport;
    this.selectedItem = data.selectedItem;
    this.selectedItemText = data.selectedItemText;
  }
  /** 设置 item-aligned 模式下的测量数据 */
  setItemAlignedMeasurements(
    content: ItemAlignedContentMeasurement,
    viewport: ItemAlignedViewportMeasurement,
  ) {
    this._contentMeasurement = content;
    this._viewportMeasurement = viewport;
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
      height: 0,
      reference: true,
      arrow: middleware_data.arrow || null,
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

  getItemAlignedPosition(): ItemAlignedContentWrapperStyle | null {
    return this._itemAlignedStyle;
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

/* -------------------------------------------------------------------------------------------------
 * computePositionInItemAlignedMode
 * 纯函数：从 DOM 预先读取的测量值计算 item-aligned 模式下 contentWrapper 的样式
 * 对应 select.tsx SelectItemAlignedPosition 中的 position() 回调
 * -----------------------------------------------------------------------------------------------*/

/** 仅含定位所需字段的矩形描述 */
export interface ItemAlignedRect {
  top: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

/** content 元素的测量值 */
export interface ItemAlignedContentMeasurement {
  rect: ItemAlignedRect;
  borderTopWidth: number;
  paddingTop: number;
  borderBottomWidth: number;
  paddingBottom: number;
  /** content.clientHeight，用于计算 viewportOffsetBottom */
  clientHeight: number;
}

/** viewport 元素的测量值 */
export interface ItemAlignedViewportMeasurement {
  /** viewport.scrollHeight，即所有 item 的总高度 */
  scrollHeight: number;
  /** viewport.offsetTop，相对于 content 的偏移 */
  offsetTop: number;
  /** viewport.offsetHeight */
  offsetHeight: number;
  paddingTop: number;
  paddingBottom: number;
}

/** 选中项的测量值 */
export interface ItemAlignedSelectedItemMeasurement {
  /** selectedItem.offsetTop，相对于 viewport */
  offsetTop: number;
  /** selectedItem.offsetHeight */
  offsetHeight: number;
  /** 是否为列表第一项，影响 top-anchor 时的 clamp 下限 */
  isFirst: boolean;
  /** 是否为列表最后一项，影响 bottom-anchor 时的 clamp 下限 */
  isLast: boolean;
}

export interface ComputePositionItemAlignedInput {
  dir?: "ltr" | "rtl";
  triggerRect: ItemAlignedRect;
  /** trigger 内部展示当前值的 span */
  valueNodeRect: ItemAlignedRect;
  content: ItemAlignedContentMeasurement;
  /** content 内选中项文本节点的 rect */
  itemTextRect: ItemAlignedRect;
  selectedItem: ItemAlignedSelectedItemMeasurement;
  viewport: ItemAlignedViewportMeasurement;
  windowSize: { width: number; height: number };
  /** 视口边距，默认 10 */
  contentMargin?: number;
}

export interface ItemAlignedContentWrapperStyle {
  /** ltr 时有值 */
  left?: number;
  /** rtl 时有值 */
  right?: number;
  minWidth: number;
  /** top-anchor 时为 0 */
  top?: number;
  /** bottom-anchor 时为 0 */
  bottom?: number;
  height: number;
  minHeight: number;
  maxHeight: number;
  /** 例如 "10px 0" */
  margin: string;
}

export interface ComputePositionItemAlignedResult {
  contentWrapperStyle: ItemAlignedContentWrapperStyle;
  /** 仅 top-anchor 时存在，需写入 viewport.scrollTop */
  viewportScrollTop?: number;
}

function clampToRange(value: number, [min, max]: [number, number]): number {
  return Math.min(Math.max(value, min), max);
}

export function computePositionInItemAlignedMode(
  input: ComputePositionItemAlignedInput,
): ComputePositionItemAlignedResult {
  const {
    dir = "ltr",
    triggerRect,
    valueNodeRect,
    content,
    itemTextRect,
    selectedItem,
    viewport,
    windowSize,
    contentMargin = 10,
  } = input;

  // ─── 水平 ────────────────────────────────────────────────────────────────

  let left: number | undefined;
  let right: number | undefined;
  let minWidth: number;

  if (dir !== "rtl") {
    // itemText 在 content 内部的水平偏移（与 content 绝对位置无关的布局常量）
    const itemTextOffset = itemTextRect.left - content.rect.left;
    const desiredLeft = valueNodeRect.left - itemTextOffset;
    const leftDelta = triggerRect.left - desiredLeft;
    minWidth = triggerRect.width + leftDelta;
    const contentWidth = Math.max(minWidth, content.rect.width);
    const rightEdge = windowSize.width - contentMargin;
    left = clampToRange(desiredLeft, [
      contentMargin,
      Math.max(contentMargin, rightEdge - contentWidth),
    ]);
  } else {
    const itemTextOffset = content.rect.right - itemTextRect.right;
    const desiredRight =
      windowSize.width - valueNodeRect.right - itemTextOffset;
    const rightDelta = windowSize.width - triggerRect.right - desiredRight;
    minWidth = triggerRect.width + rightDelta;
    const contentWidth = Math.max(minWidth, content.rect.width);
    const leftEdge = windowSize.width - contentMargin;
    right = clampToRange(desiredRight, [
      contentMargin,
      Math.max(contentMargin, leftEdge - contentWidth),
    ]);
  }

  // ─── 垂直 ────────────────────────────────────────────────────────────────

  const availableHeight = windowSize.height - contentMargin * 2;
  const {
    borderTopWidth,
    paddingTop,
    borderBottomWidth,
    paddingBottom,
    clientHeight,
  } = content;

  const fullContentHeight =
    borderTopWidth +
    paddingTop +
    viewport.scrollHeight +
    paddingBottom +
    borderBottomWidth;
  const minContentHeight = Math.min(
    selectedItem.offsetHeight * 5,
    fullContentHeight,
  );

  // trigger 中心距视口上边缘的距离（减去 margin）
  const topEdgeToTriggerMiddle =
    triggerRect.top + triggerRect.height / 2 - contentMargin;
  const triggerMiddleToBottomEdge = availableHeight - topEdgeToTriggerMiddle;

  const selectedItemHalfHeight = selectedItem.offsetHeight / 2;
  const itemOffsetMiddle = selectedItem.offsetTop + selectedItemHalfHeight;
  // content 顶部到选中项中心的距离
  const contentTopToItemMiddle = borderTopWidth + paddingTop + itemOffsetMiddle;
  const itemMiddleToContentBottom = fullContentHeight - contentTopToItemMiddle;

  // 若 content 顶部到选中项中心 <= trigger 中心到视口顶部，则可以直接 bottom-anchor
  const willAlignWithoutTopOverflow =
    contentTopToItemMiddle <= topEdgeToTriggerMiddle;

  let top: number | undefined;
  let bottom: number | undefined;
  let height: number;
  let viewportScrollTop: number | undefined;

  if (willAlignWithoutTopOverflow) {
    // bottom-anchor：固定底部，向上延伸
    bottom = 0;
    const viewportOffsetBottom =
      clientHeight - viewport.offsetTop - viewport.offsetHeight;
    const clampedTriggerMiddleToBottomEdge = Math.max(
      triggerMiddleToBottomEdge,
      selectedItemHalfHeight +
        (selectedItem.isLast ? viewport.paddingBottom : 0) +
        viewportOffsetBottom +
        borderBottomWidth,
    );
    height = contentTopToItemMiddle + clampedTriggerMiddleToBottomEdge;
  } else {
    // top-anchor：固定顶部，向下延伸，并调整 viewport 的 scrollTop 使选中项可见
    top = 0;
    const clampedTopEdgeToTriggerMiddle = Math.max(
      topEdgeToTriggerMiddle,
      borderTopWidth +
        viewport.offsetTop +
        (selectedItem.isFirst ? viewport.paddingTop : 0) +
        selectedItemHalfHeight,
    );
    height = clampedTopEdgeToTriggerMiddle + itemMiddleToContentBottom;
    viewportScrollTop =
      contentTopToItemMiddle - topEdgeToTriggerMiddle + viewport.offsetTop;
  }

  return {
    contentWrapperStyle: {
      ...(left !== undefined ? { left } : { right }),
      minWidth,
      ...(bottom !== undefined ? { bottom } : { top }),
      height,
      minHeight: minContentHeight,
      maxHeight: availableHeight,
      margin: `${contentMargin}px 0`,
    },
    viewportScrollTop,
  };
}

/* -----------------------------------------------------------------------------------------------*/

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side as Side, align as Align] as const;
}
