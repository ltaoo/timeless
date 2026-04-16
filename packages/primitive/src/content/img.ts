/**
 * Img - A component for rendering image elements.
 *
 * Native image component with support for:
 * - Reactive src/alt for dynamic image changes
 * - Loading states (lazy/eager)
 * - srcset for responsive images
 * - All standard img attributes
 *
 * @example
 * ```tsx
 * <Img
 *   src={imageUrl}
 *   alt="Description"
 *   loading="lazy"
 *   onLoad={() => console.log('loaded')}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import { isClassNameRef, RawViewStyleProperties } from "@/style";
import { MountedEvent } from "@/event/index";
import { ListenerManager } from "@/util/listener";
import { VNodeView } from "@/vnode/view";
import { BoxProps } from "./box";

/** Props for Img component */
export type ImgProps = BoxProps & {
  /** Image source URL */
  src?: string | DerivedRef<string> | Ref<string>;
  /** Alternative text for accessibility */
  alt?: string | DerivedRef<string> | Ref<string>;
  /** Image width */
  width?: number | string | DerivedRef<number | string> | Ref<number | string>;
  /** Image height */
  height?: number | string | DerivedRef<number | string> | Ref<number | string>;
  /** Loading strategy: "lazy" or "eager" */
  loading?: "lazy" | "eager" | DerivedRef<string> | Ref<string>;
  /** Decoding strategy */
  decoding?: "async" | "sync" | "auto" | DerivedRef<string> | Ref<string>;
  /** Cross-origin attribute */
  crossOrigin?:
    | "anonymous"
    | "use-credentials"
    | ""
    | DerivedRef<string>
    | Ref<string>;
  /** Source set for responsive images */
  srcset?: string | Ref<string>;
  /** Sizes descriptor */
  sizes?: string | Ref<string>;
  /** Referrer policy */
  referrerPolicy?: ReferrerPolicy | Ref<string>;
  /** Fetch priority */
  fetchPriority?: "high" | "low" | "auto" | DerivedRef<string> | Ref<string>;
  /** USEMap attribute */
  useMap?: string | DerivedRef<string> | Ref<string>;
  /** IsMap attribute */
  isMap?: boolean;
  /** Load event handler */
  onLoad?(e: Event): void;
  /** Error event handler */
  onError?(e: Event): void;
  onMounted?(
    event: MountedEvent<VNodeView<HTMLImageElement>>,
  ): void | (() => void);
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};

/** Internal state for Img */
type ImgState = {
  rendered: boolean;
  src: string | null;
  style: RawViewStyleProperties;
  styleSet: string[];
};

/**
 * Creates an Img component.
 *
 * @param props - Image component props
 * @returns A TimelessElement representing an image
 */
