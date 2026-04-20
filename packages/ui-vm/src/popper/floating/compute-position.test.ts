import { describe, it, expect } from "vitest";
import { compute_position } from "./compute-position";
import { flip, shift, offset, size } from "./middleware";
import { getMockPlatform } from "./platform/mock";
import { detect_overflow } from "./detect-overflow";
import type { Platform, ComputePositionConfig, MiddlewareState } from "./types";
import type { Placement, Rect } from "./utils";

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
