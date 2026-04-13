import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import {
  ClassNameRef,
  isClassNameRef,
  RawViewStyleProperties,
  ViewStyle,
} from "@/style";
import { MountedEvent } from "@/event";
import { VNodeView } from "@/vnode/view";
import { ListenerManager } from "@/util/listener";

import {
  isElement,
  TimelessElement,
  ViewAttributes,
  ViewChildren,
} from "./type";
import { Text } from "./text";

export type BoxProps = {
  key?: string | number;
  as?: string;
  style?: ViewStyle;
  class?: string | DerivedRef<string> | Ref<string> | ClassNameRef;
  draggable?: boolean;
  attributes?: ViewAttributes;
  dataset?: Record<
    string,
    | undefined
    | string
    | number
    | DerivedRef<string | number | boolean | undefined>
    | Ref<string | number | boolean | undefined>
  >;
} & BoxEvents;
export type BoxEvents = Partial<{
  onMounted?: (event: MountedEvent<VNodeView>) => void | (() => void);
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
  onClick?: (e: MouseEvent) => void;
  onDoubleClick?: (e: MouseEvent) => void;
  onMouseDown?: (e: MouseEvent) => void;
  onMouseUp?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onLongPress?: (e: PointerEvent) => void;
  onPointerDown?: (e: PointerEvent) => void;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onContextMenu?: (e: MouseEvent) => void;
  onDragStart?: (e: DragEvent) => void;
  onDrag?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  onDragEnter?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
  onAnimationEnd?: (e: AnimationEvent) => void;
}>;
export type BoxState = {
  rendered: boolean;
  style: RawViewStyleProperties;
  styleSet: string[];
  attributes: Record<string, string | number | boolean | undefined>;
  dataset: Record<string, string | number | boolean | undefined>;
  children: (TimelessElement | null)[];
};

