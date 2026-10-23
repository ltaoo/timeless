import { ui } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";
import { ViewProps, ViewChildren } from "@timeless/timeless";

const VARIANTS = {
  default:
    "border-transparent bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900",
  secondary:
    "border-transparent bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50",
  outline:
    "border-zinc-200 text-zinc-950 dark:border-zinc-800 dark:text-zinc-50",
  destructive: "border-transparent bg-red-500 text-zinc-50",
};

export function Badge(
  props: ViewProps & {
    variant?: "default" | "secondary" | "outline" | "destructive";
  },
  children?: ViewChildren,
) {
  const { variant = "default", class: cls, ...rest } = props;
  return ui.BadgePrimitive.Badge(
    {
      ...rest,
      variant,
      class: classNames([
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        VARIANTS[variant] || VARIANTS.default,
        cls,
      ]),
    },
    children,
  );
}