export function Img(props: ImgProps) {
  // const host = getHost();
  const {
    style,
    class: cls,
    dataset = {},
    onMounted,
    onUnmounted,
    beforeUnmounted,
    onClick,
    onDoubleClick,
    onLongPress,
    onFocus,
    onBlur,
    onPointerDown,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    draggable,
    isMap,
    onLoad,
    onError,
    ...rest
  } = props as ImgProps & Record<string, any>;

  let $elm: any = null;
  const state: ImgState = {
    rendered: false,
    src: null,
    style: {},
    styleSet: [],
  };
  const events = {
    onClick,
    onDoubleClick,
    onLongPress,
    onFocus,
    onBlur,
    onPointerDown,
    onKeyDown,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    draggable,
    isMap,
    onLoad,
    onError,
    onMounted,
    onUnmounted,
    beforeUnmounted,
  };
  const listener$ = ListenerManager();

  const methods = {
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

    // Helper: create event listener
    listen(
      target: any,
      type: string,
      handler: (event: any) => void,
      options?: any,
    ) {
      target.addEventListener(type, handler, options);
      listener$.push(function () {
        target.removeEventListener(type, handler, options);
      });
    },

    subscribe_props() {
      const attributes = props.attributes ?? {};
      if (attributes) {
        Object.keys(attributes).forEach((k) => {
          const vv = attributes[k];
          if (isRef(vv)) {
            vv.subscribe({
              onChange(v) {
                if ($elm) {
                  methods.apply_attr(k, v);
                }
              },
            });
            methods.apply_attr(k, vv.value);
            return;
          }
          methods.apply_attr(k, vv);
        });
      }
      Object.keys(dataset).forEach((k) => {
        if (!dataset) return;
        const vv = dataset[k];
        const attrName = `data-${k}`;
        if (isRef(vv)) {
          vv.subscribe({
            onChange(v) {
              if ($elm) {
                methods.apply_attr(attrName, v);
              }
            },
          });
          methods.apply_attr(attrName, vv.value);
          return;
        }
        methods.apply_attr(attrName, vv);
      });
      if (props.src) {
        if (isRef(props.src)) {
          state.src = props.src.value;
          props.src.subscribe({
            onChange(v: any) {
              state.src = v;
              if ($elm && $elm.setSrc) {
                $elm.setSrc(v);
              }
            },
          });
        } else {
          state.src = props.src;
        }
      }
      if (cls) {
        if (typeof cls === "string") {
          // host.setClassName($elm, cls);
          // $elm.setStyleSet(cls);
          state.styleSet = [cls];
        } else if (isRef(cls)) {
          cls.subscribe({
            onChange(v: any) {
              if ($elm) {
                // host.setClassName($elm, v);
                $elm.setStyleSet(v);
              }
            },
          });
          // host.setClassName($elm, cls.value);
          // $elm.setStyleSet(cls.value);
          state.styleSet = [cls.value];
        } else if (isClassNameRef(cls)) {
          cls.subscribe({
            onChange(v: any) {
              if ($elm) {
                // host.setClassName($elm, v.join(" "));
                $elm.setStyleSet(v.join(" "));
              }
            },
          });
          // host.setClassName($elm, cls.toString());
          // $elm.setStyleSet(cls.toString());
          state.styleSet = cls.toString().split(" ");
        } else {
          state.styleSet = [];
        }
      }
      if (style) {
        (() => {
          if (isRef(style)) {
            state.style = style.value as RawViewStyleProperties;
            // style.subscribe({
            //   onChange() {
            //     state.style = {
            //       ...state.style,
            //       ...(style.value || {}),
            //     };
            //     if ($elm && typeof $elm.setStyle === "function") {
            //       $elm.setStyle(state.style);
            //     }
            //   },
            // });
            return;
          }
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
          return;
        })();
      }

      if (!$elm) {
        return;
      }

      if (onClick) {
        const handler = function (event: MouseEvent) {
          if (onClick) {
            onClick(event);
          }
        };
        methods.listen($elm, "click", handler);
      }

      if (onDoubleClick) {
        const handler = function (event: MouseEvent) {
          if (onDoubleClick) {
            onDoubleClick(event);
          }
        };
        methods.listen($elm, "dblclick", handler);
      }

      if (onLongPress) {
        let longPressTimer: any = null;
        let startX = 0;
        let startY = 0;
        const longPressDuration = 500;
        const moveThreshold = 10;

        const handleStart = (event: PointerEvent) => {
          startX = event.clientX;
          startY = event.clientY;
          longPressTimer = setTimeout(() => {
            if (onLongPress) {
              onLongPress(event);
            }
            longPressTimer = null;
          }, longPressDuration);
        };

        const handleMove = (event: PointerEvent) => {
          if (longPressTimer) {
            const deltaX = Math.abs(event.clientX - startX);
            const deltaY = Math.abs(event.clientY - startY);
            if (deltaX > moveThreshold || deltaY > moveThreshold) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          }
        };

        const handleEnd = () => {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        };

        methods.listen($elm, "pointerdown", handleStart);
        methods.listen($elm, "pointermove", handleMove);
        methods.listen($elm, "pointerup", handleEnd);
        methods.listen($elm, "pointercancel", handleEnd);
      }

      if (onPointerDown) {
        const handler = function (event: PointerEvent) {
          if (onPointerDown) onPointerDown(event);
        };
        methods.listen($elm, "pointerdown", handler);
      }
      if (onFocus) {
        const handler = function (event: FocusEvent) {
          onFocus(event);
        };
        methods.listen($elm, "focus", handler);
      }
      if (onBlur) {
        const handler = function (event: FocusEvent) {
          if (onBlur) onBlur(event);
        };
        methods.listen($elm, "blur", handler);
      }
      if (onKeyDown) {
        const handler = function (event: KeyboardEvent) {
          if (onKeyDown) onKeyDown(event);
        };
        methods.listen($elm, "keydown", handler);
      }
      // if (onContextMenu) {
      //   const handler = function (event: MouseEvent) {
      //     if (onContextMenu) onContextMenu(event);
      //   };
      //   methods.listen($elm, "contextmenu", handler);
      // }
      if (onMouseEnter) {
        const handler = function (event: MouseEvent) {
          onMouseEnter(event);
        };
        methods.listen($elm, "mouseenter", handler);
      }
      if (onMouseLeave) {
        const handler = function (event: MouseEvent) {
          onMouseLeave(event);
        };
        methods.listen($elm, "mouseleave", handler);
      }

      if (draggable !== undefined) {
        // host.setAttribute($elm, "draggable", String(draggable));
        $elm.setAttribute("draggable", String(draggable));
      }

      if (onDragStart) {
        const handler = function (event: DragEvent) {
          if (onDragStart) onDragStart(event);
        };
        methods.listen($elm, "dragstart", handler);
      }

      if (onDrag) {
        const handler = function (event: DragEvent) {
          if (onDrag) onDrag(event);
        };
        methods.listen($elm, "drag", handler);
      }

      if (onDragEnd) {
        const handler = function (event: DragEvent) {
          if (onDragEnd) onDragEnd(event);
        };
        methods.listen($elm, "dragend", handler);
      }

      if (onDragEnter) {
        const handler = function (event: DragEvent) {
          if (onDragEnter) onDragEnter(event);
        };
        methods.listen($elm, "dragenter", handler);
      }

      if (onDragOver) {
        const handler = function (event: DragEvent) {
          if (onDragOver) onDragOver(event);
        };
        methods.listen($elm, "dragover", handler);
      }

      if (onDragLeave) {
        const handler = function (event: DragEvent) {
          if (onDragLeave) onDragLeave(event);
        };
        methods.listen($elm, "dragleave", handler);
      }

      if (onDrop) {
        const handler = function (event: DragEvent) {
          if (onDrop) onDrop(event);
        };
        methods.listen($elm, "drop", handler);
      }

      // if (onAnimationEnd) {
      //   const handler = function (event: AnimationEvent) {
      //     if (onAnimationEnd) {
      //       onAnimationEnd(event);
      //     }
      //   };
      //   methods.listen($elm, "animationend", handler);
      // }
    },
  };

  methods.subscribe_props();

  return {
    t: "img",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      $elm = v;
    },
    state,
    events,
    onMounted(event: MountedEvent) {
      if (onMounted) {
        onMounted(event);
      }
    },
    beforeUnmounted() {
      if (beforeUnmounted) {
        beforeUnmounted();
      }
    },
    onUnmounted() {
      listener$.clean();
      if (onUnmounted) {
        onUnmounted();
      }
      // Reset state for potential re-render
      state.rendered = false;
    },
  };
}

export type Img = ReturnType<typeof Img>;

export function isImg(v: any) {
  return v.t === "img";
}
