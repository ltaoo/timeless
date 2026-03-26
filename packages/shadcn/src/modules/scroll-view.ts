import {
  Fragment,
  ScrollViewPrimitive,
  ViewChildren,
  type ViewProps,
} from "@timeless/headless";
import { cn } from "@timeless/reactive";
import { ScrollViewCore } from "@timeless/ui";

export function ScrollView(
  props: ViewProps & { store: ScrollViewCore },
  children: ViewChildren,
) {
  const { store, class: cls, ...rest } = props;

  return ScrollViewPrimitive.Root(
    {
      store,
      class: cn(["scroll-view w-full h-full overflow-y-auto", cls]),
      ...rest,
    },
    [
      ScrollViewPrimitive.Indicator(
        {
          store,
          class:
            "scroll-view-indicator relative w-full overflow-hidden text-center",
        },
        [
          ScrollViewPrimitive.Progress({
            store,
            class: "absolute left-0 bottom-0 w-full min-h-[30px] py-[10px]",
          }),
        ],
      ),
      Fragment({}, children),
    ],
  );
}