export function Box<T>(props: BoxProps, extra_state: T) {
  let $elm: any = null;
  const listener$ = ListenerManager();

  const state: BoxState & T = {
    rendered: false,
    style: {},
    styleSet: [],
    dataset: {},
    attributes: {},
    children: [],
    ...extra_state,
  };
  const events: BoxEvents = {};

  const methods = {
    set$elm(elm: any) {
      $elm = elm;
    },
    // Helper: apply attribute
    apply_attr(k: string, v: any) {
      if (v === undefined || v === null || v === false) {
        // host.removeAttribute($elm, k);
        if ($elm && typeof $elm.removeAttribute === "function") {
          $elm.removeAttribute(k);
        }
        return;
      }
      if (v === true) {
        // host.setAttribute($elm, k, "");
        if ($elm && typeof $elm.setAttribute === "function") {
          $elm.setAttribute(k, "");
        }
        return;
      }
      // host.setAttribute($elm, k, String(v));
      if ($elm && typeof $elm.setAttribute === "function") {
        $elm.setAttribute(k, String(v));
      }
    },
    subscribe_props() {
      const cls = props.class;
      // console.log("[]box - before subscribe class", cls);
      if (cls !== undefined) {
        if (typeof cls === "string") {
          state.styleSet = cls.split(" ");
          //   console.log("split cls", cls, state.styleSet);
        } else if (isRef(cls)) {
          state.styleSet = cls.value.split(" ");
          const unsubscribe = cls.subscribe({
            onChange(v: any) {
              state.styleSet = v.split(" ");
              if ($elm && typeof $elm.setStyleSet === "function") {
                console.log("[primitive]before invoke setStyle1");
                $elm.setStyleSet(v.split(" "));
              }
            },
          });
          listener$.add(unsubscribe);
        } else if (isClassNameRef(cls)) {
          state.styleSet = cls.value;
          const unsubscribe = cls.subscribe({
            onChange(v: string[]) {
              state.styleSet = v;
              if ($elm && typeof $elm.setStyleSet === "function") {
                console.log("[primitive]before invoke setStyle2");
                $elm.setStyleSet(v);
              }
            },
          });
          listener$.add(unsubscribe);
        } else {
          state.styleSet = [];
        }
      }
      const style = props.style;
      if (style !== undefined) {
        if (isRef(style)) {
          Object.keys(style.value || {}).forEach((k) => {
            const sv = style.value[k];
            if (isRef(sv)) {
              state.style[k] = sv.value;
              const unsubscribe = sv.subscribe({
                onChange(v) {
                  if ($elm) {
                    $elm.setStyleValue(k, v);
                  }
                },
              });
              listener$.add(unsubscribe);
            } else {
              state.style[k] = sv;
            }
          });
          const unsubscribe = style.subscribe({
            onChange(v) {
              state.style = v as RawViewStyleProperties;
              if ($elm && typeof $elm.setStyle === "function") {
                $elm.setStyle(v);
              }
            },
          });
          listener$.add(unsubscribe);
        } else {
          Object.keys(style).forEach((k) => {
            const v = style[k];
            if (isRef(v)) {
              state.style[k] = v.value;
              const unsubscribe = v.subscribe({
                onChange(v) {
                  if ($elm) {
                    $elm.setStyleValue(k, v);
                  }
                },
              });
              listener$.add(unsubscribe);
            } else {
              state.style[k] = v;
            }
          });
        }
      }
      const attributes = props.attributes;
      if (attributes) {
        Object.keys(attributes).forEach((k) => {
          const vv = attributes[k];
          if (isRef(vv)) {
            state.attributes[k] = vv.value;
            const unsubscribe = vv.subscribe({
              onChange(v) {
                state.attributes[k] = v as any;
                if ($elm) {
                  methods.apply_attr(k, v);
                }
              },
            });
            listener$.add(unsubscribe);
          } else {
            state.attributes[k] = vv;
          }
        });
      }
      const dataset = props.dataset;
      if (dataset) {
        Object.keys(dataset).forEach((k) => {
          const vv = dataset[k];
          if (isRef(vv)) {
            state.dataset[k] = vv.value;
            const unsubscribe = vv.subscribe({
              onChange(v) {
                if ($elm) {
                  methods.apply_attr(k, v);
                }
              },
            });
            listener$.add(unsubscribe);
          } else {
            state.dataset[k] = vv;
          }
        });
      }
    },
    build_children(children?: ViewChildren) {
      if (!children) {
        return;
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // console.log("for children", child);
        (() => {
          if (child === null) {
            state.children[i] = null;
            return;
          }
          if (isElement(child)) {
            state.children[i] = child;
            return;
          }
          if (isRef(child)) {
            state.children[i] = Text(child);
            return;
          }
          if (child) {
            state.children[i] = Text(String(child));
            return;
          }
          state.children[i] = null;
        })();
      }
    },
    add_event() {
      if (props.onClick) {
        events.onClick = props.onClick;
      }
      if (props.onDoubleClick) {
        events.onDoubleClick = props.onDoubleClick;
      }
      if (props.onMouseEnter) {
        events.onMouseEnter = props.onMouseEnter;
      }
      if (props.onMouseDown) {
        events.onMouseDown = props.onMouseDown;
      }
      if (props.onMouseUp) {
        events.onMouseUp = props.onMouseUp;
      }
      if (props.onLongPress) {
        events.onLongPress = props.onLongPress;
      }
      if (props.onPointerDown) {
        events.onPointerDown = props.onPointerDown;
      }
      if (props.onInput) {
        events.onInput = props.onInput;
      }
      if (props.onChange) {
        events.onChange = props.onChange;
      }
      if (props.onBlur) {
        events.onBlur = props.onBlur;
      }
      if (props.onKeyDown) {
        events.onDragEnd = props.onDragEnd;
      }
      if (props.onDragEnter) {
        events.onDragEnter = props.onDragEnter;
      }
      if (props.onDragOver) {
        events.onDragOver = props.onDragOver;
      }
      if (props.onDragLeave) {
        events.onDragLeave = props.onDragLeave;
      }
      if (props.onDrop) {
        events.onDrop = props.onDrop;
      }
      if (props.onAnimationEnd) {
        events.onAnimationEnd = props.onAnimationEnd;
      }
    },
    add_listen: listener$.add,
    destroy() {
      listener$.clean();
    },
  };
  return {
    state,
    events,
    methods,
  };
}
