import { NativeLink, NativeLinkProps, ViewChildren } from "@timeless/primitive";
import { cn } from "@timeless/primitive";

export function Link(
  props: NativeLinkProps = {},
  children?: ViewChildren | ViewChildren[number],
) {
  const { class: cls, ...rest } = props;

  return NativeLink(
    {
      ...rest,
      class: cn([
        "text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-sm",
        "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:no-underline",
        cls,
      ]),
    },
    children,
  );
}
