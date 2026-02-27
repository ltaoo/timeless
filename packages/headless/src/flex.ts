import { cn, ClassNameRef, Ref } from "@timeless/reactive";

import { View, ViewProps } from "./view.js";

export function Flex(
  props: {
    justify?: string;
    items?: string;
    class?: string | Ref<string> | ClassNameRef;
  } & ViewProps,
  children?: any,
) {
  const { justify, items, class: cls, ...rest } = props;
  const class$: any = cn(["flex", cls]);
  if (justify) {
    class$.add(` justify-${props.justify}`);
  }
  if (items) {
    class$.add(` items-${props.items}`);
  }
  const view$ = View({ ...rest, class: class$ }, children);
  return view$;
}
