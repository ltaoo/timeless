import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import {
  viewStyleToCssText,
  isClassNameRef,
  isStyleRef,
  ViewStyleProperties,
} from "@/style";
import { MountedEvent } from "@/event/index";

export interface ImgProps extends Omit<ViewProps, "type" | "as"> {
  src?: string | DerivedRef<string> | Ref<string>;
  alt?: string | DerivedRef<string> | Ref<string>;
  width?: number | string | DerivedRef<number | string> | Ref<number | string>;
  height?: number | string | DerivedRef<number | string> | Ref<number | string>;
  loading?: "lazy" | "eager" | DerivedRef<string> | Ref<string>;
  decoding?: "async" | "sync" | "auto" | DerivedRef<string> | Ref<string>;
  crossOrigin?:
    | "anonymous"
    | "use-credentials"
    | ""
    | DerivedRef<string>
    | Ref<string>;
  srcset?: string | Ref<string>;
  sizes?: string | Ref<string>;
  referrerPolicy?: ReferrerPolicy | Ref<string>;
  fetchPriority?: "high" | "low" | "auto" | DerivedRef<string> | Ref<string>;
  useMap?: string | DerivedRef<string> | Ref<string>;
  isMap?: boolean;
  onLoad?(e: Event): void;
  onError?(e: Event): void;
  onMounted?(event: MountedEvent<HTMLImageElement>): void | (() => void);
}

