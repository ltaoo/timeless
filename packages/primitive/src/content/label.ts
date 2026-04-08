import { DerivedRef, Ref } from "@timeless/reactive";

import { View, ViewProps } from "@/content/view";
import { ViewAttributes, ViewChildren } from "@/content/type";

export interface NativeLabelProps extends Omit<ViewProps, "as"> {
  for?: string | DerivedRef<string> | Ref<string>;
  htmlFor?: string | Ref<string>;
}

export function Label(props: NativeLabelProps = {}, children?: ViewChildren) {
  const { for: forProp, htmlFor, attributes, ...rest } = props;
  const attrFor = htmlFor ?? forProp;

  let mergedAttributes: ViewAttributes | undefined = attributes;
  if (attrFor !== undefined) {
    mergedAttributes = { ...(attributes || {}), for: attrFor };
  }

  return View({ ...rest, as: "label", attributes: mergedAttributes }, children);
}
