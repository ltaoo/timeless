// import { Popover as H } from "@timeless/timeless";

// const t = {
//   wrapper: { style: "position:fixed;z-index:999;left:0;top:0;" },
//   content: ({ enter, exit }) => ({
//     style: ["background:var(--weui-BG-2);border-radius:8px;padding:var(--weui-CELL-GAP);box-shadow:0 4px 12px rgba(0,0,0,.12);min-width:200px;", enter ? "animation:weui-fade-in .2s;" : "", exit ? "animation:weui-fade-out .2s;" : ""].join(""),
//   }),
// };

// export function Popover(p: Parameters<typeof H>[0], c) { return H({ ...p, theme: t }, c); }

import { PopoverCore } from "@timeless/ui-vm";
import { computed, ref, refobj } from "@timeless/reactive";
import { View, Show, ViewChildren, ViewProps } from "@timeless/timeless";
import { PopoverPrimitive } from "@timeless/timeless";

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
            // class: computed(state_, (t) => {
            //   return [
            //     "popover-content",
            //     "relative z-50 w-72 rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-500 shadow-md outline-none",
            //     "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
            //     t.enter ? "animate-in fade-in-0 zoom-in-95" : "",
            //     t.exit ? "animate-out fade-out-0 zoom-out-95" : "",
            //   ].join(" ");
            // }),
            style: computed(state_, (t) => {
              return [
                "background:var(--weui-BG-2);border-radius:8px;padding:var(--weui-CELL-GAP);box-shadow:0 4px 12px rgba(0,0,0,.12);min-width:200px;",
                t.enter ? "animation:weui-fade-in .2s;" : "",
                t.exit ? "animation:weui-fade-out .2s;" : "",
              ].join("; ");
            }),
          },
          props.content,
        ),
      ]),
    ],
  );
}
