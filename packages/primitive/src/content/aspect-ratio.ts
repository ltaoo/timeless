/**
 * AspectRatio - A component that enforces a specific aspect ratio on its content.
 *
 * This is used to create responsive containers that maintain a fixed width-to-height ratio,
 * commonly used for images, videos, or any content that should scale proportionally.
 *
 * @example
 * ```tsx
 * <AspectRatio ratio={16/9}>
 *   <Img src="poster.jpg" />
 * </AspectRatio>
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { Box, BoxProps } from "./box";
import { ViewChildren } from "./type";
import { MountedEvent } from "@/event";

/** Props for AspectRatio component */
type AspectRatioProps = BoxProps & {
  /** The aspect ratio to maintain (width/height). Defaults to 16:9 */
  ratio?: number | DerivedRef<number> | Ref<number>;
};

/** Internal state for AspectRatio */
type AspectRatioState = {
  ratio: number;
};

/**
 * Creates an AspectRatio container that maintains a fixed aspect ratio.
 *
 * @param props - Component props including optional ratio
 * @param children - Child elements to render inside the container
 * @returns A TimelessElement that enforces the given aspect ratio
 */
export function AspectRatio(props: AspectRatioProps, children?: ViewChildren) {
  const { ratio, ...rest } = props || {};
  const box$ = Box<AspectRatioState>(rest, {
    ratio: 16 / 9,
  } as AspectRatioState);

  const state = box$.state;

  const methods = {
    subscribe_props() {
      if (ratio !== undefined) {
        if (isRef(ratio)) {
          state.ratio = ratio.value;
          const unsubscribe = ratio.subscribe({
            onChange(v) {
              state.ratio = v;
            },
          });
          box$.methods.unsubscribe(unsubscribe);
        } else {
          state.ratio = ratio;
        }
      }
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  let $elm: any = null;

  return {
    t: "aspect-ratio",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state,
    children: state.children,
    onMounted(event: MountedEvent<any>) {
      if (rest.onMounted) {
        box$.methods.unsubscribe(rest.onMounted(event));
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  };
}
