import { Ref } from "@timeless/reactive";

import { View, ViewAttributes, ViewChildren, ViewProps } from "../primitive/view";

export interface NativeLabelProps extends Omit<ViewProps, "as"> {
  for?: string | Ref<string>;
  htmlFor?: string | Ref<string>;
}

export function NativeLabel(
  props: NativeLabelProps = {},
  children?: ViewChildren | ViewChildren[number],
) {
  const { for: forProp, htmlFor, attributes, ...rest } = props;
  const attrFor = htmlFor ?? forProp;

  let mergedAttributes: ViewAttributes | undefined = attributes;
  if (attrFor !== undefined) {
    mergedAttributes = { ...(attributes || {}), for: attrFor };
  }

  return View({ ...rest, as: "label", attributes: mergedAttributes }, children);
}
