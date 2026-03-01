import { PopoverCore } from "@timeless/ui";
import { computed, ref, refobj } from "@timeless/reactive";
import { ViewChildren, ViewProps } from "@timeless/headless/view";
import { Show } from "@timeless/headless/show";
import { PopoverPrimitive } from "@timeless/headless";

const t = {
  wrapper: { style: "position:fixed;z-index:999;left:0;top:0;" },
  content: ({ enter, exit }) => ({
    class: [
      "z-50 w-72 rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-500 shadow-md outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
      enter ? "animate-in fade-in-0 zoom-in-95" : "",
      exit ? "animate-out fade-out-0 zoom-out-95" : "",
    ]
      .filter(Boolean)
      .join(" "),
  }),
  title: { class: "mb-2 text-sm font-medium text-zinc-950 dark:text-zinc-50" },
};

export function Popover(
  props: ViewProps & {
    store: PopoverCore;
    title?: ViewChildren;
    content?: ViewChildren;
  },
  children?: ViewChildren,
) {
  const state = refobj(props.store.state);
  const unlisten = props.store.onStateChange((v) => {
    state.as(v);
  });
  return PopoverPrimitive.Root(
    {
      class: "popover-root",
      onUnmounted() {
        unlisten();
      },
    },
    [
      PopoverPrimitive.Trigger({ store: props.store }, children),
      PopoverPrimitive.Portal({ store: props.store }, [
        PopoverPrimitive.Content(
          {
            ...props,
            class: computed(state, (s) => {
              return ["popover-content", t.content(s).class].join(" ");
            }),
          },
          [
            Show(
              {
                class: t.title.class,
                when: ref(!!props.title),
              },
              [...props.title],
            ),
            ...props.content,
          ],
        ),
      ]),
    ],
  );
}
