import { BaseDomain, Handler, Platform } from "@timeless/base";

import { ScrollViewCore } from "@/scroll-view/index";
import { Logger } from "@/util";

import { compute_position, flip, shift, offset, arrow, size } from "./floating";
import { getPopperPlatform } from "./platform";
import type { Rect, Placement, Strategy, MiddlewareData } from "./types";

const logger = Logger({ prefix: "vm", scope: "popper" });

const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
const ALIGN_OPTIONS = ["start", "center", "end"] as const;
export type Side = (typeof SIDE_OPTIONS)[number];
export type Align = (typeof ALIGN_OPTIONS)[number];

enum Events {
  /** 参考原始被加载 */
  ReferenceMounted,
  ReferenceOutOfView,
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
  [Events.ReferenceOutOfView]: void;
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
  defaultPlaced?: boolean;
  offsetX?: number;
  offsetY?: number;
  /**
   * Popper 关心的可滚动容器
   * 当容器滚动时，可以用来更新 Popper 的位置
   */
  view$?: ScrollViewCore;
  /**
   * 可用空间计算模式
   * - "popper": 根据放置侧计算（底部放置时取上方空间，顶部放置时取下方空间）
   * - "item-aligned": 取视口最大可用空间（内容可以同时向上下延伸）
   */
  mode?: "popper" | "item-aligned";
  platform?: Platform;
};
type PopperState = {
  strategy: Strategy;
  x: number;
  y: number;
  placement: Placement;
  isPlaced: boolean;
  top?: number;
  bottom?: number;
  /** PopperContent height */
  height?: number;
  maxHeight?: number;
  maxWidth?: number;
  minWidth?: number;
  margin?: number;
  viewportOffsetTop?: number;
  /** 浮动元素在放置方向上的可用高度（px） */
  availableHeight?: number;
  /** 浮动元素在交叉轴上的可用宽度（px） */
  availableWidth?: number;
  /** viewport 可以向上滚动 */
  canScrollUp: boolean;
  hideScrollUp?: boolean;
  /** viewport 可以向下滚动 */
  canScrollDown: boolean;
  hideScrollDown?: boolean;
  /** 是否设置了参考DOM */
  reference: boolean;
  arrow: {
    x?: number;
    y?: number;
  } | null;
};
type ItemAlignedAdjustmentData = {
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
};

export class PopperCore extends BaseDomain<TheTypesOfEvents> {
  unique_id = "PopperCore";
  debug = true;

  // side: Side = "bottom";
  // align: Align = "center";
  strategy: Strategy = "fixed";
  offsetX = 0;
  offsetY = 0;
  placement: Placement = "bottom";
  /** 可用空间计算模式
   * - "popper": 根据放置侧计算（底部放置时取下方空间，顶部放置时取上方空间）
   * - "item-aligned": 取视口最大可用空间（内容可以同时向上下延伸）
   */
  mode: "popper" | "item-aligned" = "popper";
  view$?: ScrollViewCore;
  /** Popper 内部的可滚动容器 */
  viewport$: ScrollViewCore;
  platform: Platform;
  reference: {
    getRect: () => Rect;
    $el?: unknown;
  } | null = null;
  floating: {
    getRect: () => Rect;
    $el?: {};
  } | null = null;

