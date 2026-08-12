import {
  ViewChildren,
  Label as NativeLabel,
  LabelProps,
  TimelessElement,
} from "@timeless/timeless";
import { classNames } from "@timeless/timeless";

export function Label(
  props: LabelProps,
  children?: ViewChildren,
): TimelessElement {
  const { class: cls, ...rest } = props;
  return NativeLabel(
    {
      ...rest,
      class: classNames([
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        cls,
      ]),
    },
    children,
  );
}
