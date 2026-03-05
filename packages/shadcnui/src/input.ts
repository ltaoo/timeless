import { combine, computed, refobj } from "@timeless/reactive";
import { InputPrimitive, View, ViewProps } from "@timeless/headless";
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
  const { store, id, showClear = true, showLoading = false, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const hasValue = computed(state_, (d) => d.value && d.value.length > 0);
  const isLoading = computed(state_, (d) => d.loading || false);

  return InputPrimitive.Root(
    { store, class: "relative inline-flex items-center" },
    [
      InputPrimitive.Input({
        store,
        id,
        class: combine({ isLoading, hasValue }, (t) => {
          const pr = showClear && t.hasValue ? "pr-8" : "";
          const prLoading = showLoading && t.isLoading ? "pr-8" : "";
          return [pr, prLoading].join(" ");
        }),
        ...rest,
      }),
      showClear
        ? InputPrimitive.Clear(
            {
              store,
              class: computed(hasValue, (has) =>
                has
                  ? "absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  : "hidden",
              ),
            },
            [CircleXOutlined({ class: "h-4 w-4" })],
          )
        : null,
      showLoading
        ? InputPrimitive.Loading(
            {
              store,
              class: computed(isLoading, (loading) =>
                loading
                  ? "absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                  : "hidden",
              ),
            },
            [LoaderOutlined({ class: "h-4 w-4 animate-spin" })],
          )
        : null,
    ],
  );
}
