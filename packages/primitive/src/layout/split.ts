import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import { ViewChildren, isElement } from "@/content/type";
import { Box } from "@/content/box";

export type SplitDirection = "horizontal" | "vertical";

export type SplitViewProps = ViewProps & {
  direction?: SplitDirection;
  defaultSizes?: number | number[];
  minSizes?: number | number[];
  maxSizes?: number | number[];
  dividerStyle?: "thin" | "light" | "dark" | "none";
  onResize?: (sizes: number[]) => void;
};

type SplitViewState = {
  direction: SplitDirection;
  sizes: number[];
  isResizing: boolean;
  dividerIndex: number | null;
  dividerStyle: "thin" | "light" | "dark" | "none";
};

function normalizeSizes(
  sizes: number | number[] | undefined,
  defaultVal: number[],
): number[] {
  if (sizes === undefined) return defaultVal;
  if (typeof sizes === "number") return [sizes];
  return sizes;
}

export function SplitView(props: SplitViewProps, children?: ViewChildren) {
  const {
    direction = "horizontal",
    defaultSizes,
    minSizes,
    maxSizes,
    dividerStyle = "thin",
    onResize,
    ...rest
  } = props;

  let $elm: any = null;
  const box$ = Box<SplitViewState>(rest, {
    direction,
    sizes: normalizeSizes(defaultSizes, [50, 50]),
    isResizing: false,
    dividerIndex: null,
    dividerStyle,
  } as SplitViewState);
  const state = box$.state;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      if (direction !== undefined) state.direction = direction;
      if (defaultSizes) {
        state.sizes = normalizeSizes(defaultSizes, [50, 50]);
      }
      if (dividerStyle !== undefined) state.dividerStyle = dividerStyle;
    },
    setSize(index: number, size: number) {
      const minArr = normalizeSizes(
        minSizes,
        Array(state.sizes.length).fill(10),
      );
      const maxArr = normalizeSizes(
        maxSizes,
        Array(state.sizes.length).fill(90),
      );
      const min = minArr[index] ?? 10;
      const max = maxArr[index] ?? 90;
      const clamped = Math.max(min, Math.min(max, size));
      state.sizes[index] = clamped;
      onResize?.([...state.sizes]);
    },
    startResize(dividerIndex: number) {
      state.isResizing = true;
      state.dividerIndex = dividerIndex;
    },
    endResize() {
      state.isResizing = false;
      state.dividerIndex = null;
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "split-view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    methods,
  };
}

export type SplitPaneProps = ViewProps & {
  size?: number;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
};

type SplitPaneState = {
  size: number;
  minSize: number;
  maxSize: number;
  isCollapsed: boolean;
};

export function SplitPane(props: SplitPaneProps, children?: ViewChildren) {
  const {
    size = 50,
    minSize = 10,
    maxSize = 90,
    collapsible = false,
    collapsedSize = 0,
    ...rest
  } = props;

  let $elm: any = null;
  const box$ = Box<SplitPaneState>(rest, {
    size,
    minSize,
    maxSize,
    isCollapsed: false,
  } as SplitPaneState);
  const state = box$.state;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      state.size = size;
      state.minSize = minSize;
      state.maxSize = maxSize;
    },
    setSize(newSize: number) {
      if (collapsible && newSize <= minSize) {
        state.size = collapsedSize;
        state.isCollapsed = true;
      } else {
        state.size = Math.max(minSize, Math.min(maxSize, newSize));
        state.isCollapsed = false;
      }
    },
    collapse() {
      if (collapsible) {
        state.size = collapsedSize;
        state.isCollapsed = true;
      }
    },
    expand() {
      if (state.isCollapsed) {
        state.size = minSize;
        state.isCollapsed = false;
      }
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  return {
    t: "split-pane",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    methods,
  };
}
