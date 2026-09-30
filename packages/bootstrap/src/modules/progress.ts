import { ui, vm } from "@timeless/timeless";
import { Ref, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  success: "progress-bar-success",
  warning: "progress-bar-warning",
  danger: "progress-bar-danger",
  destructive: "progress-bar-danger",
  info: "progress-bar-info",
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
      class: classNames(["progress", cls]),
    },
    [
      ui.ProgressPrimitive.Indicator({
        store,
        value: value as any,
        max,
        class: classNames([
          "progress-bar",
          VARIANT_CLASSES[variant] || "",
          striped ? "progress-bar-striped" : "",
          animated ? "progress-bar-animated" : "",
        ]),
      }),
    ],
  );
}
