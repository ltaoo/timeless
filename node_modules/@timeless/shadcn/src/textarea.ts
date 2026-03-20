import { combine, computed, refobj } from "@timeless/reactive";
import { TextareaPrimitive, Show, ViewProps } from "@timeless/headless";
import { InputCore } from "@timeless/ui";
import { CircleXOutlined, LoaderOutlined } from "@timeless/icons";

export function Textarea(
  props: ViewProps & {
    store: InputCore<any>;
    id?: string;
    showClear?: boolean;
    showLoading?: boolean;
  },
) {
  const { store, id, showClear = false, showLoading = false, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const hasValue = computed(state_, (d) => d.value && d.value.length > 0);
  const isLoading = computed(state_, (d) => d.loading || false);

  return TextareaPrimitive.Root(
    { store, class: "relative inline-flex" },
    [
      TextareaPrimitive.Textarea({
        store,
        id,
        class: combine({ isLoading, hasValue }, (t) => {
          const base =
            "flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-zinc-950 focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:border-zinc-300 dark:focus-visible:bg-zinc-900 dark:focus-visible:ring-zinc-300";
          const pr = showClear && t.hasValue ? "pr-8" : "";
          const prLoading = showLoading && t.isLoading ? "pr-8" : "";
          return [base, pr, prLoading].filter(Boolean).join(" ");
        }),
        ...rest,
      }),
      Show({ when: computed(hasValue, (t) => t && showClear) }, [
        TextareaPrimitive.Clear(
          {
            store,
            class: computed(hasValue, (has) =>
              has
                ? "absolute right-2 top-2 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                : "hidden",
            ),
          },
          [CircleXOutlined({ class: "h-4 w-4" })],
        ),
      ]),
      Show({ when: computed(isLoading, (t) => t && showLoading) }, [
        TextareaPrimitive.Loading(
          {
            store,
            class: computed(isLoading, (loading) =>
              loading
                ? "absolute right-2 top-2 text-zinc-400 dark:text-zinc-500"
                : "hidden",
            ),
          },
          [LoaderOutlined({ class: "h-4 w-4 animate-spin" })],
        ),
      ]),
    ],
  );
}
