import {
  ScrollViewPrimitive,
  ViewChildren,
  type ViewProps,
} from "@timeless/timeless";
import { classNames } from "@timeless/timeless";
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
      class: classNames(["scroll-view overflow-y-auto w-full h-full", cls]),
    },
    children,
  );
}
