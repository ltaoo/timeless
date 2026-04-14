import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { View, ViewProps } from "@/content/view";
import { isElement, ViewChildren } from "@/content/type";
import { isStyleRef, ClassNameRef } from "@/style";
import { Box } from "@/content/box";
import { MountedEvent } from "@/event";

export type RowProps = ViewProps & {
  gap?: number | DerivedRef<number> | Ref<number>;
  span?: number;
  start?: number;
  end?: number;
  offset?: number;
  rowSpan?: number;
  rowStart?: number;
  rowEnd?: number;
};
type RowState = {
  gap?: number;
};

export function Row(props: RowProps, children?: ViewChildren) {
  const { gap, span, start, end, offset, rowSpan, rowStart, rowEnd, ...rest } =
    props;

  let $elm: any = null;
  const box$ = Box<RowState>(rest, {} as RowState);
  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      if (gap !== undefined) {
        if (isRef(gap)) {
          state.gap = gap.value;
          gap.subscribe({
            onChange(v) {
              state.gap = v;
            },
          });
        } else {
          state.gap = gap;
        }
      }
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "row",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    events,
    children: state.children,
    onMounted(event: MountedEvent) {
      // console.log("[primitive]layout/column - onMounted", event);
      if (rest.onMounted) {
        rest.onMounted(event);
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    onUnmounted() {
      // console.log("[primitive]layout/column - onUnmountmounted", event);
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onUnmounted) {
          child.onUnmounted();
        }
      }
    },
  };
}
