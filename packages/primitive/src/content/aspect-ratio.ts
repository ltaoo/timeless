import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { Box, BoxProps } from "./box";
import { ViewChildren } from "./type";
import { MountedEvent } from "@/event";

type AspectRatioProps = BoxProps & {
  ratio?: number | DerivedRef<number> | Ref<number>;
};
type AspectRatioState = {
  ratio: number;
};

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
