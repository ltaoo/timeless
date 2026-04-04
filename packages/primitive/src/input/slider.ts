import { Ref } from "@timeless/reactive";

import { Input, InputProps } from "./input";

type SliderNum = number | string;

export interface SliderProps extends Omit<
  InputProps,
  "type" | "value" | "minLength" | "maxLength"
> {
  value?: SliderNum | Ref<SliderNum>;
  min?: SliderNum | Ref<SliderNum>;
  max?: SliderNum | Ref<SliderNum>;
  step?: SliderNum | Ref<SliderNum>;
}

export function Slider(props: SliderProps = {}) {
  const { min, max, step, attributes, ...rest } = props;

  return Input({
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
