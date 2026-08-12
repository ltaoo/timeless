import { ui, vm } from "@timeless/timeless";
import { computed, Fragment, ref, refobj } from "@timeless/timeless";
import { View, Show, ViewChildren, ViewProps } from "@timeless/timeless";

export function Popover(
  props: ViewProps & {
    store: vm.PopoverCore;
    title?: ViewChildren;
    content?: ViewChildren;
  },
  children?: ViewChildren,
) {
  const presence_state_ = refobj(props.store.presence.state);
  const was_exiting_ = ref(false);

  const unlistens = [
    props.store.presence.onStateChange((v) => {
      presence_state_.as(v);
      if (v.exit) {
        was_exiting_.as(true);
      }
      if (v.mounted) {
        was_exiting_.as(false);
      }
    }),
  ];

  return ui.PopoverPrimitive.Root(
    {
      onUnmounted() {
        unlistens.forEach((fn) => fn());
      },
    },
    [
      ui.PopoverPrimitive.Trigger({ store: props.store }, children),
      ui.PopoverPrimitive.Portal({ store: props.store }, [
        ui.PopoverPrimitive.Content(
          {
            ...props,
            class: computed(presence_state_, (t) => {
              const inClass = "animate-in fill-mode-both fade-in-0 zoom-in-95";
              const outClass =
                "animate-out fill-mode-both fade-out-0 zoom-out-95";
              return [
                "popover-content",
                "relative flex w-72 flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
                t.enter ? inClass : "",
                t.exit ? outClass : "",
                !t.mounted && was_exiting_.value ? outClass : "",
              ].join(" ");
            }),
          },
          [
            Show({
              when: ref(!!props.title),
              ok() {
                return [
                  View(
                    {
                      class: "flex flex-col gap-0.5 text-sm font-medium",
                    },
                    props.title,
                  ),
                ];
              },
            }),
            Fragment({}, props.content),
          ],
        ),
      ]),
    ],
  );
}
