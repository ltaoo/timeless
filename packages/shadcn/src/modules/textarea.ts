import { combine, computed, Icon, refobj, View } from "@timeless/timeless";
import { Show, ViewProps } from "@timeless/timeless";
import { TextareaPrimitive } from "@timeless/ui-primitive";
import { InputCore } from "@timeless/inner-vm";

export function Textarea(
  props: ViewProps & {
    store: InputCore<any>;
    id?: string;
    showClear?: boolean;
    showLoading?: boolean;
    showCount?: boolean;
  },
) {
  const {
    store,
    id,
    showClear = false,
    showLoading = false,
    showCount = false,
    ...rest
  } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const hasValue = computed(state_, (d) => d.value && d.value.length > 0);
  const isLoading = computed(state_, (d) => d.loading || false);

  return TextareaPrimitive.Root({ store, class: "flex flex-col gap-1" }, [
    TextareaPrimitive.Root({ store, class: "relative inline-flex" }, [
      TextareaPrimitive.Textarea({
        ...rest,
        store,
        id,
        class: combine({ isLoading, hasValue }, (t) => {
          const base =
            "flex min-h-[80px] w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";
          const pr = showClear && t.hasValue ? "pr-8" : "";
          const prLoading = showLoading && t.isLoading ? "pr-8" : "";
          return [base, pr, prLoading].filter(Boolean).join(" ");
        }),
      }),
      Show({
        when: computed(hasValue, (t) => t && showClear),
        ok() {
          return [
            TextareaPrimitive.Clear(
              {
                store,
                class: computed(hasValue, (has) =>
                  has
                    ? "absolute right-2 top-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    : "hidden",
                ),
              },
              [Icon({ name: "circle-x" })],
            ),
          ];
        },
      }),
      Show({
        when: computed(isLoading, (t) => t && showLoading),
        ok() {
          return [
            TextareaPrimitive.Loading(
              {
                store,
                class: computed(isLoading, (loading) =>
                  loading
                    ? "absolute right-2 top-2 text-muted-foreground"
                    : "hidden",
                ),
              },
              [
                View(
                  {
                    class: "animate-spin",
                  },
                  [Icon({ name: "loader", size: 16 })],
                ),
              ],
            ),
          ];
        },
      }),
    ]),
    Show({
      when: showCount,
      ok() {
        return [
          TextareaPrimitive.Count(
            {
              store,
              class: "self-end text-xs text-muted-foreground",
            },
            [],
          ),
        ];
      },
    }),
  ]);
}
