import { describe, it, expect } from "vitest";
import { compute_position } from "./compute-position";
import { flip, shift, offset, size } from "./middleware";
import { getMockPlatform } from "./platform/mock";
import { detect_overflow } from "./detect-overflow";
import type { Platform, ComputePositionConfig, MiddlewareState } from "./types";
import type { Placement, Rect } from "./utils";
import {
  computePositionInItemAlignedMode,
  type ItemAlignedRect,
  type ItemAlignedContentMeasurement,
  type ItemAlignedViewportMeasurement,
  type ItemAlignedSelectedItemMeasurement,
  type ComputePositionItemAlignedInput,
} from "../index";

const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 800;

function build_element(
  x: number,
  y: number,
  width: number,
  height: number,
): Rect {
  return {
    x,
    y,
    width,
    height,
  };
}

/**
 * 创建符合 computePosition 接口的 mock 元素。
 * computePosition 要求 { getRect: () => Rect }，而不是 getBoundingClientRect。
 */
function build_reference(rect: Rect) {
  return {
    getRect: () => rect,
    getBoundingClientRect: () => ({
      ...rect,
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height,
    }),
    offsetWidth: rect.width,
    offsetHeight: rect.height,
  };
}

/**
 * 创建带有完整 detectOverflow 支持的 mock platform。
 * 手动实现 detectOverflow，使其基于 viewport 边界判断溢出。
 */
function create_test_platform(
  viewportRect: Rect = {
    x: 0,
    y: 0,
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  },
): Platform {
  const detectOverflowForTest = async (
    state: MiddlewareState,
    options: any = {},
  ): Promise<{ top: number; bottom: number; left: number; right: number }> => {
    const { x, y, rects } = state;
    const padding = options.padding ?? 0;

    const floatingLeft = x;
    const floatingTop = y;
    const floatingRight = x + rects.floating.width;
    const floatingBottom = y + rects.floating.height;

    return {
      top: padding + viewportRect.y - floatingTop,
      bottom: floatingBottom - (viewportRect.y + viewportRect.height) + padding,
      left: padding + viewportRect.x - floatingLeft,
      right: floatingRight - (viewportRect.x + viewportRect.width) + padding,
    };
  };

  const platform = getMockPlatform();

  return {
    ...platform,
    getElementRects: ({ reference, floating }) => ({
      reference: (reference as any).getRect(),
      floating: (floating as any).getRect(),
    }),
    getClippingRect: () => viewportRect,
    getDimensions: (element: any) => {
      const rect = element.getRect?.() || { width: 0, height: 0 };
      return { width: rect.width, height: rect.height };
    },
    getOffsetParent: () => null,
    isElement: (value: any) => typeof value === "object" && value !== null,
    isRTL: () => false,
    detectOverflow: detectOverflowForTest,
  };
}

