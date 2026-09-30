import { ui, vm } from "@timeless/timeless";
import { Ref, ViewProps, classNames } from "@timeless/timeless";

const VARIANT_CLASSES: Record<string, string> = {
  default: "",
  primary: "",
  success: "m3-progress__bar--success",
  warning: "m3-progress__bar--warning",
  danger: "m3-progress__bar--danger",
  destructive: "m3-progress__bar--danger",
  info: "m3-progress__bar--info",
};

/**
 * Material 3 线性进度条：轨道 --surface-container-highest、
 * 指示器 --primary（4px 高、pill 圆角）。
 */
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
      class: classNames(["m3-progress", cls]),
    },
    [
      ui.ProgressPrimitive.Indicator({
        store,
        value: value as any,
        max,
        class: classNames([
          "m3-progress__bar",
          VARIANT_CLASSES[variant] || "",
          striped ? "m3-progress__bar--striped" : "",
          animated ? "m3-progress__bar--animated" : "",
        ]),
      }),
    ],
  );
}
