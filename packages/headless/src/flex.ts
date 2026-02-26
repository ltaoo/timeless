import { classnames } from "@timeless/reactive";
import { View } from "./view.js";

export function Flex(props: any, children?: any) {
  const { justify, items, class: cn, ...rest } = props;
  const class$: any = classnames(["flex", cn]);
  if (justify) {
    class$.add(` justify-${props.justify}`);
  }
  if (items) {
    class$.add(` items-${props.items}`);
  }
  const view$ = View({ ...rest, class: class$ }, children);
  return view$;
}