describe("computePosition", () => {
  describe("基础位置计算", () => {
    it("应正确计算 bottom 放置位置", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 150, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        placement: "bottom",
        platform,
      });

      expect(result.placement).toBe("bottom");
      expect(result.x).toBe(125);
      expect(result.y).toBe(150);
    });

    it("应正确计算 top 放置位置", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 150, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "top",
      });

      expect(result.placement).toBe("top");
      expect(result.x).toBe(125);
      expect(result.y).toBe(0);
    });

    it("应正确计算 right 放置位置", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 150, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "right",
      });

      expect(result.placement).toBe("right");
      expect(result.x).toBe(300);
      expect(result.y).toBe(75);
    });

    it("应正确计算 left 放置位置", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 150, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "left",
      });

      expect(result.placement).toBe("left");
      expect(result.x).toBe(-50);
      expect(result.y).toBe(75);
    });

    it("应正确计算 bottom-start 放置位置", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 150, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom-start",
      });

      expect(result.placement).toBe("bottom-start");
      expect(result.y).toBe(150);
      expect(result.x).toBe(100);
    });

    it("应正确计算 bottom-end 放置位置", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 150, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom-end",
      });

      expect(result.placement).toBe("bottom-end");
      expect(result.y).toBe(150);
      expect(result.x).toBe(150);
    });
  });

  describe("flip 中间件", () => {
    it("当底部空间不足时应翻转到顶部", async () => {
      const reference = build_reference(
        build_element(100, VIEWPORT_HEIGHT - 100, 200, 50),
      );
      const floating = build_reference(build_element(0, 0, 200, 150));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom",
        middleware: [flip()],
      });

      expect(result.placement).toBe("top");
      expect(result.y).toBe(VIEWPORT_HEIGHT - 100 - 150); // ref.y - floating.height
    });

    it("底部空间足够时应保持原位置", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 200, 150));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom",
        middleware: [flip()],
      });

      expect(result.placement).toBe("bottom");
      expect(result.y).toBe(150);
    });
  });

  it("当底部空间不足时应翻转到顶部，但是顶部空间也不够", async () => {
    const reference = {
      getRect() {
        return { x: 300, y: 690, width: 643, height: 32 };
      },
    };
    const floating = {
      getRect() {
        return { x: 0, y: 0, width: 186, height: 1688 };
      },
    };
    const platform = create_test_platform();

    const result = await compute_position(reference, floating, {
      platform,
      placement: "bottom",
      middleware: [flip()],
    });

    expect(result.placement).toBe("top");
    expect(result.y).toBe(VIEWPORT_HEIGHT - 100 - 150); // ref.y - floating.height
  });

  describe("offset + flip + shift 完整管线", () => {
    it("正常场景：reference 在视口中部，floating 尺寸适中", async () => {
      // 模拟 Select trigger 在页面中部
      const reference = build_reference(build_element(266, 300, 200, 36));
      const floating = build_reference(build_element(0, 0, 200, 250));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom-start",
        middleware: [
          offset(4),
          flip(),
          shift({ padding: 8 }),
          size({ padding: 8 }),
        ],
      });

      expect(result.placement).toBe("bottom-start");
      // y = reference.y + reference.height + offset = 300 + 36 + 4 = 340
      expect(result.y).toBe(340);
      expect(result.x).toBe(266);
      // 浮动元素底部 = 340 + 250 = 590，在 800 的视口内，不翻转
      expect(result.y + 250).toBeLessThan(VIEWPORT_HEIGHT);
    });
  });

  describe("BUG 复现: y=-2308 — 浮动元素未约束高度导致错误翻转", () => {
    it("浮动元素高度远超视口时，flip 翻转到 top 导致 y 为大负数", async () => {
      // 真实场景：Select 有大量选项，弹出层没有 max-height 约束
      // reference 在视口中下部 (x:266, y:336)
      // floating 包含全部选项，高度 ~2644px（未约束）
      //
      // 关键条件：viewport 高度较小（如笔记本/DevTools 打开时 600px）
      // 使得 2*ref.y + ref.height > viewport.height (2*336+36=708 > 600)
      // 此时 flip 认为 bottom 溢出更多（ref 在下半部），选择翻转到 top
      const reference = build_reference(build_element(266, 336, 200, 36));
      const floating = build_reference(build_element(0, 0, 200, 2644));
      const smallViewport = create_test_platform({
        x: 0,
        y: 0,
        width: VIEWPORT_WIDTH,
        height: 600, // 小视口：笔记本或 DevTools 打开时
      });

      const result = await compute_position(reference, floating, {
        platform: smallViewport,
        placement: "bottom-start",
        middleware: [
          offset(4),
          flip({ fallbackStrategy: "bestFit" }),
          shift({ padding: 8 }),
          size({ padding: 8 }),
        ],
      });

      console.log("[BUG] result:", {
        placement: result.placement,
        x: result.x,
        y: result.y,
        availableHeight: result.middlewareData.size?.availableHeight,
      });

      // flip 的 bestFit 逻辑：
      // bottom 溢出: y_bottom + floating.height - viewport.height
      //   = (336+36+4) + 2644 - 600 = 2420
      // top 溢出: 0 - (336 - 2644 - 4) = 2312
      // top 溢出 (2312) < bottom 溢出 (2420)，所以 flip 选择 top
      //
      // 翻转后 y = ref.y - floating.height - offset = 336 - 2644 - 4 = -2312
      // shift 不改变主轴，所以最终 y 仍是大负数
      expect(result.placement).toMatch(/^top/);
      expect(result.y).toBeLessThan(-2000);
    });

    it("BUG: flip 翻转后 y=-2315 超出视口，完全不可见", async () => {
      // 用户实际遇到的数据：reference 在视口下半部 (y=497)
      // 2*497 + 32 = 1026 > 800(viewport)，满足翻转条件
      const reference = build_reference(build_element(266, 497, 169, 32));
      const floating = build_reference(build_element(0, 0, 169, 2808));
      const platform = create_test_platform(); // 标准 800px 视口即可复现

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom-start",
        middleware: [
          offset(4),
          flip({ fallbackStrategy: "bestFit" }),
          shift({ padding: 8 }),
          size({ padding: 8 }),
        ],
      });

      // 当前实现的 bug：flip 选择 top 后 y = ref.y - floating.height - offset = -2315
      // 完全不可见
      expect(result.placement).toMatch(/^top/);
      expect(result.x).toBe(266);
      expect(result.y).toBe(-2315);
      expect(result.y).toBeLessThan(0);
    });

    it("FIX: 使用 flip 默认行为，size 约束高度后可正确显示", async () => {
      const reference = build_reference(build_element(266, 497, 169, 32));
      const floating = build_reference(build_element(0, 0, 169, 2808));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom-start",
        middleware: [
          offset(4),
          flip(),
          shift({ padding: 8 }),
          size({ padding: 8 }),
        ],
      });

      // flip 默认 fallbackStrategy: 'bestFit' 会选择溢出最小的 placement
      // 但 floating 太高，任何 placement 都会溢出
      // 最终 fallbackStrategy 会回退，但不再产生负数坐标
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it("使用 size middleware 的 availableHeight 可以知道该约束到多少", async () => {
      const reference = build_reference(build_element(266, 336, 200, 36));
      const floating = build_reference(build_element(0, 0, 200, 2644));
      const smallViewport = create_test_platform({
        x: 0,
        y: 0,
        width: VIEWPORT_WIDTH,
        height: 600,
      });

      const result = await compute_position(reference, floating, {
        platform: smallViewport,
        placement: "bottom-start",
        middleware: [
          offset(4),
          flip(),
          shift({ padding: 8 }),
          size({ padding: 8 }),
        ],
      });

      const sizeData = result.middlewareData.size;
      expect(sizeData).toBeDefined();
      // size middleware 计算出的可用高度应该远小于浮动元素实际高度
      expect(sizeData.availableHeight).toBeLessThan(2644);
      expect(sizeData.availableHeight).toBeGreaterThan(0);
    });

    it("如果浮动元素已被约束到合理高度，定位应该正确", async () => {
      // 模拟浮动元素已经应用了 max-height 约束后的情况
      const reference = build_reference(build_element(266, 336, 200, 36));
      // 假设 max-height 约束为 400px（视口底部有 800 - 336 - 36 - 4 = 424px 空间）
      const floating = build_reference(build_element(0, 0, 200, 400));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom-start",
        middleware: [
          offset(4),
          flip(),
          shift({ padding: 8 }),
          size({ padding: 8 }),
        ],
      });

      // 不翻转，bottom-start 放置
      expect(result.placement).toBe("bottom-start");
      expect(result.y).toBe(336 + 36 + 4); // = 376
      // 底部 = 376 + 400 = 776，在 800 视口内
      expect(result.y + 400).toBeLessThanOrEqual(VIEWPORT_HEIGHT);
    });
  });

  describe("边界情况", () => {
    it("参考元素和浮动元素尺寸相同时应正确计算", async () => {
      const reference = build_reference(build_element(100, 100, 100, 100));
      const floating = build_reference(build_element(0, 0, 100, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom",
      });

      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });

    it("应返回正确的 strategy", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 150, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom",
        strategy: "absolute",
      });

      expect(result.strategy).toBe("absolute");
    });

    it("应返回 middlewareData", async () => {
      const reference = build_reference(build_element(100, 100, 200, 50));
      const floating = build_reference(build_element(0, 0, 150, 100));
      const platform = create_test_platform();

      const result = await compute_position(reference, floating, {
        platform,
        placement: "bottom",
        middleware: [flip(), shift()],
      });

      expect(result.middlewareData).toBeDefined();
      expect(typeof result.middlewareData).toBe("object");
    });
  });

  describe("四边定位精度测试", () => {
    const testPlacements: Placement[] = [
      "top",
      "bottom",
      "left",
      "right",
      "top-start",
      "top-end",
      "bottom-start",
      "bottom-end",
      "left-start",
      "left-end",
      "right-start",
      "right-end",
    ];

    testPlacements.forEach((placement) => {
      it(`应正确处理 ${placement} 定位`, async () => {
        const reference = build_reference(build_element(500, 400, 200, 50));
        const floating = build_reference(build_element(0, 0, 150, 100));
        const platform = create_test_platform();

        const result = await compute_position(reference, floating, {
          platform,
          placement,
        });

        expect(result.placement).toBe(placement);
        expect(typeof result.x).toBe("number");
        expect(typeof result.y).toBe("number");
        expect(isFinite(result.x)).toBe(true);
        expect(isFinite(result.y)).toBe(true);
      });
    });
  });
});

