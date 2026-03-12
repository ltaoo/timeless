import { refobj, computed, classNames } from "@timeless/reactive";
import { StepsPrimitive, For, Show, Txt, ViewProps } from "@timeless/headless";
import { StepCore } from "@timeless/ui";

export type StepItem = {
  title: string;
  description?: string;
};

export function Steps(props: ViewProps & { store: StepCore; items: StepItem[] }) {
  const { store, items, class: cn, ...rest } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return StepsPrimitive.Root(
    {
      store,
      items,
      class: classNames(["w-full", cn]),
      ...rest,
    },
    [
      StepsPrimitive.List(
        {
          store,
          items,
          class: "flex items-center justify-between",
        },
        [
          For({
            each: items,
            render: (item, index) => {
              return StepsPrimitive.Item(
                {
                  store,
                  index,
                  item,
                  class: "flex flex-1 items-center",
                },
                [
                  StepsPrimitive.Indicator(
                    {
                      store,
                      index,
                      class: classNames([
                        "flex flex-col items-center relative z-10",
                      ]),
                    },
                    [
                      StepIndicatorCircle({ store, index }),
                      StepsPrimitive.Title(
                        {
                          class:
                            "mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400",
                        },
                        [Txt(item.title)],
                      ),
                    ],
                  ),
                  Show({ when: index < items.length - 1 }, [
                    StepsPrimitive.Connector({
                      store,
                      index,
                      class: classNames([
                        "h-[2px] w-full flex-1 mx-2 transition-colors",
                        computed(state_, (s) =>
                          index < s.value
                            ? "bg-zinc-900 dark:bg-zinc-50"
                            : "bg-zinc-200 dark:bg-zinc-700",
                        ),
                      ]),
                    }),
                  ]),
                ],
              );
            },
          }),
        ],
      ),
    ],
  );
}

function StepIndicatorCircle(props: { store: StepCore; index: number }) {
  const { store, index } = props;

  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  return StepsPrimitive.Indicator(
    {
      store,
      index,
      class: classNames([
        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
        computed(state_, (s) => {
          if (index < s.value) {
            return "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900";
          }
          if (index === s.value) {
            return "border-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50";
          }
          return "border-2 border-zinc-200 text-zinc-500 dark:border-zinc-700";
        }),
      ]),
    },
    [Txt(computed(state_, (s) => (index < s.value ? "✓" : String(index + 1))))],
  );
}
