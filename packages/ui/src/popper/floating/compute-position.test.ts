import { describe, it, expect } from "vitest";
import { computePosition } from "./compute-position";
import { flip, shift } from "./middleware";
import { getDOMPlatform } from "./platform";
import { detectOverflow } from "./detect-overflow";
import type { Platform, ComputePositionConfig, MiddlewareState } from "./types";
import type { Placement, Rect } from "./utils";

const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 800;

const createMockPlatform = (overrides: Partial<Platform> = {}): Platform => ({
  ...getDOMPlatform(),
  ...overrides,
});

const createMockRect = (
  x: number,
  y: number,
  width: number,
  height: number,
) => ({
  x,
  y,
  width,
  height,
});

const createMockElement = (rect: ReturnType<typeof createMockRect>) => ({
  getBoundingClientRect: () => ({
    x: rect.x,
    y: rect.y,
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height,
    width: rect.width,
    height: rect.height,
  }),
  offsetWidth: rect.width,
  offsetHeight: rect.height,
});

const createTestPlatform = (
  referenceRect: Rect,
  floatingRect: Rect,
  viewportRect: Rect = {
    x: 0,
    y: 0,
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
  },
): Platform => {
  const platform = getDOMPlatform();

  return {
    ...platform,
    getElementRects: () => ({
      reference: referenceRect,
      floating: floatingRect,
    }),
    getClippingRect: () => viewportRect,
    getDimensions: (element: any) => {
      if (element === "reference")
        return { width: referenceRect.width, height: referenceRect.height };
      if (element === "floating")
        return { width: floatingRect.width, height: floatingRect.height };
      return { width: 0, height: 0 };
    },
    getOffsetParent: () => null,
    isElement: (value: any) => typeof value === "object" && value !== null,
    isRTL: () => false,
  };
};

const createFlipTestPlatform = (
  referenceRect: Rect,
  floatingRect: Rect,
): Platform => {
  const platform = createTestPlatform(referenceRect, floatingRect);

  const detectOverflowForTest = async (
    state: MiddlewareState,
    options: any = {},
  ): Promise<{ top: number; bottom: number; left: number; right: number }> => {
    const { x, y, placement, rects, strategy } = state;
    const viewport = {
      x: 0,
      y: 0,
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
    };

    const floatingLeft = x;
    const floatingTop = y;
    const floatingRight = x + rects.floating.width;
    const floatingBottom = y + rects.floating.height;

    const padding = options.padding ?? 0;

    return {
      top: padding - floatingTop,
      bottom: floatingBottom - viewport.height - padding,
      left: padding - floatingLeft,
      right: floatingRight - viewport.width - padding,
    };
  };

  return {
    ...platform,
    detectOverflow: detectOverflowForTest,
  };
};

