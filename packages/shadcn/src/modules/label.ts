import { Label as H, ViewProps, ViewChildren } from "@timeless/headless";
import { cn } from "@timeless/reactive";

export function Label(props: ViewProps, children?: ViewChildren) {
  const { class: cls, ...rest } = props;
  return H(
    {
      ...rest,
      class: cn([
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        cls,
      ]),
    },
    children,
  );
}
