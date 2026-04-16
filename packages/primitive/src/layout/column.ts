import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import { isElement, ViewChildren } from "@/content/type";
import { Box } from "@/content/box";
import { MountedEvent } from "@/event";

import { Breakpoint, FlexAlign } from "./row";
import { FlexJustify } from "./flex";

// ─── Col ────────────────────────────────────────────────────────────────────
// Flex item / grid item.  Used as children of <Row> or <Grid>.

export type ColProps = ViewProps & {
  /** Flex grow ratio.  Supports responsive object: { xs: 1, md: 2 } */
  flex?: number | string | Partial<Record<Breakpoint, number | string>>;
  /** Fixed width (px) */
  width?: number | string;
  /** Grid column span */
  span?: number;
  /** grid-column-start */
  start?: number;
  /** grid-column-end */
  end?: number;
  /** offset columns (grid) */
  offset?: number;
  /** Grid row span */
  rowSpan?: number;
  /** grid-row-start */
  rowStart?: number;
  /** grid-row-end */
  rowEnd?: number;
  /** Padding shorthand (px) */
  padding?: number | string;
};

type ColState = {
  flex?: number | string | Partial<Record<Breakpoint, number | string>>;
  width?: number | string;
  span?: number;
  start?: number;
  end?: number;
  offset?: number;
  rowSpan?: number;
  rowStart?: number;
  rowEnd?: number;
  padding?: number | string;
};

export function Col(props: ColProps, children?: ViewChildren) {
  const {
    flex,
    width,
    span,
    start,
    end,
    offset,
    rowSpan,
    rowStart,
    rowEnd,
    padding,
    ...rest
  } = props;

  let $elm: any = null;
  const box$ = Box<ColState>(rest, {} as ColState);
  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      if (flex !== undefined) state.flex = flex;
      if (width !== undefined) state.width = width;
      if (span !== undefined) state.span = span;
      if (start !== undefined) state.start = start;
      if (end !== undefined) state.end = end;
      if (offset !== undefined) state.offset = offset;
      if (rowSpan !== undefined) state.rowSpan = rowSpan;
      if (rowStart !== undefined) state.rowStart = rowStart;
      if (rowEnd !== undefined) state.rowEnd = rowEnd;
      if (padding !== undefined) state.padding = padding;
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "col",
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

// ─── Column ──────────────────────────────────────────────────────────────────
// Flex column container.  Stacks children vertically.

export type ColumnProps = ViewProps & {
  gap?: number | DerivedRef<number> | Ref<number>;
  align?: FlexAlign;
  justify?: FlexJustify;
};

type ColumnState = {
  gap?: number;
  align?: FlexAlign;
  justify?: FlexJustify;
};

export function Column(props: ColumnProps, children?: ViewChildren) {
  const { gap, align, justify, ...rest } = props;

  let $elm: any = null;
  const box$ = Box<ColumnState>(rest, {} as ColumnState);
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
      if (align !== undefined) state.align = align;
      if (justify !== undefined) state.justify = justify;
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "column",
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