export function Img(props: ImgProps = {}) {
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

  let onMountedCleanup: (() => void) | undefined;
  const listenerCleanups: (() => void)[] = [];

  let $elm: any = null;
  let rendered = false;
  // const $elm = safeCreateElement("img") as unknown as HTMLImageElement;

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
      // host.addEventListener(target, type, handler, options);
      target.addEventListener(type, handler, options);
      listenerCleanups.push(() => {
        // host.removeEventListener(target, type, handler, options);
        target.removeEventListener(type, handler, options);
      });
    },

    setup_reactive_props_bindings() {
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

      if (cls) {
        if (typeof cls === "string") {
          // host.setClassName($elm, cls);
          // $elm.setStyleSet(cls);
          state.props.styleSet = [cls];
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
          state.props.styleSet = [cls.value];
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
          state.props.styleSet = cls.toString().split(" ");
        } else {
          state.props.styleSet = [];
        }
      }
      if (style) {
        (() => {
          if (isRef(style)) {
            state.props.style = style.value || {};
            style.subscribe({
              onChange() {
                state.props.style = {
                  ...state.props.style,
                  ...(style.value || {}),
                };
                if ($elm && typeof $elm.setStyle === "function") {
                  $elm.setStyle(state.props.style);
                }
              },
            });
            return;
          }
          Object.keys(style).forEach((k) => {
            const v = style[k];
            if (isRef(v)) {
              state.props.style[k] = v.value;
              v.subscribe({
                onChange(v) {
                  if ($elm) {
                    $elm.setStyleValue(k, v);
                  }
                },
              });
            } else {
              state.props.style[k] = v;
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

  const state: {
    props: {
      src: string | null;
      style: ViewStyleProperties;
      styleSet: string[];
    };
  } = {
    props: {
      src: null,
      style: {},
      styleSet: [],
    },
  };

  if (props.src) {
    if (isRef(props.src)) {
      state.props.src = props.src.value;
      props.src.subscribe({
        onChange(v: any) {
          state.props.src = v;
          if ($elm && $elm.setSrc) {
            $elm.setSrc(v);
          }
        },
      });
    } else {
      state.props.src = props.src;
    }
  }

  methods.setup_reactive_props_bindings();

  return {
    t: "img",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      $elm = v;
    },
    value: state.props.src,
    state: {},
    props: state.props,
    render() {
      if (rendered) {
        return $elm;
      }
      rendered = true;

      // const listen = (
      //   type: string,
      //   handler: (event: any) => void,
      //   options?: any,
      // ) => {
      //   host.addEventListener($elm, type, handler, options);
      //   listenerCleanups.push(() => {
      //     host.removeEventListener($elm, type, handler, options);
      //   });
      // };

      // const applyAttr = (k: string, v: any) => {
      //   if (v === undefined || v === null || v === false) {
      //     host.removeAttribute($elm, k);
      //     return;
      //   }
      //   if (v === true) {
      //     host.setAttribute($elm, k, "");
      //     return;
      //   }
      //   host.setAttribute($elm, k, String(v));
      // };

      // Object.keys(rest).forEach((k) => {
      //   const vv = rest[k];
      //   if (vv !== undefined && vv !== null) {
      //     if (isRef(vv)) {
      //       vv.subscribe({
      //         onChange(v) {
      //           applyAttr(k, v);
      //         },
      //       });
      //       applyAttr(k, vv.value);
      //     } else if (typeof vv === "string" || typeof vv === "number") {
      //       applyAttr(k, vv);
      //     }
      //   }
      // });

      // Object.keys(dataset).forEach((k) => {
      //   if (!dataset) return;
      //   const vv = dataset[k];
      //   const attrName = `data-${k}`;
      //   if (isRef(vv)) {
      //     vv.subscribe({
      //       onChange(v) {
      //         applyAttr(attrName, v);
      //       },
      //     });
      //     applyAttr(attrName, vv.value);
      //     return;
      //   }
      //   applyAttr(attrName, vv);
      // });

      // if (cls) {
      //   if (typeof cls === "string") {
      //     host.setClassName($elm, cls);
      //   } else if (isRef(cls)) {
      //     cls.subscribe({
      //       onChange(v) {
      //         host.setClassName($elm, String(v));
      //       },
      //     });
      //     host.setClassName($elm, String(cls.value));
      //   } else if (isClassName(cls)) {
      //     cls.subscribe({
      //       onChange(v: any) {
      //         host.setClassName(
      //           $elm,
      //           Array.isArray(v) ? v.join(" ") : String(v ?? ""),
      //         );
      //       },
      //     });
      //     host.setClassName($elm, cls.toString());
      //   }
      // }

      // if (style) {
      //   if (isStyleRef(style as any)) {
      //     const st = style as any;
      //     st.subscribe({
      //       onChange(v: any) {
      //         host.setStyleText($elm, viewStyleToCssText(v ?? {}));
      //       },
      //     });
      //     host.setStyleText($elm, viewStyleToCssText(st.value));
      //   } else if (isRef(style)) {
      //     const st = style as any;
      //     const apply = () =>
      //       host.setStyleText($elm, viewStyleToCssText(st.value || {}));
      //     st.subscribe({
      //       onChange() {
      //         apply();
      //       },
      //     });
      //     apply();
      //   } else {
      //     const applyStyle = () => {
      //       host.setStyleText($elm, viewStyleToCssText(style as any));
      //     };
      //     Object.keys(style as any).forEach((k) => {
      //       const vv = (style as any)[k];
      //       if (isRef(vv)) {
      //         (vv as any).subscribe({
      //           onChange() {
      //             applyStyle();
      //           },
      //         });
      //       }
      //     });
      //     applyStyle();
      //   }
      // }

      // if (onClick) {
      //   const handler = function (event: MouseEvent) {
      //     if (onClick) {
      //       onClick(event);
      //     }
      //   };
      //   listen("click", handler);
      // }

      // if (onDoubleClick) {
      //   const handler = function (event: MouseEvent) {
      //     if (onDoubleClick) {
      //       onDoubleClick(event);
      //     }
      //   };
      //   listen("dblclick", handler);
      // }

      // if (onLongPress) {
      //   let longPressTimer: any = null;
      //   let startX = 0;
      //   let startY = 0;
      //   const longPressDuration = 500;
      //   const moveThreshold = 10;

      //   const handleStart = (event: PointerEvent) => {
      //     startX = event.clientX;
      //     startY = event.clientY;
      //     longPressTimer = host.setTimeout(() => {
      //       if (onLongPress) {
      //         onLongPress(event);
      //       }
      //       longPressTimer = null;
      //     }, longPressDuration);
      //   };

      //   const handleMove = (event: PointerEvent) => {
      //     if (longPressTimer) {
      //       const deltaX = Math.abs(event.clientX - startX);
      //       const deltaY = Math.abs(event.clientY - startY);
      //       if (deltaX > moveThreshold || deltaY > moveThreshold) {
      //         host.clearTimeout(longPressTimer);
      //         longPressTimer = null;
      //       }
      //     }
      //   };

      //   const handleEnd = () => {
      //     if (longPressTimer) {
      //       host.clearTimeout(longPressTimer);
      //       longPressTimer = null;
      //     }
      //   };

      //   listen("pointerdown", handleStart);
      //   listen("pointermove", handleMove);
      //   listen("pointerup", handleEnd);
      //   listen("pointercancel", handleEnd);
      // }

      // if (onPointerDown) {
      //   const handler = function (event: PointerEvent) {
      //     if (onPointerDown) onPointerDown(event);
      //   };
      //   listen("pointerdown", handler);
      // }
      // if (onFocus) {
      //   const handler = function (event: FocusEvent) {
      //     onFocus(event);
      //   };
      //   listen("focus", handler);
      // }
      // if (onBlur) {
      //   const handler = function (event: FocusEvent) {
      //     if (onBlur) onBlur(event);
      //   };
      //   listen("blur", handler);
      // }
      // if (onKeyDown) {
      //   const handler = function (event: KeyboardEvent) {
      //     if (onKeyDown) onKeyDown(event);
      //   };
      //   listen("keydown", handler);
      // }
      // if (onMouseEnter) {
      //   const handler = function (event: MouseEvent) {
      //     onMouseEnter(event);
      //   };
      //   listen("mouseenter", handler);
      // }
      // if (onMouseLeave) {
      //   const handler = function (event: MouseEvent) {
      //     onMouseLeave(event);
      //   };
      //   listen("mouseleave", handler);
      // }

      // if (draggable !== undefined) {
      //   host.setAttribute($elm, "draggable", String(draggable));
      // }

      // if (onDragStart) {
      //   const handler = function (event: DragEvent) {
      //     if (onDragStart) onDragStart(event);
      //   };
      //   listen("dragstart", handler);
      // }

      // if (onDrag) {
      //   const handler = function (event: DragEvent) {
      //     if (onDrag) onDrag(event);
      //   };
      //   listen("drag", handler);
      // }

      // if (onDragEnd) {
      //   const handler = function (event: DragEvent) {
      //     if (onDragEnd) onDragEnd(event);
      //   };
      //   listen("dragend", handler);
      // }

      // if (onDragEnter) {
      //   const handler = function (event: DragEvent) {
      //     if (onDragEnter) onDragEnter(event);
      //   };
      //   listen("dragenter", handler);
      // }

      // if (onDragOver) {
      //   const handler = function (event: DragEvent) {
      //     if (onDragOver) onDragOver(event);
      //   };
      //   listen("dragover", handler);
      // }

      // if (onDragLeave) {
      //   const handler = function (event: DragEvent) {
      //     if (onDragLeave) onDragLeave(event);
      //   };
      //   listen("dragleave", handler);
      // }

      // if (onDrop) {
      //   const handler = function (event: DragEvent) {
      //     if (onDrop) onDrop(event);
      //   };
      //   listen("drop", handler);
      // }

      // if (isMap) {
      //   host.setAttribute($elm, "ismap", "");
      // }

      // if (onLoad) {
      //   const handler = function (event: Event) {
      //     if (onLoad) onLoad(event);
      //   };
      //   listen("load", handler);
      // }

      // if (onError) {
      //   const handler = function (event: Event) {
      //     if (onError) onError(event);
      //   };
      //   listen("error", handler);
      // }

      if (onMounted) {
        const cleanup = onMounted({ target: $elm });
        if (typeof cleanup === "function") {
          onMountedCleanup = cleanup;
        }
      }

      return $elm;
    },
    beforeUnmounted() {
      if (beforeUnmounted) {
        beforeUnmounted();
      }
    },
    onUnmounted() {
      for (const fn of listenerCleanups) {
        fn();
      }
      listenerCleanups.length = 0;
      if (onMountedCleanup) {
        onMountedCleanup();
      }
      if (onUnmounted) {
        onUnmounted();
      }

      // Reset state for potential re-render
      rendered = false;
    },
  };
}

export type Img = ReturnType<typeof Img>;

export function isImg(v: any) {
  return v.t === "img";
}
