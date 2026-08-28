import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { View, ViewProps } from "@/content/view";

type KeepAliveCondition =
  | DerivedRef<boolean | null | undefined>
  | Ref<boolean | null | undefined>
  | boolean;

export type KeepAliveProps = ViewProps & {
  when: KeepAliveCondition;
};

/**
 * Keeps a subtree mounted while toggling its activation.
 *
 * Unlike Show, inactive children are moved into the host's detached cache,
 * preserving host nodes, component state, form values, and scroll positions.
 */
export function KeepAlive(
  props: KeepAliveProps,
  children?: ViewChildren,
): TimelessElement {
  const { when, attributes = {}, onMounted, ...view_props } = props;
  let active: boolean | undefined;
  const view = View(
    {
      ...view_props,
      attributes: { n: "keep-alive", ...attributes },
      onMounted(event) {
        const sync = (value: unknown) => {
          const next = !!value;
          if (next === active) return;
          active = next;
          view.$elm?.setChildrenActive?.(next);
        };
        sync(isRef(when) ? when.value : when);
        const unsubscribe = isRef(when)
          ? when.subscribe({ onChange: sync })
          : undefined;
        const cleanup = onMounted?.(event);

        return () => {
          unsubscribe?.();
          cleanup?.();
          active = undefined;
        };
      },
    },
    children,
  );

  return view;
}
