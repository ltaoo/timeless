import { detect_overflow } from "../detect-overflow";
import type { DetectOverflowOptions } from "../detect-overflow";
import type { Middleware, Derivable, MiddlewareState } from "../types";
import { evaluate, getSide } from "../utils";

export interface SizeOptions extends DetectOverflowOptions {
  /**
   * Function that is called with the available width and height.
   */
  apply?: (
    state: MiddlewareState & {
      availableWidth: number;
      availableHeight: number;
    },
  ) => void | Promise<void>;
}

/**
 * Provides data to constrain the floating element's size so that it
 * does not overflow the clipping boundary.
 *
 * In `popper` mode (default), available height is based on the placed side:
 *   - bottom → space from floating top to viewport bottom
 *   - top    → space from viewport top to floating bottom
 *
 * In `item-aligned` mode, available height is the full viewport minus margins,
 * since the content can extend both above and below the reference.
 */
export function size(
  options: SizeOptions | Derivable<SizeOptions> = {},
): Middleware {
  return {
    name: "size",
    async fn(state) {
      const { placement, rects, platform } = state;

      const { apply, ...detectOverflowOptions } = evaluate(options, state);

      const overflow = await detect_overflow(state, detectOverflowOptions);

      const side = getSide(placement);
      const isVerticalSide = side === "top" || side === "bottom";

      let availableHeight: number;
      let availableWidth: number;

      if (isVerticalSide) {
        // Main axis is vertical: constrain height by the placed side's overflow
        // Cross axis: constrain width by left+right overflow
        availableHeight = rects.floating.height - Math.max(overflow[side], 0);
        availableWidth =
          rects.floating.width -
          Math.max(overflow.left, 0) -
          Math.max(overflow.right, 0);
      } else {
        // Main axis is horizontal: constrain width by the placed side's overflow
        // Cross axis: constrain height by top+bottom overflow
        availableWidth = rects.floating.width - Math.max(overflow[side], 0);
        availableHeight =
          rects.floating.height -
          Math.max(overflow.top, 0) -
          Math.max(overflow.bottom, 0);
      }

      if (apply) {
        await apply({ ...state, availableWidth, availableHeight });
      }

      return {
        data: { availableWidth, availableHeight },
      };
    },
  };
}
