import { ui, vm } from "@timeless/timeless";
import { Ref, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  success: "fl-progress__bar--success",
  warning: "fl-progress__bar--warning",
  danger: "fl-progress__bar--danger",
  destructive: "fl-progress__bar--danger",
  info: "fl-progress__bar--info",
};

export function Progress(
  props: ViewProps & {
    store?: vm.ProgressCore;
    value?: Ref<number> | number;
    max?: number;
    variant?: string;
    striped?: boolean;
    animated?: boolean;
  },
) {
  const {
    store,
    value,
    max,
    variant = "default",
    striped = false,
    animated = false,
    class: cls,
    ...rest
  } = props;

  return ui.ProgressPrimitive.Root(
    {
      ...rest,
      store,
      value,
      max,
      class: classNames(["fl-progress", cls]),
    },
    [
      ui.ProgressPrimitive.Indicator({
        store,
        value: value as any,
        max,
        class: classNames([
          "fl-progress__bar",
          VARIANT_CLASSES[variant] || "",
          striped ? "fl-progress__bar--striped" : "",
          animated ? "fl-progress__bar--animated" : "",
        ]),
      }),
    ],
  );
}
