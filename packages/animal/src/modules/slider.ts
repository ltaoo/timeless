import { ui } from "@timeless/timeless";
import {
  ViewProps,
  classNames,
  computed,
  isRef,
  ref,
  Ref,
} from "@timeless/timeless";

export function Slider(
  props: ViewProps & {
    value?: number | Ref<number>;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onChange?: (v: number) => void;
  },
) {
  const { disabled, value, min, max, step, onChange, class: cls, ...rest } =
    props;

  // 外部传 Ref 就用它本身（primitive 会订阅），重置类操作才能推动滑块。
  const valueRef: Ref<number> = isRef(value)
    ? (value as Ref<number>)
    : ref(value ?? min ?? 0);
  const pct = computed(valueRef, (d) => {
    const _min = min ?? 0;
    const _max = max ?? 100;
    const v = Math.min(Math.max(d, _min), _max);
    return _max - _min === 0 ? 0 : ((v - _min) / (_max - _min)) * 100;
  });

  return ui.SliderPrimitive.Root(
    {
      ...rest,
      value: valueRef,
      min,
      max,
      step,
      disabled,
      onChange: (v: number) => {
        valueRef.as(v);
        if (onChange) {
          onChange(v);
        }
      },
      class: classNames([
        "animal-slider",
        disabled ? "is-disabled" : "",
        cls,
      ]),
      dataset: {
        slot: "slider",
      },
    },
    [
      ui.SliderPrimitive.Track(
        { class: "animal-slider__track" },
        [
          ui.SliderPrimitive.Range({
            percentage: pct,
            class: "animal-slider__fill",
          }),
        ],
      ),
      ui.SliderPrimitive.Thumb({
        percentage: pct,
        class: "animal-slider__thumb",
      }),
    ],
  );
}
