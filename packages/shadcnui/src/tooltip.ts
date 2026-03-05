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
              "z-50 overflow-hidden rounded-md border border-zinc-200 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-50 shadow-md pointer-events-none dark:border-zinc-800 dark:bg-zinc-50 dark:text-zinc-900",
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
