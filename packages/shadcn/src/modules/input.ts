import { classNames, combine, computed, refobj } from "@timeless/primitive";
import { h, InputPrimitive, Show, ViewProps } from "@timeless/primitive";
import { InputCore } from "@timeless/ui";
import { CircleXOutlined, LoaderOutlined } from "@timeless/icons";

export function Input(
  props: ViewProps & {
    store: InputCore<any>;
    id?: string;
  },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const allowClear = computed(state_, (d) => d.allowClear);
  const hasValue = computed(state_, (d) => d.value && d.value.length > 0);
  const isLoading = computed(state_, (d) => d.loading || false);

  return InputPrimitive.Root(
    { store, class: classNames(["t-input relative", props.class]) },
    [
      InputPrimitive.Input({
        ...rest,
        id,
        store,
        class: classNames([
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          combine({ allowClear, isLoading }, (t) => {
            return t.isLoading || t.allowClear ? "pr-8" : "";
          }),
        ]),
      }),
      Show(
        {
          when: combine(
            { allowClear, hasValue, isLoading },
            (t) => t.hasValue && t.allowClear && !t.isLoading,
          ),
        },
        [
          h(
            InputPrimitive.Clear,
            {
              store,
              class:
                "absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
            },
            [h(CircleXOutlined, { class: "h-4 w-4" })],
          ),
        ],
      ),
      InputPrimitive.Loading(
        {
          store,
          class:
            "absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500",
        },
        [LoaderOutlined({ class: "h-4 w-4 animate-spin" })],
      ),
    ],
  );
}
