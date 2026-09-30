import { ui, vm } from "@timeless/timeless";
import { Ref, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  success: "animal-progress__bar--success",
  warning: "animal-progress__bar--warning",
  danger: "animal-progress__bar--danger",
  destructive: "animal-progress__bar--danger",
  info: "animal-progress__bar--info",
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
      class: classNames(["animal-progress", cls]),
    },
    [
      ui.ProgressPrimitive.Indicator({
        store,
        value: value as any,
        max,
        class: classNames([
          "animal-progress__bar",
          VARIANT_CLASSES[variant] || "",
          striped ? "animal-progress__bar--striped" : "",
          animated ? "animal-progress__bar--animated" : "",
        ]),
      }),
    ],
  );
}