/* -------------------------------------------------------------------------------------------------
 * computePositionInItemAlignedMode
 * -----------------------------------------------------------------------------------------------*/

/** 从 top/left/width/height 构造 ItemAlignedRect */
function build_ia_rect(
  top: number,
  left: number,
  width: number,
  height: number,
): ItemAlignedRect {
  return { top, left, right: left + width, width, height };
}

/** 默认 content 测量值 */
function build_content(
  rect: ItemAlignedRect,
  overrides: Partial<Omit<ItemAlignedContentMeasurement, "rect">> = {},
): ItemAlignedContentMeasurement {
  return {
    rect,
    borderTopWidth: 1,
    paddingTop: 8,
    borderBottomWidth: 1,
    paddingBottom: 8,
    clientHeight: 200,
    ...overrides,
  };
}

/** 默认 viewport 测量值 */
function build_viewport(
  scrollHeight: number,
  overrides: Partial<ItemAlignedViewportMeasurement> = {},
): ItemAlignedViewportMeasurement {
  return {
    scrollHeight,
    offsetTop: 9,
    offsetHeight: 182,
    paddingTop: 4,
    paddingBottom: 4,
    ...overrides,
  };
}

/** 默认 selectedItem 测量值 */
function build_item(
  offsetTop: number,
  offsetHeight: number,
  overrides: Partial<ItemAlignedSelectedItemMeasurement> = {},
): ItemAlignedSelectedItemMeasurement {
  return {
    offsetTop,
    offsetHeight,
    isFirst: false,
    isLast: false,
    ...overrides,
  };
}

