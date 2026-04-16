import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import { isElement, ViewChildren } from "@/content/type";
import { Box } from "@/content/box";
import { MountedEvent } from "@/event";

import { FlexJustify } from "./flex";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";

export type RowDirection = "row" | "column" | "row-reverse" | "column-reverse";

export type FlexAlign = "start" | "end" | "center" | "stretch" | "baseline";

export type RowBreakpointConfig = {
  direction?: RowDirection;
  gap?: number;
  wrap?: boolean;
  align?: FlexAlign;
  justify?: FlexJustify;
};

export type RowProps = ViewProps & {
  gap?: number | Ref<number> | DerivedRef<number>;
  wrap?: boolean;
  direction?: RowDirection;
  align?: FlexAlign;
  justify?: FlexJustify;
  breakpoints?: Partial<Record<Breakpoint, RowBreakpointConfig>>;
};

type RowState = {
  gap?: number;
  wrap?: boolean;
  direction?: RowDirection;
  align?: FlexAlign;
  justify?: FlexJustify;
  breakpoints?: Partial<Record<Breakpoint, RowBreakpointConfig>>;
};

export function Row(props: RowProps, children?: ViewChildren) {
  const { gap, wrap, direction, align, justify, breakpoints, ...rest } = props;

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
      if (wrap !== undefined) state.wrap = wrap;
      if (direction !== undefined) state.direction = direction;
      if (align !== undefined) state.align = align;
      if (justify !== undefined) state.justify = justify;
      if (breakpoints !== undefined) state.breakpoints = breakpoints;
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
