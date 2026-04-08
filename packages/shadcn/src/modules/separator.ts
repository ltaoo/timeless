import { SeparatorPrimitive, ViewProps } from "@timeless/timeless";
import { classNames } from "@timeless/timeless";

export function Separator(
  props: ViewProps & { orientation?: "horizontal" | "vertical" },
) {
  const { orientation = "horizontal", class: cls, ...rest } = props;
  return SeparatorPrimitive.Separator({
    ...rest,
    orientation,
    class: classNames([
      "shrink-0 bg-zinc-200 dark:bg-zinc-800",
      orientation === "vertical" ? "w-[1px] h-full" : "h-[1px] w-full",
      cls,
    ]),
  });
}
