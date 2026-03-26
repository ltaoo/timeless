import { computed, refobj } from "@timeless/reactive";
import { SelectPrimitive, For, ViewProps } from "@timeless/headless";
import { SelectCore } from "@timeless/ui";
import { CheckOutlined, ChevronDownOutlined } from "@timeless/icons";

export function Select(
  props: ViewProps & { store: SelectCore<any>; id?: string },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return SelectPrimitive.Root({ store }, [
    SelectPrimitive.Trigger(
      {
        store,
        id,
        class: computed(state_, (d) => {
          const baseClass =
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
          const openClass = d.open
            ? "border-ring ring-3 ring-ring/50"
            : "dark:hover:bg-input/50";
          return `${baseClass} ${openClass}`;
        }),
        onMounted(el) {
          el.addEventListener("mousedown", (e) => {
            e.stopPropagation();
          });
        },
      },
      [
        SelectPrimitive.Value({
          store,
          class: computed(state_, (d) => {
            const hasSelection =
              d.value != null &&
              (d.options || []).some((o) => o.value === d.value);
            return hasSelection
              ? "text-foreground"
              : "text-muted-foreground";
          }),
        }),
        SelectPrimitive.Icon({ class: "size-4 text-muted-foreground" }, [
          ChevronDownOutlined({}),
        ]),
      ],
    ),
    SelectPrimitive.Content(
      {
        ...rest,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          out: "animate-out fade-out-0 zoom-out-95 slide-out-to-top-2",
        },
        store,
        class:
          "cn-menu-target cn-menu-translucent select__content relative z-50 max-h-96 min-w-36 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
        style: computed(state_, () => {
          const width = store.reference?.width || 0;
          return width > 0 ? `min-width: ${width}px;` : "";
        }),
      },
      [
        SelectPrimitive.Viewport({ store, class: "p-1" }, [
          For({
            key: "value",
            each: computed(state_, (d) => d.options),
            render(option: any) {
              return SelectPrimitive.Item(
                {
                  store,
                  value: option.value,
                  class: computed(state_, (d) => {
                    const opt = d.options.find((o) => o.value === option.value);
                    const isFocused = Boolean(opt?.focused);
                    const isSelected = Boolean(opt?.selected);
                    return [
                      "relative flex w-full cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
                      isSelected ? "font-medium" : "",
                      isFocused ? "bg-accent text-accent-foreground" : "",
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
                        "pointer-events-none absolute right-2 flex size-4 items-center justify-center",
                    },
                    [CheckOutlined({})],
                  ),
                  SelectPrimitive.ItemText({}, [option.label]),
                ],
              );
            },
          }),
        ]),
      ],
    ),
  ]);
}
