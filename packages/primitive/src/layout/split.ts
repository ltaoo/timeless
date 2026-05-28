import { ViewProps } from "@/content/view";
import { ViewChildren, isElement, resolve_children } from "@/content/type";
import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";
import { isRef, type Ref } from "@timeless/reactive";
import { Text } from "@/content/text";
import { getPlatform } from "@/platform";

const platform = getPlatform();

export type SplitDirection = "horizontal" | "vertical";

export type CollapseEvent = {
  data: { collapsed: boolean };
  $elm: ReturnType<typeof SplitPane> & {
    disableHandler: (disabled: boolean) => void;
  };
};

export type SplitViewProps = BoxProps & {
  direction?: SplitDirection;
  resizable?: boolean;
  panels: {
    size: string | number;
    minSize?: number;
    style: BoxProps["style"];
    content: ViewChildren;
    collapsed?: Ref<boolean>;
    onCollapse?: (event: CollapseEvent) => void;
    onCollapsed?: (event: CollapseEvent) => void;
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
    resizable = true,
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
    updateGridTemplate() {
      if (!$elm) return;
      const templateProp =
        state.direction === "vertical"
          ? "gridTemplateRows"
          : "gridTemplateColumns";
      const tracks = state.panels
        .map((panel: any) => {
          if (panel.t === "split-handler") return "1px";
          const size = panel.state.size;
          if (typeof size === "number") return `${size}px`;
          if (size === "auto") return "1fr";
          return String(size);
        })
        .join(" ");
      $elm.setStyleValue(
        "transition",
        "grid-template-columns 0.3s ease, grid-template-rows 0.3s ease",
      );
      $elm.setStyleValue(templateProp, tracks);
      setTimeout(() => {
        $elm.setStyleValue?.("transition", "");
      }, 300);
    },
    build_panels() {
      // const panels$: ReturnType<typeof SplitPane> = [];
      for (let i = 0; i < props.panels.length; i += 1) {
        const panel = props.panels[i];
        const panel$ = SplitPane({ ...panel, direction }, panel.content);
        state.panels.push(panel$);

        (panel$ as any).disableHandler = (disabled: boolean) => {
          const panelIdx = i * 2;
          const prevHandler = state.panels[panelIdx - 1];
          const nextHandler = state.panels[panelIdx + 1];
          for (const h of [prevHandler, nextHandler]) {
            if (h && h.t === "split-handler") {
              h.state.isCollapsed = disabled;
              h.$elm?.setStyleValue?.(
                "pointerEvents",
                disabled ? "none" : "",
              );
              h.$elm?.setStyleValue?.("opacity", disabled ? "0.3" : "");
            }
          }
        };

        if (isRef(panel.collapsed)) {
          const ref = panel.collapsed as Ref<boolean>;
          ref.subscribe({
            onChange(collapsed: boolean) {
              const event: CollapseEvent = {
                data: { collapsed },
                $elm: panel$ as any,
              };
              panel.onCollapse?.(event);
              if (collapsed) {
                panel$.state.originalSize = panel$.state.size;
                panel$.state.size = panel$.state.minSize || 0;
                panel$.state.isCollapsed = true;
              } else {
                const $dom = panel$.$elm?.get$elm?.();
                if ($dom) $dom.style.visibility = "";
                panel$.state.size =
                  panel$.state.originalSize || panel$.state.minSize || 100;
                panel$.state.isCollapsed = false;
              }
              methods.updateGridTemplate();
              setTimeout(() => {
                panel.onCollapsed?.(event);
              }, 300);
            },
          });
        }
        if (resizable && i < props.panels.length - 1) {
          const handler$ = SplitHandler({ direction });
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
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
      for (let i = 0; i < children.length; i += 1) {
        const child = children[i];
        if (isElement(child) && child.beforeUnmounted) {
          child.beforeUnmounted();
        }
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
  direction?: SplitDirection;
  onCollapse?: (event: CollapseEvent) => void;
  onCollapsed?: (event: CollapseEvent) => void;
};

type SplitPaneState = {
  direction: SplitDirection;
  size: number;
  minSize?: number;
  maxSize?: number;
  isCollapsed?: boolean;
  originalSize?: number;
};

export function SplitPane(props: SplitPaneProps, children?: ViewChildren) {
  const {
    size = 50,
    minSize = 10,
    maxSize = 90,
    collapsible = false,
    direction: paneDirection = "horizontal",
    onCollapse,
    onCollapsed,
    // collapsedSize = 0,
    ...rest
  } = props;

  let $elm: any = null;
  const box$ = Box<SplitPaneState>(rest, {
    direction: paneDirection,
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
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.beforeUnmounted) {
          child.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  };
}

type SplitHandlerProps = BoxProps & {
  direction?: SplitDirection;
};
type SplitHandlerState = {
  direction: SplitDirection;
};

export function SplitHandler(
  props: SplitHandlerProps,
  children?: ViewChildren,
) {
  const { direction: handlerDirection = "horizontal", ...rest } = props;

  let $elm: any = null;
  const box$ = Box<SplitHandlerState>(rest, {
    direction: handlerDirection,
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
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.beforeUnmounted) {
          child.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
    },
  };
}
