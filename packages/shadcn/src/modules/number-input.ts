import { combine, computed, refobj } from "@timeless/reactive";
import {
  NumberInputPrimitive,
  Show,
  View,
  ViewProps,
  h,
} from "@timeless/headless";
import { NumberInputCore } from "@timeless/ui";
import { ChevronUpOutlined, ChevronDownOutlined } from "@timeless/icons";

export function NumberInput(
  props: ViewProps & {
    store: NumberInputCore;
    id?: string;
    showControls?: boolean;
  },
) {
  const { store, id, showControls = true, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const canIncrease = computed(state_, (d) => d.canIncrease);
  const canDecrease = computed(state_, (d) => d.canDecrease);
  const isDisabled = computed(state_, (d) => d.disabled);

  return NumberInputPrimitive.Root(
    {
      store,
      class: combine({ isDisabled }, (t) =>
        [
          "relative inline-flex items-center",
          t.isDisabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" "),
      ),
    },
    [
      NumberInputPrimitive.Input({
        store,
        id,
        class: [
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
          "md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
          showControls ? "pr-8" : "",
        ].join(" "),
        ...rest,
      }),
      Show({ when: showControls }, [
        h(
          View,
          {
            class:
              "absolute right-0 top-0 bottom-0 flex flex-col border-l border-input",
          },
          [
            h(
              NumberInputPrimitive.IncreaseButton,
              {
                store,
                class: combine({ canIncrease, isDisabled }, (t) => {
                  return [
                    "flex-1 flex items-center justify-center px-1.5 rounded-tr-lg",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    "border-b border-input",
                    !t.canIncrease || t.isDisabled
                      ? "opacity-30 cursor-not-allowed"
                      : "cursor-pointer",
                  ].join(" ");
                }),
              },
              [h(ChevronUpOutlined, { class: "size-3" }, [])],
            ),
            h(
              NumberInputPrimitive.DecreaseButton,
              {
                store,
                class: combine({ canDecrease, isDisabled }, (t) => {
                  return [
                    "flex-1 flex items-center justify-center px-1.5 rounded-br-lg",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    !t.canDecrease || t.isDisabled
                      ? "opacity-30 cursor-not-allowed"
                      : "cursor-pointer",
                  ].join(" ");
                }),
              },
              [h(ChevronDownOutlined, { class: "size-3" }, [])],
            ),
          ],
        ),
      ]),
    ],
  );
}
