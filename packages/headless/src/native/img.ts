import { isClassName, isRef, isStyleRef, Ref } from "@timeless/reactive";

import { ViewProps } from "@/primitive/view";
import { getHost } from "@/host";
import { safeCreateElement } from "@/util/env";

export interface ImgProps extends Omit<ViewProps, "type" | "as"> {
  src?: string | Ref<string>;
  alt?: string | Ref<string>;
  width?: number | string | Ref<number | string>;
  height?: number | string | Ref<number | string>;
  loading?: "lazy" | "eager" | Ref<string>;
  decoding?: "async" | "sync" | "auto" | Ref<string>;
  crossOrigin?: "anonymous" | "use-credentials" | "" | Ref<string>;
  srcset?: string | Ref<string>;
  sizes?: string | Ref<string>;
  referrerPolicy?: ReferrerPolicy | Ref<string>;
  fetchPriority?: "high" | "low" | "auto" | Ref<string>;
  useMap?: string | Ref<string>;
  isMap?: boolean;
  onLoad?(e: Event): void;
  onError?(e: Event): void;
  onMounted?: ($elm: HTMLImageElement) => void;
}

export function NativeImg(props: ImgProps = {}) {
  const host = getHost();
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
  let rendered = false;
  const $elm = safeCreateElement("img") as unknown as HTMLImageElement;

  return {
    t: "view",
    $elm,
    render() {
      if (rendered) {
        return $elm;
      }
      rendered = true;

      const listen = (
        type: string,
        handler: (event: any) => void,
        options?: any,
      ) => {
        host.addEventListener($elm, type, handler, options);
        listenerCleanups.push(() => {
          host.removeEventListener($elm, type, handler, options);
        });
      };

      const applyAttr = (k: string, v: any) => {
        if (v === undefined || v === null || v === false) {
          host.removeAttribute($elm, k);
          return;
        }
        if (v === true) {
          host.setAttribute($elm, k, "");
          return;
        }
        host.setAttribute($elm, k, String(v));
      };

      Object.keys(rest).forEach((k) => {
        const vv = rest[k];
        if (vv !== undefined && vv !== null) {
          if (isRef(vv)) {
            vv._subscribe({
              onChange(v) {
                applyAttr(k, v);
              },
            });
            applyAttr(k, vv.value);
          } else if (typeof vv === "string" || typeof vv === "number") {
            applyAttr(k, vv);
          }
        }
      });

      Object.keys(dataset).forEach((k) => {
        if (!dataset) return;
        const vv = dataset[k];
        const attrName = `data-${k}`;
        if (isRef(vv)) {
          vv._subscribe({
            onChange(v) {
              applyAttr(attrName, v);
            },
          });
          applyAttr(attrName, vv.value);
          return;
        }
        applyAttr(attrName, vv);
      });

      if (cls) {
        if (typeof cls === "string") {
          host.setClassName($elm, cls);
        } else if (isRef(cls)) {
          cls._subscribe({
            onChange(v) {
              host.setClassName($elm, v);
            },
          });
          host.setClassName($elm, cls.value);
        } else if (isClassName(cls)) {
          cls._subscribe({
            onChange(v: string[]) {
              host.setClassName($elm, v.join(" "));
            },
          });
          host.setClassName($elm, cls.toString());
        }
      }

      if (style) {
        if (typeof style === "string") {
          host.setStyleText($elm, style);
        } else if (isRef(style)) {
          host.setStyleText($elm, style.value);
          style._subscribe({
            onChange(v: any) {
              host.setStyleText($elm, v);
            },
          });
        } else if (isStyleRef(style)) {
          style._subscribe({
            onChange(v: string) {
              host.setStyleText($elm, v);
            },
          });
          host.setStyleText($elm, style.toString());
        }
      }

      if (onClick) {
        const handler = function (event: MouseEvent) {
          if (onClick) {
            onClick(event);
          }
        };
        listen("click", handler);
      }

      if (onDoubleClick) {
        const handler = function (event: MouseEvent) {
          if (onDoubleClick) {
            onDoubleClick(event);
          }
        };
        listen("dblclick", handler);
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
          longPressTimer = host.setTimeout(() => {
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
              host.clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          }
        };

        const handleEnd = () => {
          if (longPressTimer) {
            host.clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        };

        listen("pointerdown", handleStart);
        listen("pointermove", handleMove);
        listen("pointerup", handleEnd);
        listen("pointercancel", handleEnd);
      }

      if (onPointerDown) {
        const handler = function (event: PointerEvent) {
          if (onPointerDown) onPointerDown(event);
        };
        listen("pointerdown", handler);
      }
      if (onFocus) {
        const handler = function (event: FocusEvent) {
          onFocus(event);
        };
        listen("focus", handler);
      }
      if (onBlur) {
        const handler = function (event: FocusEvent) {
          if (onBlur) onBlur(event);
        };
        listen("blur", handler);
      }
      if (onKeyDown) {
        const handler = function (event: KeyboardEvent) {
          if (onKeyDown) onKeyDown(event);
        };
        listen("keydown", handler);
      }
      if (onMouseEnter) {
        const handler = function (event: MouseEvent) {
          onMouseEnter(event);
        };
        listen("mouseenter", handler);
      }
      if (onMouseLeave) {
        const handler = function (event: MouseEvent) {
          onMouseLeave(event);
        };
        listen("mouseleave", handler);
      }

      if (draggable !== undefined) {
        host.setAttribute($elm, "draggable", String(draggable));
      }

      if (onDragStart) {
        const handler = function (event: DragEvent) {
          if (onDragStart) onDragStart(event);
        };
        listen("dragstart", handler);
      }

      if (onDrag) {
        const handler = function (event: DragEvent) {
          if (onDrag) onDrag(event);
        };
        listen("drag", handler);
      }

      if (onDragEnd) {
        const handler = function (event: DragEvent) {
          if (onDragEnd) onDragEnd(event);
        };
        listen("dragend", handler);
      }

      if (onDragEnter) {
        const handler = function (event: DragEvent) {
          if (onDragEnter) onDragEnter(event);
        };
        listen("dragenter", handler);
      }

      if (onDragOver) {
        const handler = function (event: DragEvent) {
          if (onDragOver) onDragOver(event);
        };
        listen("dragover", handler);
      }

      if (onDragLeave) {
        const handler = function (event: DragEvent) {
          if (onDragLeave) onDragLeave(event);
        };
        listen("dragleave", handler);
      }

      if (onDrop) {
        const handler = function (event: DragEvent) {
          if (onDrop) onDrop(event);
        };
        listen("drop", handler);
      }

      if (isMap) {
        host.setAttribute($elm, "ismap", "");
      }

      if (onLoad) {
        const handler = function (event: Event) {
          if (onLoad) onLoad(event);
        };
        listen("load", handler);
      }

      if (onError) {
        const handler = function (event: Event) {
          if (onError) onError(event);
        };
        listen("error", handler);
      }

      if (onMounted) {
        const cleanup = onMounted($elm);
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
    },
  };
}
