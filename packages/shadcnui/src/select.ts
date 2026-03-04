import { computed, refobj } from "@timeless/reactive";
import {
  SelectPrimitive,
  For,
  View,
  ViewChildren,
  ViewProps,
} from "@timeless/headless";
import { SelectCore } from "@timeless/ui";
import { CheckOutlined, ChevronRightOutlined } from "@timeless/icons";

export function Select(props: ViewProps & { store: SelectCore<any> }) {
  const { store, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return SelectPrimitive.Root({ store }, [
    SelectPrimitive.Trigger(
      {
        store,
        class:
          "flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300",
      },
      [
        SelectPrimitive.Value({
          store,
          class: computed(state_, (d) => {
            return d.value != null
              ? "text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 dark:text-zinc-400";
          }),
        }),
        SelectPrimitive.Icon({ class: "h-4 w-4 opacity-50" }, [
          ChevronRightOutlined,
        ]),
      ],
    ),
    SelectPrimitive.Portal({ store }, [
      SelectPrimitive.Content(
        {
          ...rest,
          animation: {
            in: "animate-in fade-in-0 slide-in-from-bottom-2",
            out: "animate-out fade-out-0 slide-out-to-bottom-2",
          },
          store,
          class:
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-zinc-200 bg-white text-zinc-950 shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
          // 添加 minWidth 到 style，这样不会被 popper 的 computed style 覆盖
          style: computed(state_, () => {
            const width = store.reference?.width || 0;
            console.log(
              "[Select shadcnui] computed style, width:",
              width,
              "reference:",
              store.reference,
            );
            return width > 0 ? `min-width: ${width}px;` : "";
          }),
        },
        [
          SelectPrimitive.Viewport({ store, class: "p-1" }, [
            For({
              each: computed(state_, (d) => d.options),
              render(option: any) {
                return SelectPrimitive.Item(
                  {
                    store,
                    value: option.value,
                    class: computed(state_, (d) => {
                      const opt = d.options.find((o) => o.value === option.value);
                      return [
                        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                        opt?.focused
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                          : "",
                        opt?.selected && !opt?.focused
                          ? "bg-zinc-100 dark:bg-zinc-800"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                    }),
                  },
                  [
                    SelectPrimitive.ItemIndicator(
                      {
                        store,
                        value: option.value,
                        class:
                          "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
                      },
                      [CheckOutlined],
                    ),
                    SelectPrimitive.ItemText({}, [option.label]),
                  ],
                );
              },
            }),
          ]),
        ],
      ),
    ]),
  ]);
}
