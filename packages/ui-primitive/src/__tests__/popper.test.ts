import { describe, expect, it } from "vitest";
import type { Platform } from "../core";
import { PopperCore } from "@timeless/inner-vm";

import { Content } from "@/modules/popper";

function rect(x: number, y: number, width: number, height: number) {
  return {
    x,
    y,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height,
  };
}

type Rect = ReturnType<typeof rect>;

function createPlatform(viewport: Rect): Platform {
  return {
    addEventListener: () => () => {},
    patchBodyStyle: () => {},
    getViewportSize: () => ({
      width: viewport.width,
      height: viewport.height,
    }),
    isBrowser: () => false,
    isElement: () => false,
    isHTMLElement: () => false,
    getBoundingClientRect: () => rect(0, 0, 0, 0),
    getDimensions: () => ({ width: 0, height: 0 }),
    getElementRects: ({ reference, floating }) => ({
      reference: (reference as { getRect: () => Rect }).getRect(),
      floating: (floating as { getRect: () => Rect }).getRect(),
    }),
    getClippingRect: () => viewport,
    getOffsetParent: () => null,
    isRTL: () => false,
    getScale: () => ({ x: 1, y: 1 }),
    getDocumentElement: () => null,
  };
}

describe("PopperPrimitive platform", () => {
  it("preserves the PopperCore platform so viewport overflow can flip placement", async () => {
    const platform = createPlatform(rect(0, 0, 1000, 800));
    const popper = new PopperCore({
      side: "bottom",
      align: "end",
      platform,
    });

    popper.setReference({
      getRect: () => rect(930, 750, 50, 30),
    });

    const content = Content({ store: popper });
    content.onMounted({
      target: {
        getBoundingClientRect: () => rect(0, 0, 140, 200),
      },
    });

    expect(popper.platform).toBe(platform);

    const position = await popper.computePosition();
    expect(position.placement).toBe("top-end");
    expect(position.y).toBeLessThan(750);
  });

  it("top placement 应使用固定底边锚点，让内容高度变化时由 CSS 向上生长", async () => {
    const platform = createPlatform(rect(0, 0, 1000, 800));
    const popper = new PopperCore({
      side: "bottom",
      align: "end",
      offsetY: 8,
      platform,
    });

    popper.setReference({
      getRect: () => rect(930, 750, 50, 30),
    });

    const content = Content({ store: popper });
    content.onMounted({
      target: {
        getBoundingClientRect: () => rect(0, 0, 140, 120),
      },
    });

    await popper.place();

    expect(popper.state.placement).toBe("top-end");
    expect(popper.state.anchorY).toBeTypeOf("number");
    expect(popper.state.height).toBeUndefined();
    expect(content.state.style.transform).toContain(
      `translate3d(${Math.round(popper.state.x)}px, ${Math.round(popper.state.anchorY!)}px, 0)`,
    );
    expect(content.state.style.transform).toContain("translateY(-100%)");
  });
});
