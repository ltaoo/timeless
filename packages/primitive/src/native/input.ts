import { Ref, isRef, isClassName, isStyleRef } from "@timeless/reactive";

import { ViewProps, viewStyleToCssText } from "@/primitive/view";
import { getHost } from "@/host";
import { safeCreateElement } from "@/util/env";

export interface NativeInputProps extends Omit<ViewProps, "as" | "type"> {
  id?: string | Ref<string>;
  type?: string | Ref<string>;
  value?: string | Ref<string>;
  placeholder?: string | Ref<string>;
  disabled?: boolean | Ref<boolean>;
  readonly?: boolean | Ref<boolean>;
  maxLength?: number | Ref<number>;
  minLength?: number | Ref<number>;
  pattern?: string | Ref<string>;
  required?: boolean | Ref<boolean>;
  autocomplete?: string | Ref<string>;
  autocorrect?: string;
  inputMode?: string;
  name?: string | Ref<string>;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
}

export function NativeInput(props: NativeInputProps = {}) {
  const host = getHost();
  const {
    id,
    type = "text",
    value,
    placeholder,
    disabled,
    readonly,
    maxLength,
    minLength,
    pattern,
    required,
    autocomplete,
    autocorrect = "off",
    inputMode,
    name,
    style,
    class: cls,
    attributes,
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
    onInput,
    onChange,
  } = props;

  let onMountedCleanup: (() => void) | undefined;
  const listenerCleanups: (() => void)[] = [];
  let rendered = false;
  const $elm = safeCreateElement("input");

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

      const setProp = (key: string, value: any) => {
        if (host.setProperty) {
          host.setProperty($elm, key, value);
          return;
        }
        ($elm as any)[key] = value;
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

      if (id !== undefined) {
        if (isRef(id)) {
          id._subscribe({
            onChange(v) {
              setProp("id", String(v));
            },
          });
          setProp("id", id.value);
        } else {
          setProp("id", id);
        }
      }

      // Handle type attribute
      if (isRef(type)) {
        type._subscribe({
          onChange(v) {
            setProp("type", v);
          },
        });
        setProp("type", type.value);
      } else {
        setProp("type", type as any);
      }

      // Handle value attribute
      if (value !== undefined) {
        if (isRef(value)) {
          value._subscribe({
            onChange(v) {
              setProp("value", v);
            },
          });
          setProp("value", value.value);
        } else {
          setProp("value", value as string);
        }
      }

      // Handle placeholder attribute
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          placeholder._subscribe({
            onChange(v) {
              setProp("placeholder", v);
            },
          });
          setProp("placeholder", placeholder.value);
        } else {
          setProp("placeholder", placeholder as string);
        }
      }

      // Handle disabled attribute
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          disabled._subscribe({
            onChange(v) {
              setProp("disabled", v);
            },
          });
          setProp("disabled", disabled.value);
        } else {
          setProp("disabled", disabled as boolean);
        }
      }

      // Handle readonly attribute
      if (readonly !== undefined) {
        if (isRef(readonly)) {
          readonly._subscribe({
            onChange(v) {
              setProp("readOnly", v);
            },
          });
          setProp("readOnly", readonly.value);
        } else {
          setProp("readOnly", readonly as boolean);
        }
      }

      // Handle maxLength attribute
      if (maxLength !== undefined) {
        if (isRef(maxLength)) {
          maxLength._subscribe({
            onChange(v) {
              setProp("maxLength", v);
            },
          });
          setProp("maxLength", maxLength.value);
        } else {
          setProp("maxLength", maxLength as number);
        }
      }

      // Handle minLength attribute
      if (minLength !== undefined) {
        if (isRef(minLength)) {
          minLength._subscribe({
            onChange(v) {
              setProp("minLength", v);
            },
          });
          setProp("minLength", minLength.value);
        } else {
          setProp("minLength", minLength as any);
        }
      }

      // Handle pattern attribute
      if (pattern !== undefined) {
        if (isRef(pattern)) {
          pattern._subscribe({
            onChange(v) {
              setProp("pattern", v);
            },
          });
          setProp("pattern", pattern.value);
        } else {
          setProp("pattern", pattern as string);
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          required._subscribe({
            onChange(v) {
              setProp("required", v);
            },
          });
          setProp("required", required.value);
        } else {
          setProp("required", required as boolean);
        }
      }

      // Handle autocomplete attribute
      if (autocomplete !== undefined) {
        if (isRef(autocomplete)) {
          autocomplete._subscribe({
            onChange(v) {
              setProp("autocomplete", v);
            },
          });
          setProp("autocomplete", autocomplete.value as any);
        } else {
          setProp("autocomplete", autocomplete as any);
        }
      }

      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          name._subscribe({
            onChange(v) {
              setProp("name", v);
            },
          });
          setProp("name", name.value);
        } else {
          setProp("name", name as string);
        }
      }

      // Set static attributes
      host.setAttribute($elm, "autocorrect", autocorrect);
      if (inputMode) {
        setProp("inputMode", inputMode);
      }

      if (attributes) {
        Object.keys(attributes).forEach((k) => {
          const vv = attributes[k];
          if (isRef(vv)) {
            vv._subscribe({
              onChange(v: any) {
                applyAttr(k, v);
              },
            });
            applyAttr(k, vv.value);
            return;
          }
          applyAttr(k, vv);
        });
      }

      // Handle dataset
      Object.keys(dataset).forEach((k) => {
        if (!dataset) return;
        const vv = dataset[k];
        const attrName = `data-${k}`;
        if (isRef(vv)) {
          vv._subscribe({
            onChange(v: any) {
              applyAttr(attrName, v);
            },
          });
          applyAttr(attrName, vv.value);
          return;
        }
        applyAttr(attrName, vv);
      });

      // Handle class
      if (cls) {
        if (typeof cls === "string") {
          host.setClassName($elm, cls);
        } else if (isRef(cls)) {
          cls._subscribe({
            onChange(v) {
              host.setClassName($elm, String(v));
            },
          });
          host.setClassName($elm, String(cls.value));
        } else if (isClassName(cls)) {
          cls._subscribe({
            onChange(v: any) {
              host.setClassName(
                $elm,
                Array.isArray(v) ? v.join(" ") : String(v ?? ""),
              );
            },
          });
          host.setClassName($elm, cls.toString());
        }
      }

      // Handle style
      if (style) {
        if (isStyleRef(style as any)) {
          const st = style as any;
          st._subscribe({
            onChange(v: any) {
              host.setStyleText($elm, String(v ?? ""));
            },
          });
          host.setStyleText($elm, st.toString());
        } else if (isRef(style)) {
          const st = style as any;
          const apply = () => host.setStyleText($elm, viewStyleToCssText(st.value || {}));
          st._subscribe({ onChange() { apply(); } });
          apply();
        } else {
          const applyStyle = () => {
            host.setStyleText($elm, viewStyleToCssText(style as any));
          };
          Object.keys(style as any).forEach((k) => {
            const vv = (style as any)[k];
            if (isRef(vv)) {
              (vv as any)._subscribe({ onChange() { applyStyle(); } });
            }
          });
          applyStyle();
        }
      }

      // Event listeners
      if (onClick) {
        const handler = function (event: MouseEvent) {
          onClick(event);
        };
        listen("click", handler);
      }

      if (onDoubleClick) {
        const handler = function (event: MouseEvent) {
          onDoubleClick(event);
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
            onLongPress(event);
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
          onPointerDown(event);
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
          onBlur(event);
        };
        listen("blur", handler);
      }

      if (onKeyDown) {
        const handler = function (event: KeyboardEvent) {
          onKeyDown(event);
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

      if (onInput) {
        const handler = function (event: Event) {
          onInput(event);
        };
        listen("input", handler);
      }

      if (onChange) {
        const handler = function (event: Event) {
          onChange(event);
        };
        listen("change", handler);
      }

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
