import {
  ViewChildren,
  Link as NativeLink,
  LinkProps as NativeLinkProps,
} from "@timeless/primitive";
import { classNames } from "@timeless/primitive";

export function Link(props: NativeLinkProps = {}, children?: ViewChildren) {
  const { class: cls, ...rest } = props;

  return NativeLink(
    {
      ...rest,
      class: classNames([
        "text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-sm",
        "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:no-underline",
        cls,
      ]),
    },
    children,
  );
}