  /** item-aligned 模式：viewport 元素（用于 scroll） */
  viewport: { $el?: HTMLElement } | null = null;
  /** 在 place 前设置，place 后就会尝试将 viewport 滚动到这个距离 */
  viewportOffsetTop: null | number = null;
  /** item-aligned 模式：选中的 item 元素 */
  selectedItem: {
    $el?: HTMLElement;
    offsetTop: number;
    offsetHeight: number;
  } | null = null;
  _item: {
    offsetTop: number;
    offsetHeight: number;
    x: number;
    y: number;
  };
  _prev_scroll_top = 0;
  _pending_item_aligned_adjustment: ItemAlignedAdjustmentData | null = null;
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
    reference: false,
    arrow: null,
    availableHeight: 0,
    availableWidth: 0,
    canScrollUp: false,
    canScrollDown: false,
  };

  _enter = false;
  _focus = false;
  _scrolling_subscriber: null | (() => void) = null;

  constructor(props: Partial<{ _name: string }> & Partial<PopperProps> = {}) {
    super(props);

    const {
      _name,
      side = "bottom",
      align = "center",
      strategy,
      offsetX = 0,
      offsetY = 0,
      defaultPlaced = false,
      platform,
      mode = "popper",
      view$,
    } = props;
    if (_name) {
      this.unique_id = _name;
    }
    if (strategy) {
      this.strategy = strategy;
    }
    this.placement = (side +
      (align !== "center" ? "-" + align : "")) as Placement;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.mode = mode;
    this.view$ = view$;
    this.platform = platform ?? getPopperPlatform();
    this.viewport$ = new ScrollViewCore();

    // 监听滚动：优先使用 ScrollViewCore，否则使用 window
    if (view$) {
      view$.onScroll(() => {
        this.handleContainerScroll();
      });
    }
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
    this.flushPendingItemAlignedAdjustment();
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
    logger.log(
      "setFloating",
      "floating:",
      !!floating,
      "hasRef:",
      !!this.reference,
      this.mode,
    );
    if (!floating) {
      this.floating = null;
      // this.state.isPlaced = false;
      // this.emit(Events.StateChange, { ...this.state });
      return;
    }
    this.floating = floating;
    if (this.mode === "popper") {
      this.place();
    }
    this.flushPendingItemAlignedAdjustment();
    this.emit(Events.FloatingMounted, floating);
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
  setViewportOffsetTop(offsetTop: number) {
    this.viewportOffsetTop = offsetTop;
    // this.viewport$.rect.offsetTop = offsetTop;
  }
  /** 设置 item-aligned 模式下选中项的偏移量 */
  flushPendingItemAlignedAdjustment() {
    if (
      this.mode !== "item-aligned" ||
      !this._pending_item_aligned_adjustment ||
      !this.viewport$ ||
      !this.reference ||
      !this.floating
    ) {
      return;
    }
    this.adjustContentPositionWithOffsetTop(
      this._pending_item_aligned_adjustment,
    );
  }
  adjustContentPositionWithOffsetTop(data: ItemAlignedAdjustmentData) {
    this._pending_item_aligned_adjustment = data;
    if (!this.viewport$ || !this.reference || !this.floating) {
      return;
    }

    const reference_rect = this.reference.getRect();
    const floating_rect = this.floating.getRect();
    const window_size = this.platform.getViewportSize();
    const viewport$ = this.viewport$;

    const {
      offsetHeight,
      offsetTop: item_offset_top,
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
    const viewport_data = {
      scrollHeight: viewport$.rect.contentHeight ?? 0,
      offsetTop: viewport$.rect.offsetTop ?? 0,
      offsetHeight: viewport$.rect.height ?? 0,
      paddingTop: viewport$.rect.paddingTop ?? 0,
      paddingBottom: viewport$.rect.paddingBottom ?? 0,
    };

    logger.log("adjustContentPositonWithOffsetTop", viewport_data.offsetTop);

    const content_margin = 10;

    const available_height = window_size.height - content_margin * 2;
    const {
      borderTopWidth: contentBorderTopWidth,
      paddingTop: contentPaddingTop,
      borderBottomWidth: contentBorderBottomWidth,
      paddingBottom: contentPaddingBottom,
      clientHeight: contentClientHeight,
    } = content;

    const full_content_height =
      contentBorderTopWidth +
      contentPaddingTop +
      viewport_data.scrollHeight +
      contentPaddingBottom +
      contentBorderBottomWidth;
    const minContentHeight = Math.min(offsetHeight * 5, full_content_height);

    const top_edge_to_trigger_middle =
      reference_rect.top + reference_rect.height / 2 - content_margin;
    const trigger_middle_to_bottom_edge =
      available_height - top_edge_to_trigger_middle;

    const selected_item_half_height = offsetHeight / 2;
    const item_offset_middle = item_offset_top + selected_item_half_height;
    const content_top_to_item_middle =
      contentBorderTopWidth + contentPaddingTop + item_offset_middle;
    const item_middle_to_content_bottom =
      full_content_height - content_top_to_item_middle;

    const willAlignWithoutTopOverflow =
      content_top_to_item_middle <= top_edge_to_trigger_middle;

    let left: number | undefined;
    let right: number | undefined;
    let min_width: number;
    let top: number | undefined;
    let bottom_val: number | undefined;
    let height: number;
    let viewport_scroll_top: number | undefined;

    // 水平方向计算 (简化版，始终 left 对齐)
    left = reference_rect.left + 1;
    min_width = reference_rect.width - 1;

    this.state.canScrollUp = false;
    this.state.canScrollDown = false;

    // 垂直方向计算
    if (willAlignWithoutTopOverflow) {
      // 放在 trigger 下方
      bottom_val = 0;
      const viewport_offset_bottom =
        contentClientHeight -
        viewport_data.offsetTop -
        viewport_data.offsetHeight;
      const a =
        selected_item_half_height +
        (isLast ? viewport_data.paddingBottom : 0) +
        viewport_offset_bottom +
        contentBorderBottomWidth;
      const clampedTriggerMiddleToBottomEdge = Math.max(
        trigger_middle_to_bottom_edge,
        a,
      );
      const hasAmpleSpace =
        item_middle_to_content_bottom <= trigger_middle_to_bottom_edge;
      if (!hasAmpleSpace) {
        this.state.canScrollDown = true;
      }
      height = Math.min(
        content_top_to_item_middle + clampedTriggerMiddleToBottomEdge,
        available_height,
      );
    } else {
      // 放在 trigger 上部分
      top = 0;
      const content_top_edge_to_trigger_middle =
        contentBorderTopWidth +
        viewport_data.offsetTop +
        (isFirst ? viewport_data.paddingTop : 0) +
        selected_item_half_height;
      // 放在上部，上部分的高度分为两种情况
      // 1、上部空间不足，那么高度就是 顶部到trigger垂直中点的距离
      // 2、上部空间足够，那么高度就是 顶部到trigger垂直中点的距离 + 选中项一半高度
      const hasAmpleSpace =
        content_top_to_item_middle <= top_edge_to_trigger_middle;
      const clampedTopEdgeToTriggerMiddle = Math.max(
        top_edge_to_trigger_middle,
        content_top_edge_to_trigger_middle,
      );
      if (!hasAmpleSpace) {
        this.state.canScrollUp = true;
      }
      logger.log(
        "place to bottom",
        top_edge_to_trigger_middle,
        content_top_edge_to_trigger_middle,
        hasAmpleSpace,
        item_middle_to_content_bottom,
        full_content_height,
        content_top_to_item_middle,
      );
      height = Math.min(
        clampedTopEdgeToTriggerMiddle + item_middle_to_content_bottom,
        available_height,
      );
      viewport_scroll_top =
        content_top_to_item_middle - top_edge_to_trigger_middle;
      // if (hasAmpleSpace) {
      //   viewport_scroll_top += 24;
      // }
    }

    logger.log(
      "before refresh content position",
      height,
      viewport_scroll_top,
      viewport_data.offsetTop,
    );
    this.state.x = left ?? 0;
    this.state.y = 0;
    this.state.top = top;
    this.state.bottom = bottom_val;
    this.state.height = height;
    this.state.minWidth = min_width;
    this.state.margin = content_margin;
    this.state.placement = bottom_val === 0 ? "bottom" : "top";
    this.state.strategy = "fixed";
    this.state.maxHeight = available_height;
    this.state.viewportOffsetTop = viewport_scroll_top;
    this._prev_scroll_top = viewport_scroll_top ?? 0;
    logger.log("item-aligned computed state", {
      referenceRect: reference_rect,
      floatingRect: floating_rect,
      windowSize: window_size,
      content,
      viewport: viewport_data,
      selectedItem: {
        offsetTop: item_offset_top,
        offsetHeight,
        bottom,
        isFirst,
        isLast,
      },
      derived: {
        availableHeight: available_height,
        fullContentHeight: full_content_height,
        minContentHeight,
        topEdgeToTriggerMiddle: top_edge_to_trigger_middle,
        triggerMiddleToBottomEdge: trigger_middle_to_bottom_edge,
        contentTopToItemMiddle: content_top_to_item_middle,
        itemMiddleToContentBottom: item_middle_to_content_bottom,
        willAlignWithoutTopOverflow,
      },
      nextState: {
        x: this.state.x,
        y: this.state.y,
        top: this.state.top,
        bottom: this.state.bottom,
        height: this.state.height,
        minWidth: this.state.minWidth,
        margin: this.state.margin,
        placement: this.state.placement,
        maxHeight: this.state.maxHeight,
        viewportOffsetTop: this.state.viewportOffsetTop,
      },
    });

    // 先出现
    this.state.isPlaced = true;
    logger.log("item-aligned emit StateChange", { ...this.state });
    this.emit(Events.StateChange, { ...this.state });

    // 1s 后滚动到正确的位置
    if (viewport_scroll_top !== undefined) {
      viewport$.setScrollTopSilent(viewport_scroll_top);
    }
    setTimeout(() => {
      // 然后监听滚动，避免设置 scrollTop 触发了 onScroll 事件
      const handleScroll = this.handleViewportScroll.bind(this);
      this._scrolling_subscriber = this.viewport$.onScroll(handleScroll);
    }, 200);

    // setTimeout(() => {
    //   this.state.isPlaced = true;
    //   const handleScroll = this.handleViewportScroll.bind(this);
    //   this._scrolling_subscriber = this.viewport$.onScroll(handleScroll);
    //   this.emit(Events.StateChange, { ...this.state });
    // }, 800);
  }
  realignImmediate() {}
  /** 设置 item-aligned 模式下的 DOM 元素和测量数据 */
  setItemAlignedElements(data: {
    // valueNode: { getBoundingClientRect: () => DOMRect };
    // contentWrapper: { $el?: HTMLElement };
    // viewport: { $el?: HTMLElement };
    selectedItem: {
      $el?: HTMLElement;
      offsetTop: number;
      offsetHeight: number;
    };
    // selectedItemText: { getBoundingClientRect: () => DOMRect };
  }) {
    // this.viewport = data.viewport;
    this.selectedItem = data.selectedItem;
    // this.selectedItemText = data.selectedItemText;
  }
  /** 计算浮动元素位置 */
  async place(source?: { desc: string }) {
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

    const result = await this.computePosition();
    // const { x, y, width, height } = this.reference.getRect();
    const { x, y, middleware_data } = result;
    let x_with_offset = x + this.offsetX;
    let y_with_offset = y + this.offsetY;
    const [placed_side, placed_align] = getSideAndAlignFromPlacement(
      result.placement,
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
    let available_height = undefined;
    let available_width = undefined;
    if (middleware_data.size) {
      if (typeof middleware_data.size.availableHeight === "number") {
        available_height = middleware_data.size.availableHeight;
      }
      if (typeof middleware_data.size.availableWidth === "number") {
        available_width = middleware_data.size.availableWidth;
      }
    }
    const floating_rect = this.floating.getRect();
    // const viewport = this.platform.getViewportSize();
    // available_height = viewport.height - y - 10;
    const content_height = floating_rect.height;
    // const height = Math.min(content_height, available_height);
    // const should_scroll =
    //   content_height > available_height && available_height > 0;
    this.state = {
      x: x_with_offset,
      y: y_with_offset,
      strategy: this.strategy,
      placement: result.placement,
      isPlaced: true,
      reference: true,
      arrow: middleware_data.arrow || null,
      canScrollUp: false,
      canScrollDown: false,
    };
    this.state.height = available_height;
    logger.log("place - before emit placed", {
      source: source?.desc || "unknown",
      x,
      y,
      offsetX: this.offsetX,
      height: this.state.height,
      available_height,
      content_height,
      viewportOffsetTop: this.viewportOffsetTop,
    });
    if (this.viewportOffsetTop !== null) {
      this.viewport$.setScrollTopSilent(this.viewportOffsetTop);
      this.viewportOffsetTop = null;
    }
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
      platform: this.platform,
      middleware,
    });
    logger.log("computePosition result", this.unique_id, {
      x: result.x,
      y: result.y,
      middleware: result.middlewareData,
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

  reset() {
    logger.log("reset");
    this._enter = false;
    this._focus = false;
    this.floating = null;
    this._prev_scroll_top = 0;
    this.state.isPlaced = false;
    this.state.canScrollDown = false;
    this.state.canScrollUp = false;
    this.state.x = 0;
    this.state.y = 0;
    this.state.top = undefined;
    this.state.bottom = undefined;
    this.state.height = undefined;
    this._pending_item_aligned_adjustment = null;
    if (this._scrolling_subscriber) {
      this._scrolling_subscriber();
      this._scrolling_subscriber = null;
    }
    this.emit(Events.StateChange, { ...this.state });
  }

  handleContainerScroll() {
    if (!this.reference || !this.floating || this.state.isPlaced === false) {
      return;
    }
    const ref_rect = this.reference.getRect();
    // 检查参考元素是否在视口内
    const viewport = this.platform.getViewportSize();
    const is_in_viewport =
      ref_rect.top < viewport.height &&
      ref_rect.bottom > 0 &&
      ref_rect.left < viewport.width &&
      ref_rect.right > 0;
    if (!is_in_viewport) {
      this.emit(Events.ReferenceOutOfView);
      return;
    }
    this.place();
  }
  /** viewport 滚动时由 primitive 调用，更新滚动按钮可见性，模拟原生 select 渐进扩展高度 */
  handleViewportScroll(event: {
    scrollTop: number;
    clientHeight: number;
    scrollHeight: number;
  }) {
    const { scrollTop, clientHeight, scrollHeight } = event;
    const can_scroll_up = scrollTop > 0;
    const can_scroll_down = scrollTop + clientHeight < scrollHeight - 1;
    const cur_height = this.state.height ?? 0;
    let target_height = this.state.height;
    const available_height = this.state.maxHeight ?? 0;
    if (this.state.isPlaced && this.mode === "item-aligned") {
      const delta = scrollTop - this._prev_scroll_top;
      const abs_delta = Math.abs(delta);
      this._prev_scroll_top = scrollTop;
      const should_change_height =
        cur_height < available_height && abs_delta > 0;
      logger.log("handle viewport scroll", delta, scrollTop, this.state.height);
      if (should_change_height) {
        target_height += abs_delta;
        if (target_height >= available_height) {
          if (delta < 0) {
            this.state.canScrollDown = true;
            this.state.hideScrollDown = false;
          }
          if (delta > 0) {
            this.state.canScrollUp = true;
            this.state.hideScrollUp = false;
          }
          target_height = available_height;
        }
      }
    }
    logger.log(
      "handle viewport scroll before set state",
      target_height,
      this.state.height,
    );
    if (
      this.state.hideScrollUp === !can_scroll_up &&
      this.state.hideScrollDown === !can_scroll_down &&
      target_height === this.state.height
    ) {
      return;
    }
    this.state.hideScrollUp = !can_scroll_up;
    this.state.hideScrollDown = !can_scroll_down;
    this.state.height = target_height;
    this.emit(Events.StateChange, { ...this.state });
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

  onReferenceMounted(
    handler: Handler<TheTypesOfEvents[Events.ReferenceMounted]>,
  ) {
    return this.on(Events.ReferenceMounted, handler);
  }
  onReferenceOutOfView(
    handler: Handler<TheTypesOfEvents[Events.ReferenceOutOfView]>,
  ) {
    return this.on(Events.ReferenceOutOfView, handler);
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

export { getPopperPlatform, setPopperPlatform } from "./platform";
