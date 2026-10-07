import { ui, vm } from "@timeless/timeless";
import { Ref, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  success: "lucky-progress__bar--success",
  warning: "lucky-progress__bar--warning",
  danger: "lucky-progress__bar--danger",
  destructive: "lucky-progress__bar--danger",
  info: "lucky-progress__bar--info",
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
      class: classNames(["lucky-progress", cls]),
    },
    [
      ui.ProgressPrimitive.Indicator({
        store,
        value: value as any,
        max,
        class: classNames([
          "lucky-progress__bar",
          VARIANT_CLASSES[variant] || "",
          striped ? "lucky-progress__bar--striped" : "",
          animated ? "lucky-progress__bar--animated" : "",
        ]),
      }),
    ],
  );
}
