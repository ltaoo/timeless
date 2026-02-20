import { classnames } from "./core.js";
import { View } from "./view.js";

export function Flex(props, children) {
  const { justify, items, class: cn, ...rest } = props;
  // const class$ = ViewClassname("flex");
  const class$ = classnames(["flex", cn].join(" "));
  if (justify) {
    class$.add(` justify-${props.justify}`);
  }
  if (items) {
    class$.add(` items-${props.items}`);
  }
  const view$ = View({ ...rest, class: class$ }, children);
  return view$;
}