describe("computePositionInItemAlignedMode", () => {
  const WINDOW = { width: 1280, height: 800 };

  // ─── 水平定位 ────────────────────────────────────────────────────────────

  describe("水平定位 (LTR)", () => {
    it("valueNode 与 itemText 左边界正确对齐", () => {
      // itemTextOffset = itemTextRect.left - content.rect.left = 70 - 50 = 20
      // desiredLeft = valueNodeRect.left - itemTextOffset = 110 - 20 = 90
      // leftDelta = triggerRect.left - desiredLeft = 100 - 90 = 10
      // minWidth = triggerWidth + leftDelta = 200 + 10 = 210
      const result = computePositionInItemAlignedMode({
        dir: "ltr",
        triggerRect: build_ia_rect(0, 100, 200, 0),
        valueNodeRect: build_ia_rect(0, 110, 180, 0),
        content: build_content(build_ia_rect(0, 50, 300, 0)),
        itemTextRect: build_ia_rect(0, 70, 200, 0),
        selectedItem: build_item(0, 36),
        viewport: build_viewport(300),
        windowSize: WINDOW,
      });

      expect(result.contentWrapperStyle.left).toBe(90);
      expect(result.contentWrapperStyle.minWidth).toBe(210);
      expect(result.contentWrapperStyle.right).toBeUndefined();
    });

    it("content 接近视口右边界时 left 被 clamp", () => {
      // desiredLeft = 210 - (160-150) = 200
      // clampMax = rightEdge - contentWidth = (400-10) - max(180, 200) = 390 - 200 = 190
      // clampToRange(200, [10, 190]) → 190
      const result = computePositionInItemAlignedMode({
        dir: "ltr",
        triggerRect: build_ia_rect(0, 200, 180, 0),
        valueNodeRect: build_ia_rect(0, 210, 160, 0),
        content: build_content(build_ia_rect(0, 150, 200, 0)),
        itemTextRect: build_ia_rect(0, 160, 180, 0),
        selectedItem: build_item(0, 36),
        viewport: build_viewport(300),
        windowSize: { width: 400, height: 800 },
      });

      expect(result.contentWrapperStyle.left).toBe(190);
      expect(result.contentWrapperStyle.minWidth).toBe(180);
    });
  });

  describe("水平定位 (RTL)", () => {
    it("right 值根据 itemText 与 valueNode 右边界对齐计算", () => {
      // itemTextOffset = content.rect.right - itemTextRect.right = 1230 - 1210 = 20
      // desiredRight = windowWidth - valueNodeRect.right - itemTextOffset = 1280 - 1070 - 20 = 190
      // rightDelta = windowWidth - triggerRect.right - desiredRight = 1280 - 1080 - 190 = 10
      // minWidth = 200 + 10 = 210
      // clampToRange(190, [10, 920]) = 190
      const result = computePositionInItemAlignedMode({
        dir: "rtl",
        triggerRect: build_ia_rect(0, 880, 200, 0),
        valueNodeRect: build_ia_rect(0, 890, 180, 0),
        content: build_content(build_ia_rect(0, 880, 350, 0)),
        itemTextRect: build_ia_rect(0, 900, 310, 0),
        selectedItem: build_item(0, 36),
        viewport: build_viewport(300),
        windowSize: WINDOW,
      });

      expect(result.contentWrapperStyle.right).toBe(190);
      expect(result.contentWrapperStyle.minWidth).toBe(210);
      expect(result.contentWrapperStyle.left).toBeUndefined();
    });
  });

  // ─── 垂直定位 ────────────────────────────────────────────────────────────

  describe("垂直定位 - bottom-anchor（不超出顶部）", () => {
    it("selected item 在中间：使用 bottom=0 定位，height 正确", () => {
      // topEdgeToTriggerMiddle = 400 + 20 - 10 = 410
      // contentTopToItemMiddle = 1 + 8 + (100+18) = 127
      // 127 <= 410 → bottom-anchor
      // viewportOffsetBottom = 200 - 9 - 182 = 9
      // clampedBottom = max(780-410, 18+0+9+1) = max(370, 28) = 370
      // height = 127 + 370 = 497
      const result = computePositionInItemAlignedMode({
        dir: "ltr",
        triggerRect: build_ia_rect(400, 0, 200, 40),
        valueNodeRect: build_ia_rect(0, 0, 0, 0),
        content: build_content(build_ia_rect(0, 0, 200, 0)),
        itemTextRect: build_ia_rect(0, 0, 0, 0),
        selectedItem: build_item(100, 36),
        viewport: build_viewport(300),
        windowSize: WINDOW,
      });

      expect(result.contentWrapperStyle.bottom).toBe(0);
      expect(result.contentWrapperStyle.top).toBeUndefined();
      expect(result.contentWrapperStyle.height).toBe(497);
      expect(result.viewportScrollTop).toBeUndefined();
    });

    it("minHeight = min(offsetHeight*5, fullContentHeight)", () => {
      // fullContentHeight = 1+8+300+8+1 = 318, offsetHeight*5 = 180 → minHeight = 180
      const result = computePositionInItemAlignedMode({
        dir: "ltr",
        triggerRect: build_ia_rect(400, 0, 200, 40),
        valueNodeRect: build_ia_rect(0, 0, 0, 0),
        content: build_content(build_ia_rect(0, 0, 200, 0)),
        itemTextRect: build_ia_rect(0, 0, 0, 0),
        selectedItem: build_item(100, 36),
        viewport: build_viewport(300),
        windowSize: WINDOW,
      });

      expect(result.contentWrapperStyle.minHeight).toBe(180);
      expect(result.contentWrapperStyle.maxHeight).toBe(780);
      expect(result.contentWrapperStyle.margin).toBe("10px 0");
    });

    it("isLast=true 使 clampedTriggerMiddleToBottomEdge 增大", () => {
      // trigger 接近底部：triggerMiddleToBottomEdge = 90
      // viewportOffsetBottom = 200 - 9 - 82 = 109
      // Without isLast: max(90, 18+0+109+1) = 128 → height = 91 + 128 = 219
      // With isLast:    max(90, 18+4+109+1) = 132 → height = 91 + 132 = 223
      const base: ComputePositionItemAlignedInput = {
        dir: "ltr",
        triggerRect: build_ia_rect(680, 0, 200, 40),
        valueNodeRect: build_ia_rect(0, 0, 0, 0),
        content: build_content(build_ia_rect(0, 0, 200, 0), {
          clientHeight: 200,
        }),
        itemTextRect: build_ia_rect(0, 0, 0, 0),
        selectedItem: build_item(64, 36),
        viewport: build_viewport(100, { offsetHeight: 82, paddingBottom: 4 }),
        windowSize: WINDOW,
      };

      const without_isLast = computePositionInItemAlignedMode(base);
      const with_isLast = computePositionInItemAlignedMode({
        ...base,
        selectedItem: build_item(64, 36, { isLast: true }),
      });

      expect(without_isLast.contentWrapperStyle.height).toBe(219);
      expect(with_isLast.contentWrapperStyle.height).toBe(223);
    });
  });

  describe("垂直定位 - top-anchor（超出顶部）", () => {
    it("selected item 较深：使用 top=0，返回 viewportScrollTop", () => {
      // topEdgeToTriggerMiddle = 100 + 20 - 10 = 110
      // contentTopToItemMiddle = 1 + 8 + (200+18) = 227
      // 227 > 110 → top-anchor
      // clampedTop = max(110, 1+9+0+18) = max(110, 28) = 110
      // itemMiddleToContentBottom = 418 - 227 = 191
      // height = 110 + 191 = 301
      // viewportScrollTop = 227 - 110 + 9 = 126
      const result = computePositionInItemAlignedMode({
        dir: "ltr",
        triggerRect: build_ia_rect(100, 0, 200, 40),
        valueNodeRect: build_ia_rect(0, 0, 0, 0),
        content: build_content(build_ia_rect(0, 0, 200, 0)),
        itemTextRect: build_ia_rect(0, 0, 0, 0),
        selectedItem: build_item(200, 36),
        viewport: build_viewport(400),
        windowSize: WINDOW,
      });

      expect(result.contentWrapperStyle.top).toBe(0);
      expect(result.contentWrapperStyle.bottom).toBeUndefined();
      expect(result.contentWrapperStyle.height).toBe(301);
      expect(result.viewportScrollTop).toBe(126);
    });

    it("isFirst=true 使 clampedTopEdgeToTriggerMiddle 增大", () => {
      // trigger 接近顶部：topEdgeToTriggerMiddle = 15 + 20 - 10 = 25
      // Without isFirst: max(25, 1+9+0+18) = max(25, 28) = 28 → height = 28 + 191 = 219
      // With isFirst:    max(25, 1+9+4+18) = max(25, 32) = 32 → height = 32 + 191 = 223
      const base: ComputePositionItemAlignedInput = {
        dir: "ltr",
        triggerRect: build_ia_rect(15, 0, 200, 40),
        valueNodeRect: build_ia_rect(0, 0, 0, 0),
        content: build_content(build_ia_rect(0, 0, 200, 0)),
        itemTextRect: build_ia_rect(0, 0, 0, 0),
        selectedItem: build_item(200, 36),
        viewport: build_viewport(400, { paddingTop: 4 }),
        windowSize: WINDOW,
      };

      const without_isFirst = computePositionInItemAlignedMode(base);
      const with_isFirst = computePositionInItemAlignedMode({
        ...base,
        selectedItem: build_item(200, 36, { isFirst: true }),
      });

      expect(without_isFirst.contentWrapperStyle.height).toBe(219);
      expect(with_isFirst.contentWrapperStyle.height).toBe(223);
      // viewportScrollTop 不受 isFirst 影响
      expect(without_isFirst.viewportScrollTop).toBe(
        with_isFirst.viewportScrollTop,
      );
    });
  });

  // ─── contentMargin ───────────────────────────────────────────────────────

  describe("contentMargin", () => {
    it("默认 contentMargin 为 10，体现在 maxHeight 和 margin 字段", () => {
      const result = computePositionInItemAlignedMode({
        dir: "ltr",
        triggerRect: build_ia_rect(400, 0, 200, 40),
        valueNodeRect: build_ia_rect(0, 0, 0, 0),
        content: build_content(build_ia_rect(0, 0, 200, 0)),
        itemTextRect: build_ia_rect(0, 0, 0, 0),
        selectedItem: build_item(100, 36),
        viewport: build_viewport(300),
        windowSize: { width: 1280, height: 800 },
      });

      // maxHeight = 800 - 10*2 = 780
      expect(result.contentWrapperStyle.maxHeight).toBe(780);
      expect(result.contentWrapperStyle.margin).toBe("10px 0");
    });

    it("自定义 contentMargin=20 影响 maxHeight、topEdgeToTriggerMiddle 和 margin", () => {
      // topEdgeToTriggerMiddle = 400 + 20 - 20 = 400
      // availableHeight = 800 - 40 = 760
      // triggerMiddleToBottomEdge = 760 - 400 = 360
      // contentTopToItemMiddle = 127（不变）→ bottom-anchor
      // clampedBottom = max(360, 28) = 360
      // height = 127 + 360 = 487
      const result = computePositionInItemAlignedMode({
        dir: "ltr",
        triggerRect: build_ia_rect(400, 0, 200, 40),
        valueNodeRect: build_ia_rect(0, 0, 0, 0),
        content: build_content(build_ia_rect(0, 0, 200, 0)),
        itemTextRect: build_ia_rect(0, 0, 0, 0),
        selectedItem: build_item(100, 36),
        viewport: build_viewport(300),
        windowSize: { width: 1280, height: 800 },
        contentMargin: 20,
      });

      expect(result.contentWrapperStyle.maxHeight).toBe(760);
      expect(result.contentWrapperStyle.height).toBe(487);
      expect(result.contentWrapperStyle.margin).toBe("20px 0");
    });
  });
});