describe("computePosition", () => {
  describe("基础位置计算", () => {
    it("应正确计算 bottom 放置位置", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
      });

      expect(result.placement).toBe("bottom");
      expect(result.x).toBe(125);
      expect(result.y).toBe(150);
    });

    it("应正确计算 top 放置位置", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "top",
      });

      expect(result.placement).toBe("top");
      expect(result.x).toBe(125);
      expect(result.y).toBe(0);
    });

    it("应正确计算 right 放置位置", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "right",
      });

      expect(result.placement).toBe("right");
      expect(result.x).toBe(300);
      expect(result.y).toBe(75);
    });

    it("应正确计算 left 放置位置", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "left",
      });

      expect(result.placement).toBe("left");
      expect(result.x).toBe(-50);
      expect(result.y).toBe(75);
    });

    it("应正确计算 bottom-start 放置位置", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom-start",
      });

      expect(result.placement).toBe("bottom-start");
      expect(result.y).toBe(150);
      expect(result.x).toBe(100);
    });

    it("应正确计算 bottom-end 放置位置", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom-end",
      });

      expect(result.placement).toBe("bottom-end");
      expect(result.y).toBe(150);
      expect(result.x).toBe(150);
    });
  });

  describe("居中参考元素定位", () => {
    it("应正确放置在视口中心的参考元素下方", async () => {
      const centerX = VIEWPORT_WIDTH / 2;
      const centerY = VIEWPORT_HEIGHT / 2;
      const reference = createMockElement(
        createMockRect(centerX - 100, centerY - 25, 200, 50),
      );
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
      });

      expect(result.x).toBe(centerX - 75);
      expect(result.y).toBe(centerY + 25);
    });

    it("应正确放置在视口中心的参考元素上方", async () => {
      const centerX = VIEWPORT_WIDTH / 2;
      const centerY = VIEWPORT_HEIGHT / 2;
      const reference = createMockElement(
        createMockRect(centerX - 100, centerY - 25, 200, 50),
      );
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "top",
      });

      expect(result.x).toBe(centerX - 75);
      expect(result.y).toBe(centerY - 125);
    });

    it("应正确放置在视口中心的参考元素右侧", async () => {
      const centerX = VIEWPORT_WIDTH / 2;
      const centerY = VIEWPORT_HEIGHT / 2;
      const reference = createMockElement(
        createMockRect(centerX - 100, centerY - 25, 200, 50),
      );
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "right",
      });

      expect(result.x).toBe(centerX + 100);
      expect(result.y).toBe(centerY - 50);
    });

    it("应正确放置在视口中心的参考元素左侧", async () => {
      const centerX = VIEWPORT_WIDTH / 2;
      const centerY = VIEWPORT_HEIGHT / 2;
      const reference = createMockElement(
        createMockRect(centerX - 100, centerY - 25, 200, 50),
      );
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "left",
      });

      expect(result.x).toBe(centerX - 250);
      expect(result.y).toBe(centerY - 50);
    });
  });

  describe("参考元素靠近边缘定位", () => {
    describe("靠近左边缘", () => {
      it("应正确放置在左边缘参考元素的右侧", async () => {
        const reference = createMockElement(createMockRect(10, 100, 200, 50));
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
          platform,
          placement: "right",
        });

        expect(result.x).toBe(210);
        expect(result.y).toBe(75);
      });

      it("应正确放置在左边缘参考元素的下方（居中）", async () => {
        const reference = createMockElement(createMockRect(10, 100, 200, 50));
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
          platform,
          placement: "bottom",
        });

        expect(result.x).toBe(35);
        expect(result.y).toBe(150);
      });
    });

    describe("靠近右边缘", () => {
      it("应正确放置在右边缘参考元素的左侧", async () => {
        const reference = createMockElement(
          createMockRect(VIEWPORT_WIDTH - 210, 100, 200, 50),
        );
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
          platform,
          placement: "left",
        });

        expect(result.x).toBe(VIEWPORT_WIDTH - 360);
        expect(result.y).toBe(75);
      });

      it("应正确放置在右边缘参考元素的下方（居中）", async () => {
        const reference = createMockElement(
          createMockRect(VIEWPORT_WIDTH - 210, 100, 200, 50),
        );
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
          platform,
          placement: "bottom",
        });

        expect(result.x).toBe(VIEWPORT_WIDTH - 185);
        expect(result.y).toBe(150);
      });
    });

    describe("靠近上边缘", () => {
      it("应正确放置在上边缘参考元素的下方", async () => {
        const reference = createMockElement(createMockRect(100, 10, 200, 50));
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
          platform,
          placement: "bottom",
        });

        expect(result.x).toBe(125);
        expect(result.y).toBe(60);
      });

      it("应正确放置在上边缘参考元素的右侧", async () => {
        const reference = createMockElement(createMockRect(100, 10, 200, 50));
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
          platform,
          placement: "right",
        });

        expect(result.x).toBe(300);
        expect(result.y).toBe(-15);
      });
    });

    describe("靠近下边缘", () => {
      it("应正确放置在下边缘参考元素的上方", async () => {
        const reference = createMockElement(
          createMockRect(100, VIEWPORT_HEIGHT - 60, 200, 50),
        );
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
          platform,
          placement: "top",
        });

        expect(result.x).toBe(125);
        expect(result.y).toBe(VIEWPORT_HEIGHT - 160);
      });

      it("应正确放置在下边缘参考元素的右侧", async () => {
        const reference = createMockElement(
          createMockRect(100, VIEWPORT_HEIGHT - 60, 200, 50),
        );
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
          platform,
          placement: "right",
        });

        expect(result.x).toBe(300);
        expect(result.y).toBe(VIEWPORT_HEIGHT - 85);
      });
    });
  });

  describe("flip 中间件 - 空间不足时调整位置", () => {
    it("当底部空间不足时应翻转到顶部", async () => {
      const referenceRect = createMockRect(100, VIEWPORT_HEIGHT - 100, 200, 50);
      const floatingRect = createMockRect(0, 0, 200, 150);
      const platform = createFlipTestPlatform(referenceRect, floatingRect);

      const result = await computePosition(
        { getBoundingClientRect: () => referenceRect } as any,
        { getBoundingClientRect: () => floatingRect } as any,
        {
          platform,
          placement: "bottom",
          middleware: [flip()],
        },
      );

      expect(result.placement).toBe("top");
      expect(result.y).toBeLessThan(VIEWPORT_HEIGHT - 50);
    });

    it("当顶部空间不足时应翻转到底部", async () => {
      const referenceRect = createMockRect(100, 50, 200, 50);
      const floatingRect = createMockRect(0, 0, 200, 150);
      const platform = createFlipTestPlatform(referenceRect, floatingRect);

      const result = await computePosition(
        { getBoundingClientRect: () => referenceRect } as any,
        { getBoundingClientRect: () => floatingRect } as any,
        {
          platform,
          placement: "top",
          middleware: [flip()],
        },
      );

      expect(result.placement).toBe("bottom");
      expect(result.y).toBeGreaterThan(0);
    });

    it("当右侧空间不足时应翻转到左侧", async () => {
      const referenceRect = createMockRect(VIEWPORT_WIDTH - 150, 100, 200, 50);
      const floatingRect = createMockRect(0, 0, 150, 200);
      const platform = createFlipTestPlatform(referenceRect, floatingRect);

      const result = await computePosition(
        { getBoundingClientRect: () => referenceRect } as any,
        { getBoundingClientRect: () => floatingRect } as any,
        {
          platform,
          placement: "right",
          middleware: [flip()],
        },
      );

      expect(result.placement).toBe("left");
      expect(result.x).toBeLessThan(VIEWPORT_WIDTH - 50);
    });

    it("当左侧空间不足时应翻转到右侧", async () => {
      const referenceRect = createMockRect(10, 100, 200, 50);
      const floatingRect = createMockRect(0, 0, 150, 200);
      const platform = createFlipTestPlatform(referenceRect, floatingRect);

      const result = await computePosition(
        { getBoundingClientRect: () => referenceRect } as any,
        { getBoundingClientRect: () => floatingRect } as any,
        {
          platform,
          placement: "left",
          middleware: [flip()],
        },
      );

      expect(result.placement).toBe("right");
      expect(result.x).toBeGreaterThan(0);
    });

    it("底部空间不足但顶部足够时应翻转", async () => {
      const referenceRect = createMockRect(100, 700, 200, 50);
      const floatingRect = createMockRect(0, 0, 200, 150);
      const platform = createFlipTestPlatform(referenceRect, floatingRect);

      const result = await computePosition(
        { getBoundingClientRect: () => referenceRect } as any,
        { getBoundingClientRect: () => floatingRect } as any,
        {
          platform,
          placement: "bottom",
          middleware: [flip()],
        },
      );

      expect(result.placement).toBe("top");
    });

    it("底部空间足够时应保持原位置", async () => {
      const referenceRect = createMockRect(100, 100, 200, 50);
      const floatingRect = createMockRect(0, 0, 200, 150);
      const platform = createFlipTestPlatform(referenceRect, floatingRect);

      const result = await computePosition(
        { getBoundingClientRect: () => referenceRect } as any,
        { getBoundingClientRect: () => floatingRect } as any,
        {
          platform,
          placement: "bottom",
          middleware: [flip()],
        },
      );

      expect(result.placement).toBe("bottom");
    });
  });

  describe("shift 中间件 - 偏移调整", () => {
    it("应正确应用主轴偏移", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
        middleware: [shift({ mainAxis: true })],
      });

      expect(result.y).toBe(150);
    });

    it("应正确应用交叉轴偏移", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
        middleware: [shift({ crossAxis: true })],
      });

      expect(result.x).toBe(125);
    });

    it("应同时应用主轴和交叉轴偏移", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
        middleware: [shift({ mainAxis: true, crossAxis: true })],
      });

      expect(result.x).toBe(125);
      expect(result.y).toBe(150);
    });
  });

  describe("flip 和 shift 组合使用", () => {
    it("应在空间不足时翻转并在边界内偏移", async () => {
      const referenceRect = createMockRect(VIEWPORT_WIDTH - 110, 50, 200, 50);
      const floatingRect = createMockRect(0, 0, 200, 150);
      const platform = createFlipTestPlatform(referenceRect, floatingRect);

      const result = await computePosition(
        { getBoundingClientRect: () => referenceRect } as any,
        { getBoundingClientRect: () => floatingRect } as any,
        {
          platform,
          placement: "right",
          middleware: [flip(), shift({ crossAxis: true })],
        },
      );

      expect(result.placement).toBe("left");
      expect(result.x).toBeGreaterThanOrEqual(0);
    });

    it("应在底部空间不足时翻转并在水平方向调整", async () => {
      const referenceRect = createMockRect(
        VIEWPORT_WIDTH - 150,
        VIEWPORT_HEIGHT - 60,
        200,
        50,
      );
      const floatingRect = createMockRect(0, 0, 150, 100);
      const platform = createFlipTestPlatform(referenceRect, floatingRect);

      const result = await computePosition(
        { getBoundingClientRect: () => referenceRect } as any,
        { getBoundingClientRect: () => floatingRect } as any,
        {
          platform,
          placement: "bottom",
          middleware: [flip(), shift({ crossAxis: true })],
        },
      );

      expect(result.placement).toBe("top");
      expect(result.x).toBeLessThanOrEqual(VIEWPORT_WIDTH);
    });
  });

  describe("边界情况", () => {
    it("应返回正确的 strategy", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
        strategy: "absolute",
      });

      expect(result.strategy).toBe("absolute");
    });

    it("应返回默认 placement", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
      });

      expect(result.placement).toBe("bottom");
    });

    it("应返回 middlewareData", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 50));
      const floating = createMockElement(createMockRect(0, 0, 150, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
        middleware: [flip(), shift()],
      });

      expect(result.middlewareData).toBeDefined();
      expect(typeof result.middlewareData).toBe("object");
    });

    it("参考元素和浮动元素尺寸相同时应正确计算", async () => {
      const reference = createMockElement(createMockRect(100, 100, 100, 100));
      const floating = createMockElement(createMockRect(0, 0, 100, 100));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
      });

      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });

    it("浮动元素大于参考元素时应正确计算", async () => {
      const reference = createMockElement(createMockRect(100, 100, 50, 50));
      const floating = createMockElement(createMockRect(0, 0, 200, 300));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
      });

      expect(result.x).toBe(25);
      expect(result.y).toBe(150);
    });

    it("浮动元素小于参考元素时应正确计算", async () => {
      const reference = createMockElement(createMockRect(100, 100, 200, 200));
      const floating = createMockElement(createMockRect(0, 0, 50, 50));
      const platform = createMockPlatform();

      const result = await computePosition(reference, floating, {
        platform,
        placement: "bottom",
      });

      expect(result.x).toBe(175);
      expect(result.y).toBe(300);
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
        const reference = createMockElement(createMockRect(500, 400, 200, 50));
        const floating = createMockElement(createMockRect(0, 0, 150, 100));
        const platform = createMockPlatform();

        const result = await computePosition(reference, floating, {
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
