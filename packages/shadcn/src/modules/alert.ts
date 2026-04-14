import { classNames } from "@timeless/timeless";
import { ViewProps, ViewChildren } from "@timeless/timeless";
import { AlertPrimitive } from "@timeless/ui-primitive";

const VARIANTS = {
  default:
    "bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 [&>div.alert-icon]:text-zinc-950 dark:[&>div.alert-icon]:text-zinc-50",
  destructive:
    "border-red-500/50 text-red-500 dark:border-red-500 [&>div.alert-icon]:text-red-500",
};

export function Alert(
  props: ViewProps & { variant?: "default" | "destructive" },
  children?: ViewChildren,
) {
  const { variant = "default", class: cls, ...rest } = props;
  return AlertPrimitive.Alert(
    {
      ...rest,
      variant,
      class: classNames([
        "relative w-full rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 [&>div.alert-icon+div]:translate-y-[-3px] [&>div.alert-icon]:absolute [&>div.alert-icon]:left-4 [&>div.alert-icon]:top-4 [&>div.alert-icon~*]:pl-7",
        VARIANTS[variant] || VARIANTS.default,
        cls,
      ]),
    },
    children,
  );
}

export function AlertTitle(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return AlertPrimitive.AlertTitle(
    {
      ...rest,
      class: classNames(["mb-1 font-medium leading-none tracking-tight", cls]),
    },
    children,
  );
}

export function AlertDescription(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return AlertPrimitive.AlertDescription(
    {
      ...rest,
      class: classNames(["text-sm [&_p]:leading-relaxed", cls]),
    },
    children,
  );
}
