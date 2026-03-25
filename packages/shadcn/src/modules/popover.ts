import { PopoverCore } from "@timeless/ui";
import { computed, ref, refobj } from "@timeless/reactive";
import { View, Show, ViewChildren, ViewProps } from "@timeless/headless";
import { PopoverPrimitive } from "@timeless/headless";

export function Popover(
  props: ViewProps & {
    store: PopoverCore;
    title?: ViewChildren;
    content?: ViewChildren;
  },
  children?: ViewChildren,
) {
  const state_ = refobj(props.store.state);
  const popper_state_ = refobj(props.store.popper.state);

  const unlistens = [
    props.store.onStateChange((v) => {
      state_.as(v);
    }),
    props.store.popper.onStateChange((v) => {
      popper_state_.as(v);
    }),
  ];

  return PopoverPrimitive.Root(
    {
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    [
      PopoverPrimitive.Trigger({ store: props.store }, children),
      PopoverPrimitive.Portal({ store: props.store }, [
        PopoverPrimitive.Content(
          {
            ...props,
            class: computed(state_, (t) => {
              return [
                "popover-content",
                "relative z-50 flex w-72 flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
                t.enter ? "animate-in fade-in-0 zoom-in-95" : "",
                t.exit ? "animate-out fade-out-0 zoom-out-95" : "",
              ].join(" ");
            }),
          },
          [
            PopoverPrimitive.Arrow(
              {
                store: props.store,
                class: computed(popper_state_, (t) => {
                  const side = t.placedSide;
                  let borderClass = "";
                  if (side === "bottom") borderClass = "border-t border-l";
                  if (side === "top") borderClass = "border-b border-r";
                  if (side === "right") borderClass = "border-b border-l";
                  if (side === "left") borderClass = "border-t border-r";
                  return [
                    "absolute h-3 w-3 bg-popover border-foreground/10",
                    "transform",
                    borderClass,
                  ].join(" ");
                }),
                style: "transform: rotate(45deg);",
              },
              [],
            ),
            Show({ when: ref(!!props.title) }, [
              View(
                {
                  class: "flex flex-col gap-0.5 text-sm font-medium",
                },
                props.title,
              ),
            ]),
            ...props.content,
          ],
        ),
      ]),
    ],
  );
}
