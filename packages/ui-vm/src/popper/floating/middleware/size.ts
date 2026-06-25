import { detect_overflow } from "../detect-overflow";
import type { DetectOverflowOptions } from "../detect-overflow";
import type { Middleware, Derivable, MiddlewareState } from "../types";
import { evaluate } from "../utils";

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
 * Available width/height are calculated from both sides of each axis after
 * previous middleware such as `flip` and `shift` have adjusted the position.
 * This keeps oversized floating content constrained inside the clipping
 * boundary instead of only considering the chosen placement side.
 */
export function size(
  options: SizeOptions | Derivable<SizeOptions> = {},
): Middleware {
  return {
    name: "size",
    async fn(state) {
      const { rects } = state;

      const { apply, ...detectOverflowOptions } = evaluate(options, state);

      const overflow = await detect_overflow(state, detectOverflowOptions);

      const availableHeight =
        rects.floating.height -
        Math.max(overflow.top, 0) -
        Math.max(overflow.bottom, 0);
      const availableWidth =
        rects.floating.width -
        Math.max(overflow.left, 0) -
        Math.max(overflow.right, 0);

      if (apply) {
        await apply({ ...state, availableWidth, availableHeight });
      }

      return {
        data: { availableWidth, availableHeight },
      };
    },
  };
}
