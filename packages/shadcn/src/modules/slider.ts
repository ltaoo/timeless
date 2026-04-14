import { computed, ref } from "@timeless/timeless";
import { ViewProps } from "@timeless/timeless";
import { SliderPrimitive } from "@timeless/ui-primitive";

export function Slider(
  props: ViewProps & {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onChange?: (v: number) => void;
  },
) {
  const { disabled, value, min, max, step, onChange, ...rest } = props;

  const valueRef = ref(value ?? min ?? 0);
  const pct = computed(valueRef, (d) => {
    const _min = min ?? 0;
    const _max = max ?? 100;
    const v = Math.min(Math.max(d, _min), _max);
    return _max - _min === 0 ? 0 : ((v - _min) / (_max - _min)) * 100;
  });

  return SliderPrimitive.Root(
    {
      value,
      min,
      max,
      step,
      disabled,
      onChange: (v) => {
        valueRef.as(v);
        if (onChange) onChange(v);
      },
      class: [
        "relative flex w-full touch-none select-none items-center py-4 cursor-pointer",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ]
        .filter(Boolean)
        .join(" "),
      ...rest,
    },
    [
      SliderPrimitive.Track(
        {
          class:
            "relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
        },
        [
          SliderPrimitive.Range({
            percentage: pct,
            class: "h-full bg-zinc-900 transition-all dark:bg-zinc-50",
          }),
        ],
      ),
      SliderPrimitive.Thumb({
        percentage: pct,
        class:
          "absolute block h-5 w-5 rounded-full border-2 border-zinc-900 bg-white shadow ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-50 dark:bg-zinc-950",
      }),
    ],
  );
}
