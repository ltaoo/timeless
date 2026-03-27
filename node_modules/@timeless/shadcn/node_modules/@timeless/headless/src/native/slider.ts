import { Ref } from "@timeless/reactive";

import { NativeInput, NativeInputProps } from "./input";

type SliderNum = number | string;

export interface NativeSliderProps
  extends Omit<NativeInputProps, "type" | "value" | "minLength" | "maxLength"> {
  value?: SliderNum | Ref<SliderNum>;
  min?: SliderNum | Ref<SliderNum>;
  max?: SliderNum | Ref<SliderNum>;
  step?: SliderNum | Ref<SliderNum>;
}

export function NativeSlider(props: NativeSliderProps = {}) {
  const { min, max, step, attributes, ...rest } = props;

  return NativeInput({
    ...(rest as any),
    type: "range",
    attributes: {
      ...(attributes || {}),
      min,
      max,
      step,
    },
  });
}
