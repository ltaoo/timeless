import { describe, expect, it } from "vitest";
import type { Platform } from "@timeless/timeless";
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
});
