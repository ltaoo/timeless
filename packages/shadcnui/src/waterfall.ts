import { WaterfallPrimitive, ViewChildren, type ViewProps } from "@timeless/headless";
import { cn } from "@timeless/reactive";
import { WaterfallModel } from "@timeless/ui";

export function Waterfall(
  props: ViewProps & { store: WaterfallModel<any> },
  children: ViewChildren,
) {
  const { store, class: cls, ...rest } = props;

  return WaterfallPrimitive.Root(
    {
      store,
      class: cn(["w-full h-full overflow-y-auto", cls]),
      ...rest,
    },
    children,
  );
}
