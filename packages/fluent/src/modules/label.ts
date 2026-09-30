import {
  Label as NativeLabel,
  LabelProps,
  TimelessElement,
  ViewChildren,
  classNames,
} from "@timeless/timeless";

export function Label(
  props: LabelProps,
  children?: ViewChildren,
): TimelessElement {
  const { class: cls, ...rest } = props;
  return NativeLabel({ ...rest, class: classNames(["fl-label", cls]) }, children);
}
