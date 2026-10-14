import { DerivedRef, Ref } from "@timeless/inner-reactive";
import { View, ViewProps } from "./view";
import { ViewChildren } from "./type";

export type LabelProps = ViewProps & {
  for?: string | DerivedRef<string> | Ref<string>;
};
/** Text or a control label; association is implemented by each host. */
export function Label(props: LabelProps = {}, children?: ViewChildren) {
  const { for: control_id, attributes, ...rest } = props;
  const view = View(
    {
      ...rest,
      attributes:
        control_id === undefined
          ? attributes
          : { ...attributes, for: control_id },
    },
    children,
  );
  view.t = "label";
  return view;
}
