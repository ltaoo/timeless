import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import {
  ClassNameRef,
  isClassNameRef,
  RawViewStyleProperties,
  ViewStyle,
} from "@/style";

import { TimelessElement, ViewAttributes } from "./type";
import { MountedEvent } from "@/event";
import { VNodeView } from "@/vnode/view";

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

  const state: BoxState & T = {
    rendered: false,
    style: {},
    styleSet: [],
    dataset: {},
    attributes: {},
    children: [],
    ...extra_state,
  };
  const events = {
    onClick: props.onClick,
    onDoubleClick: props.onDoubleClick,
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    onMouseDown: props.onMouseDown,
    onMouseUp: props.onMouseUp,
    onLongPress: props.onLongPress,
    onPointerDown: props.onPointerDown,
    onInput: props.onInput,
    onChange: props.onChange,
    onFocus: props.onFocus,
    onBlur: props.onBlur,
    onKeyDown: props.onKeyDown,
    onContextMenu: props.onContextMenu,
    onDragStart: props.onDragStart,
    onDrag: props.onDrag,
    onDragEnd: props.onDragEnd,
    onDragEnter: props.onDragEnter,
    onDragOver: props.onDragOver,
    onDragLeave: props.onDragLeave,
    onDrop: props.onDrop,
    onAnimationEnd: props.onAnimationEnd,
  };

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
    handle_value() {
      const attributes = props.attributes;
      if (attributes) {
        Object.keys(attributes).forEach((k) => {
          const vv = attributes[k];
          if (isRef(vv)) {
            vv.subscribe({
              onChange(v) {
                state.attributes[k] = v as any;
                if ($elm) {
                  methods.apply_attr(k, v);
                }
              },
            });
            state.attributes[k] = vv.value;
            return;
          }
          state.attributes[k] = vv;
        });
      }
      const dataset = props.dataset;
      if (dataset) {
        Object.keys(dataset).forEach((k) => {
          const vv = dataset[k];
          if (isRef(vv)) {
            vv.subscribe({
              onChange(v) {
                if ($elm) {
                  methods.apply_attr(k, v);
                }
              },
            });
            state.dataset[k] = vv.value;
            return;
          }
          state.dataset[k] = vv;
        });
      }
      const cls = props.class;
      if (cls !== undefined) {
        if (typeof cls === "string") {
          state.styleSet = cls.split(" ");
          //   console.log("split cls", cls, state.styleSet);
        } else if (isRef(cls)) {
          cls.subscribe({
            onChange(v: any) {
              state.styleSet = v.split(" ");
              if ($elm) {
                $elm.setStyleSet(v.split(" "));
              }
            },
          });
          state.styleSet = cls.value.split(" ");
        } else if (isClassNameRef(cls)) {
          cls.subscribe({
            onChange(v) {
              state.styleSet = v as string[];
              if ($elm && typeof $elm.setStyleSet === "function") {
                $elm.setStyleSet(v);
              }
            },
          });
          state.styleSet = cls.value;
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
              sv.subscribe({
                onChange(v) {
                  if ($elm) {
                    $elm.setStyleValue(k, v);
                  }
                },
              });
              state.style[k] = sv.value;
            } else {
              state.style[k] = sv;
            }
          });
          style.subscribe({
            onChange(v) {
              state.style = v as RawViewStyleProperties;
              if ($elm && typeof $elm.setStyle === "function") {
                $elm.setStyle(v);
              }
            },
          });
        } else {
          Object.keys(style).forEach((k) => {
            const v = style[k];
            if (isRef(v)) {
              state.style[k] = v.value;
              v.subscribe({
                onChange(v) {
                  if ($elm) {
                    $elm.setStyleValue(k, v);
                  }
                },
              });
            } else {
              state.style[k] = v;
            }
          });
        }
      }
    },
  };
  return {
    state,
    events,
    methods,
  };
}
