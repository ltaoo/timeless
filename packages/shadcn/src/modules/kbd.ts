import { View, ViewChildren, ViewProps, classNames } from "@timeless/primitive";

export function Kbd(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      as: "kbd",
      dataset: {
        "data-slot": "kbd",
      },
      class: classNames([
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
        cls,
      ]),
    },
    children,
  );
}

export function KbdGroup(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return View(
    {
      ...rest,
      dataset: {
        "data-slot": "kbd-group",
      },
      class: classNames(["inline-flex items-center gap-1", cls]),
    },
    children,
  );
}
