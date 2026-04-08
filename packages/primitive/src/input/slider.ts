import { Ref } from "@timeless/reactive";

import { Input, InputProps } from "./input";
import { MountedEvent } from "@/event";

type SliderNum = number | string;

export interface SliderProps {
  value?: SliderNum | Ref<SliderNum>;
  min?: SliderNum | Ref<SliderNum>;
  max?: SliderNum | Ref<SliderNum>;
  step?: SliderNum | Ref<SliderNum>;
  onMounted?: (event: MountedEvent) => void;
  onChange?: (event: InputEvent) => void;
}

export function Slider(props: SliderProps = {}) {
  const { min, max, step, ...rest } = props;

  let $elm: any = null;

  // return Input({
  //   ...(rest as any),
  //   type: "range",
  //   attributes: {
  //     ...(attributes || {}),
  //     min,
  //     max,
  //     step,
  //   },
  // });
  return {
    t: "slider",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
  };
}
