import {
  Link as NativeLink,
  LinkProps as NativeLinkProps,
  TimelessElement,
  ViewChildren,
  classNames,
} from "@timeless/timeless";

export function Link(
  props: NativeLinkProps = {},
  children?: ViewChildren,
): TimelessElement {
  const { class: cls, ...rest } = props;
  return NativeLink(
    {
      ...rest,
      class: classNames(["link", cls]),
    },
    children,
  );
}
