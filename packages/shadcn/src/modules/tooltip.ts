import { TooltipCore, Align, Side } from "@timeless/ui";
import { computed, refobj } from "@timeless/reactive";
import { View, ViewChildren, ViewProps } from "@timeless/headless";
import { TooltipPrimitive } from "@timeless/headless";

// 全局单例 store
let globalStore: TooltipCore | null = null;

function getGlobalStore() {
  if (!globalStore) {
    globalStore = new TooltipCore({
      side: "top",
      align: "center",
    });
  }
  return globalStore;
}

export function Tooltip(
  props: ViewProps & {
    content?: ViewChildren;
    side?: Side;
    align?: Align;
  },
  children?: ViewChildren,
) {
  const { content, side = "top", align = "center", ...rest } = props;

  return TooltipPrimitive.Trigger(
    {
      ...rest,
      side,
      align,
      content: [
        View(
          {
            class:
              "z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background pointer-events-none",
          },
          content,
        ),
      ],
    },
    children,
  );
}

export function TooltipProvider(props: ViewProps, children?: ViewChildren) {
  const store = getGlobalStore();
  const state_ = refobj(store.state);
  const popper_state_ = refobj(store.popper.state);

  const unlistens = [
    store.onStateChange((v) => {
      state_.as(v);
    }),
    store.popper.onStateChange((v) => {
      popper_state_.as(v);
    }),
  ];

  return TooltipPrimitive.Root(
    {
      ...props,
      onUnmounted() {
        unlistens.forEach((fn) => fn());
        if (props.onUnmounted) {
          props.onUnmounted();
        }
      },
    },
    [
      ...children,
      TooltipPrimitive.Portal(
        {
          store,
          class: computed(state_, (t) => {
            return [
              "tooltip-content transition-opacity duration-150",
              t.visible ? "opacity-100" : "opacity-0",
            ].join(" ");
          }),
        },
        [],
      ),
    ],
  );
}
