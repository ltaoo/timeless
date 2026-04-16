import { ViewProps } from "@/content/view";
import { isElement, ViewChildren } from "@/content/type";
import { Box } from "@/content/box";
import { MountedEvent } from "@/event";

import { Breakpoint } from "./row";

export type GridAlign = "start" | "end" | "center" | "stretch" | "baseline";
export type GridJustify = GridAlign | "between" | "around" | "evenly";
export type GridAutoFlow = "row" | "col" | "dense" | "row-dense" | "col-dense";

/**
 * Responsive column count.
 * - number → same count at all breakpoints
 * - object → per-breakpoint counts, e.g. { xs: 1, sm: 2, lg: 4 }
 */
export type GridCols = number | Partial<Record<Breakpoint, number>>;

export type GridProps = ViewProps & {
  /** Column count – supports responsive object */
  cols?: GridCols;
  /** Row template */
  rows?: number | string;
  /** grid-auto-rows */
  autoRows?: string;
  /** grid-auto-columns */
  autoCols?: string;
  /** grid-auto-flow */
  flow?: GridAutoFlow;
  /** Uniform gap (px) */
  gap?: number;
  /** Column gap (px) */
  gapX?: number;
  /** Row gap (px) */
  gapY?: number;
  alignItems?: GridAlign;
  justifyItems?: GridAlign;
  alignContent?: GridJustify;
  justifyContent?: GridJustify;
  placeItems?: string;
  placeContent?: string;
  /** Shorthand spacing (px) */
  marginBottom?: number;
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  padding?: number;
};

type GridState = {
  cols?: GridCols;
  rows?: number | string;
  autoRows?: string;
  autoCols?: string;
  flow?: GridAutoFlow;
  gap?: number;
  gapX?: number;
  gapY?: number;
  alignItems?: GridAlign;
  justifyItems?: GridAlign;
  alignContent?: GridJustify;
  justifyContent?: GridJustify;
  placeItems?: string;
  placeContent?: string;
  marginBottom?: number;
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  padding?: number;
};

export function Grid(props: GridProps, children?: ViewChildren) {
  const {
    cols,
    rows,
    autoRows,
    autoCols,
    flow,
    gap,
    gapX,
    gapY,
    alignItems,
    justifyItems,
    alignContent,
    justifyContent,
    placeItems,
    placeContent,
    marginBottom,
    marginTop,
    marginLeft,
    marginRight,
    padding,
    ...rest
  } = props;

  let $elm: any = null;
  const box$ = Box<GridState>(rest, {} as GridState);
  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      if (cols !== undefined) state.cols = cols;
      if (rows !== undefined) state.rows = rows;
      if (autoRows !== undefined) state.autoRows = autoRows;
      if (autoCols !== undefined) state.autoCols = autoCols;
      if (flow !== undefined) state.flow = flow;
      if (gap !== undefined) state.gap = gap;
      if (gapX !== undefined) state.gapX = gapX;
      if (gapY !== undefined) state.gapY = gapY;
      if (alignItems !== undefined) state.alignItems = alignItems;
      if (justifyItems !== undefined) state.justifyItems = justifyItems;
      if (alignContent !== undefined) state.alignContent = alignContent;
      if (justifyContent !== undefined) state.justifyContent = justifyContent;
      if (placeItems !== undefined) state.placeItems = placeItems;
      if (placeContent !== undefined) state.placeContent = placeContent;
      if (marginBottom !== undefined) state.marginBottom = marginBottom;
      if (marginTop !== undefined) state.marginTop = marginTop;
      if (marginLeft !== undefined) state.marginLeft = marginLeft;
      if (marginRight !== undefined) state.marginRight = marginRight;
      if (padding !== undefined) state.padding = padding;
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "grid",
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
