import { cn, combine, computed, refobj } from "@timeless/reactive";
import { InputPrimitive, Show, ViewProps } from "@timeless/headless";
import { InputCore } from "@timeless/ui";
import { CircleXOutlined, LoaderOutlined } from "@timeless/icons";

export function Input(
  props: ViewProps & {
    store: InputCore<any>;
    id?: string;
    showClear?: boolean;
    showLoading?: boolean;
  },
) {
  const { store, id, showLoading = false, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const allowClear = computed(state_, (d) => d.allowClear);
  const hasValue = computed(state_, (d) => d.value && d.value.length > 0);
  const isLoading = computed(state_, (d) => d.loading || false);

  return InputPrimitive.Root({ store, class: cn(["relative", props.class]) }, [
    InputPrimitive.Input({
      ...rest,
      dataset: {},
      store,
      id,
      class: cn([
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        // combine({ allowClear, isLoading, hasValue }, (t) => {
        //   const pr = t.allowClear && t.hasValue ? "pr-8" : "";
        //   const prLoading = showLoading && t.isLoading ? "pr-8" : "";
        //   return [pr, prLoading].filter(Boolean).join(" ");
        // }),
      ]),
    }),
    Show(
      {
        when: combine(
          { allowClear, hasValue },
          (t) => t.hasValue && t.allowClear,
        ),
      },
      [
        InputPrimitive.Clear(
          {
            store,
            class: computed(hasValue, (has) =>
              has
                ? "absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                : "hidden",
            ),
          },
          [CircleXOutlined({ class: "h-4 w-4" })],
        ),
      ],
    ),
    Show({ when: computed(isLoading, (t) => t && showLoading) }, [
      InputPrimitive.Loading(
        {
          store,
          class: computed(isLoading, (loading) =>
            loading
              ? "absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
              : "hidden",
          ),
        },
        [LoaderOutlined({ class: "h-4 w-4 animate-spin" })],
      ),
    ]),
  ]);
}
