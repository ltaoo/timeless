import { combine, computed, refobj } from "@timeless/reactive";
import {
  NumberInputPrimitive,
  Show,
  View,
  ViewProps,
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
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          showControls ? "pr-8" : "",
        ].join(" "),
        ...rest,
      }),
      Show({ when: showControls }, [
        View(
          {
            class:
              "absolute right-0 top-0 bottom-0 flex flex-col border-l border-input",
          },
          [
            NumberInputPrimitive.IncreaseButton(
              {
                store,
                class: combine({ canIncrease, isDisabled }, (t) => {
                  return [
                    "flex-1 flex items-center justify-center px-1.5 rounded-tr-md",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    "border-b border-input",
                    !t.canIncrease || t.isDisabled
                      ? "opacity-30 cursor-not-allowed"
                      : "cursor-pointer",
                  ].join(" ");
                }),
              },
              [ChevronUpOutlined({ class: "h-3 w-3" })],
            ),
            NumberInputPrimitive.DecreaseButton(
              {
                store,
                class: combine({ canDecrease, isDisabled }, (t) => {
                  return [
                    "flex-1 flex items-center justify-center px-1.5 rounded-br-md",
                    "hover:bg-accent hover:text-accent-foreground transition-colors",
                    !t.canDecrease || t.isDisabled
                      ? "opacity-30 cursor-not-allowed"
                      : "cursor-pointer",
                  ].join(" ");
                }),
              },
              [ChevronDownOutlined({ class: "h-3 w-3" })],
            ),
          ],
        ),
      ]),
    ],
  );
}
