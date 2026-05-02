import { ViewProps } from "@/content/view";
import { ViewChildren, isElement, resolve_children } from "@/content/type";
import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";
import { isRef } from "@timeless/reactive";
import { Text } from "@/content/text";
import { getPlatform } from "@/platform";

const platform = getPlatform();

export type SplitDirection = "horizontal" | "vertical";

export type SplitViewProps = BoxProps & {
  direction?: SplitDirection;
  panels: {
    size: string | number;
    style: BoxProps["style"];
    content: ViewChildren;
  }[];
  // dividerStyle?: "thin" | "light" | "dark" | "none";
  onResize?: (sizes: number[]) => void;
};

type SplitViewState = {
  direction: SplitDirection;
  // sizes: number[];
  // isResizing: boolean;
  // dividerIndex: number | null;
  // dividerStyle: "thin" | "light" | "dark" | "none";
  panels: (ReturnType<typeof SplitPane> | ReturnType<typeof SplitHandler>)[];
};

function normalize_sizes(
  sizes: number | number[] | undefined,
  defaultVal: number[],
): number[] {
  if (sizes === undefined) return defaultVal;
  if (typeof sizes === "number") return [sizes];
  return sizes;
}

export function SplitView(props: SplitViewProps) {
  const {
    direction = "horizontal",
    // dividerStyle = "thin",
    onResize,
    ...rest
  } = props;

  let $elm: any = null;
  const box$ = Box<SplitViewState>(rest, {
    direction,
    panels: [],
    // sizes: normalize_sizes(defaultSizes, [50, 50]),
    isResizing: false,
    dividerIndex: null,
    // dividerStyle,
  } as SplitViewState);
  const state = box$.state;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      // if (direction !== undefined) state.direction = direction;
      // if (defaultSizes) {
      //   state.sizes = normalize_sizes(defaultSizes, [50, 50]);
      // }
      // if (dividerStyle !== undefined) state.dividerStyle = dividerStyle;
    },
    build_panels() {
      // const panels$: ReturnType<typeof SplitPane> = [];
      for (let i = 0; i < props.panels.length; i += 1) {
        const panel = props.panels[i];
        const panel$ = SplitPane(panel, panel.content);
        state.panels.push(panel$);
        if (i < props.panels.length - 1) {
          const handler$ = SplitHandler({});
          state.panels.push(handler$);
        }
      }
    },
    setSize(index: number, size: number) {
      // const minArr = normalize_sizes(
      //   minSizes,
      //   Array(state.sizes.length).fill(10),
      // );
      // const maxArr = normalize_sizes(
      //   maxSizes,
      //   Array(state.sizes.length).fill(90),
      // );
      // const min = minArr[index] ?? 10;
      // const max = maxArr[index] ?? 90;
      // const clamped = Math.max(min, Math.min(max, size));
      // state.sizes[index] = clamped;
      // onResize?.([...state.sizes]);
    },
    startResize(dividerIndex: number) {
      // state.isResizing = true;
      // state.dividerIndex = dividerIndex;
    },
    endResize() {
      // state.isResizing = false;
      // state.dividerIndex = null;
    },
  };

  methods.subscribe_props();
  methods.build_panels();
  // box$.methods.build_children(children);
  const children = state.panels;

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
    children,
    onMounted(event: MountedEvent) {
      if (rest.onMounted) {
        rest.onMounted(event);
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  };
}

export type SplitPaneProps = BoxProps & {
  size: number | string;
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
};

type SplitPaneState = {
  size: number;
  minSize?: number;
  maxSize?: number;
  isCollapsed?: boolean;
};

export function SplitPane(props: SplitPaneProps, children?: ViewChildren) {
  const {
    size = 50,
    minSize = 10,
    maxSize = 90,
    collapsible = false,
    // collapsedSize = 0,
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
      // state.size = size;
      state.minSize = minSize;
      state.maxSize = maxSize;
    },
    setSize(newSize: number) {
      // if (collapsible && newSize <= minSize) {
      //   state.size = collapsedSize;
      //   state.isCollapsed = true;
      // } else {
      //   state.size = Math.max(minSize, Math.min(maxSize, newSize));
      //   state.isCollapsed = false;
      // }
    },
    collapse() {
      // if (collapsible) {
      //   state.size = collapsedSize;
      //   state.isCollapsed = true;
      // }
    },
    expand() {
      // if (state.isCollapsed) {
      //   state.size = minSize;
      //   state.isCollapsed = false;
      // }
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
    onMounted(event: MountedEvent) {
      if (rest.onMounted) {
        rest.onMounted(event);
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  };
}

type SplitHandlerProps = BoxProps & {};
type SplitHandlerState = {};

export function SplitHandler(
  props: SplitHandlerProps,
  children?: ViewChildren,
) {
  const { ...rest } = props;

  let $elm: any = null;
  const box$ = Box<SplitHandlerState>(rest, {
    isCollapsed: false,
  } as SplitHandlerState);

  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
    },
    setSize(newSize: number) {
      // if (collapsible && newSize <= minSize) {
      //   state.size = collapsedSize;
      //   state.isCollapsed = true;
      // } else {
      //   state.size = Math.max(minSize, Math.min(maxSize, newSize));
      //   state.isCollapsed = false;
      // }
    },
    collapse() {
      // if (collapsible) {
      //   state.size = collapsedSize;
      //   state.isCollapsed = true;
      // }
    },
    expand() {
      // if (state.isCollapsed) {
      //   state.size = minSize;
      //   state.isCollapsed = false;
      // }
    },
  };

  methods.subscribe_props();
  box$.methods.build_children(children);

  events.onPointerDown = function (event) {
    console.log("split onPointerDown");
    // const cursor =
    //   state.direction === "horizontal" ? "col-resize" : "row-resize";
    const cursor = "col-resize";
    platform.patchBodyStyle({ cursor, "user-select": "none" });
  };
  // events.onMouseEnter = function() {
  // }

  return {
    t: "split-handler",
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
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  };
}
