import {
  ScrollViewPrimitive,
  ViewChildren,
  type ViewProps,
} from "@timeless/primitive";
import { cn } from "@timeless/primitive";
import { ScrollViewCore } from "@timeless/ui";

export function ScrollView(
  props: ViewProps & { store: ScrollViewCore },
  children: ViewChildren,
) {
  const { store, class: cls, ...rest } = props;

  return ScrollViewPrimitive.Root(
    {
      ...rest,
      store,
      class: cn(["scroll-view overflow-y-auto w-full h-full", cls]),
    },
    children,
  );
}
