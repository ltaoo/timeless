import { Ref } from "@timeless/reactive";

import { ViewChildren, ViewProps } from "./view";

export function Match(
  props: ViewProps & { when: Ref<boolean> | boolean },
  children?: ViewChildren,
) {
  const { when, ...rest } = props;

  return {
    t: "match",
    when,
    children,
    $elm: null as any,
    render() {
      return null;
    },
  };
}
