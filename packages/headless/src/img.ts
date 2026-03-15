import { isClassName, isRef, isStyleRef, Ref } from "@timeless/reactive";
import { safeCreateElement } from "./env";
import { ViewProps } from "./view";

export interface ImgProps extends Omit<ViewProps, "type" | "as"> {
  src?: string | Ref<string>;
  alt?: string | Ref<string>;
  onLoad?(e: Event): void;
  onError?(e: Event): void;
}

export function Img(props: ImgProps = {}) {
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
    onLoad,
    onError,
    ...rest
  } = props as ImgProps & Record<string, any>;

  let onMountedCleanup: (() => void) | undefined;
  const $elm = safeCreateElement("img") as unknown as HTMLImageElement;

  return {
    t: "view",
    $elm,
    render() {
      Object.keys(rest).forEach((k) => {
        const vv = rest[k];
        if (vv !== undefined && vv !== null) {
          if (isRef(vv)) {
            vv._subscribe({
              onChange(v) {
                $elm.setAttribute(k, String(v));
              },
            });
            $elm.setAttribute(k, String(vv.value));
          } else if (typeof vv === "string" || typeof vv === "number") {
            $elm.setAttribute(k, String(vv));
          }
        }
      });

      Object.keys(dataset).forEach((k) => {
        if (dataset && dataset[k]) {
          $elm.setAttribute(`data-${k}`, dataset[k]);
        }
      });

      if (cls) {
        if (typeof cls === "string") {
          $elm.className = cls;
        } else if (isRef(cls)) {
          cls._subscribe({
            onChange(v) {
              $elm.className = v;
            },
          });
          $elm.className = cls.value;
        } else if (isClassName(cls)) {
          cls._subscribe({
            onChange(v: string[]) {
              $elm.className = v.join(" ");
            },
          });
          $elm.className = cls.toString();
        }
      }

      if (style) {
        if (typeof style === "string") {
          $elm.style.cssText = style;
        } else if (isRef(style)) {
          $elm.style.cssText = style.value;
          style._subscribe({
            onChange(v: any) {
              $elm.style.cssText = v;
            },
          });
        } else if (isStyleRef(style)) {
          style._subscribe({
            onChange(v: string) {
              $elm.style.cssText = v;
            },
          });
          $elm.style.cssText = style.toString();
        }
      }

      if (onClick) {
        $elm.addEventListener("click", function (event: MouseEvent) {
          if (onClick) {
            onClick(event);
          }
        });
      }

      if (onDoubleClick) {
        $elm.addEventListener("dblclick", function (event: MouseEvent) {
          if (onDoubleClick) {
            onDoubleClick(event);
          }
        });
      }

      if (onLongPress) {
        let longPressTimer: number | null = null;
        let startX = 0;
        let startY = 0;
        const longPressDuration = 500;
        const moveThreshold = 10;

        const handleStart = (event: PointerEvent) => {
          startX = event.clientX;
          startY = event.clientY;
          longPressTimer = window.setTimeout(() => {
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
              window.clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          }
        };

        const handleEnd = () => {
          if (longPressTimer) {
            window.clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        };

        $elm.addEventListener("pointerdown", handleStart);
        $elm.addEventListener("pointermove", handleMove);
        $elm.addEventListener("pointerup", handleEnd);
        $elm.addEventListener("pointercancel", handleEnd);
      }

      if (onPointerDown) {
        $elm.addEventListener("pointerdown", function (event: PointerEvent) {
          if (onPointerDown) onPointerDown(event);
        });
      }
      if (onFocus) {
        $elm.addEventListener("focus", function (event: FocusEvent) {
          onFocus(event);
        });
      }
      if (onBlur) {
        $elm.addEventListener("blur", function (event: FocusEvent) {
          if (onBlur) onBlur(event);
        });
      }
      if (onKeyDown) {
        $elm.addEventListener("keydown", function (event: KeyboardEvent) {
          if (onKeyDown) onKeyDown(event);
        });
      }
      if (onMouseEnter) {
        $elm.addEventListener("mouseenter", function (event: MouseEvent) {
          onMouseEnter(event);
        });
      }
      if (onMouseLeave) {
        $elm.addEventListener("mouseleave", function (event: MouseEvent) {
          onMouseLeave(event);
        });
      }

      if (draggable !== undefined) {
        $elm.setAttribute("draggable", String(draggable));
      }

      if (onDragStart) {
        $elm.addEventListener("dragstart", function (event: DragEvent) {
          if (onDragStart) onDragStart(event);
        });
      }

      if (onDrag) {
        $elm.addEventListener("drag", function (event: DragEvent) {
          if (onDrag) onDrag(event);
        });
      }

      if (onDragEnd) {
        $elm.addEventListener("dragend", function (event: DragEvent) {
          if (onDragEnd) onDragEnd(event);
        });
      }

      if (onDragEnter) {
        $elm.addEventListener("dragenter", function (event: DragEvent) {
          if (onDragEnter) onDragEnter(event);
        });
      }

      if (onDragOver) {
        $elm.addEventListener("dragover", function (event: DragEvent) {
          if (onDragOver) onDragOver(event);
        });
      }

      if (onDragLeave) {
        $elm.addEventListener("dragleave", function (event: DragEvent) {
          if (onDragLeave) onDragLeave(event);
        });
      }

      if (onDrop) {
        $elm.addEventListener("drop", function (event: DragEvent) {
          if (onDrop) onDrop(event);
        });
      }

      if (onLoad) {
        $elm.addEventListener("load", function (event: Event) {
          if (onLoad) onLoad(event);
        });
      }

      if (onError) {
        $elm.addEventListener("error", function (event: Event) {
          if (onError) onError(event);
        });
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
      if (onMountedCleanup) {
        onMountedCleanup();
      }
      if (onUnmounted) {
        onUnmounted();
      }
    },
  };
}
