import { Ref, isRef, isClassName, isStyleRef } from "@timeless/reactive";

import { ViewProps } from "../primitive/view";

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
  const $elm = document.createElement("input");

  return {
    t: "view",
    $elm,
    render() {
      const applyAttr = (k: string, v: any) => {
        if (v === undefined || v === null || v === false) {
          $elm.removeAttribute(k);
          return;
        }
        if (v === true) {
          $elm.setAttribute(k, "");
          return;
        }
        $elm.setAttribute(k, String(v));
      };

      if (id !== undefined) {
        if (isRef(id)) {
          id._subscribe({
            onChange(v) {
              $elm.id = String(v);
            },
          });
          $elm.id = id.value;
        } else {
          $elm.id = id;
        }
      }

      // Handle type attribute
      if (isRef(type)) {
        type._subscribe({
          onChange(v) {
            $elm.type = v;
          },
        });
        $elm.type = type.value;
      } else {
        $elm.type = type as any;
      }

      // Handle value attribute
      if (value !== undefined) {
        if (isRef(value)) {
          value._subscribe({
            onChange(v) {
              if ($elm.value !== v) {
                $elm.value = v;
              }
            },
          });
          $elm.value = value.value;
        } else {
          $elm.value = value as string;
        }
      }

      // Handle placeholder attribute
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          placeholder._subscribe({
            onChange(v) {
              $elm.placeholder = v;
            },
          });
          $elm.placeholder = placeholder.value;
        } else {
          $elm.placeholder = placeholder as string;
        }
      }

      // Handle disabled attribute
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          disabled._subscribe({
            onChange(v) {
              $elm.disabled = v;
            },
          });
          $elm.disabled = disabled.value;
        } else {
          $elm.disabled = disabled as boolean;
        }
      }

      // Handle readonly attribute
      if (readonly !== undefined) {
        if (isRef(readonly)) {
          readonly._subscribe({
            onChange(v) {
              $elm.readOnly = v;
            },
          });
          $elm.readOnly = readonly.value;
        } else {
          $elm.readOnly = readonly as boolean;
        }
      }

      // Handle maxLength attribute
      if (maxLength !== undefined) {
        if (isRef(maxLength)) {
          maxLength._subscribe({
            onChange(v) {
              $elm.maxLength = v;
            },
          });
          $elm.maxLength = maxLength.value;
        } else {
          $elm.maxLength = maxLength as number;
        }
      }

      // Handle minLength attribute
      if (minLength !== undefined) {
        if (isRef(minLength)) {
          minLength._subscribe({
            onChange(v) {
              $elm.minLength = v;
            },
          });
          $elm.minLength = minLength.value;
        } else {
          $elm.minLength = minLength as any;
        }
      }

      // Handle pattern attribute
      if (pattern !== undefined) {
        if (isRef(pattern)) {
          pattern._subscribe({
            onChange(v) {
              $elm.pattern = v;
            },
          });
          $elm.pattern = pattern.value;
        } else {
          $elm.pattern = pattern as string;
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          required._subscribe({
            onChange(v) {
              $elm.required = v;
            },
          });
          $elm.required = required.value;
        } else {
          $elm.required = required as boolean;
        }
      }

      // Handle autocomplete attribute
      if (autocomplete !== undefined) {
        if (isRef(autocomplete)) {
          autocomplete._subscribe({
            onChange(v) {
              $elm.autocomplete = v;
            },
          });
          $elm.autocomplete = autocomplete.value as any;
        } else {
          $elm.autocomplete = autocomplete as any;
        }
      }

      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          name._subscribe({
            onChange(v) {
              $elm.name = v;
            },
          });
          $elm.name = name.value;
        } else {
          $elm.name = name as string;
        }
      }

      // Set static attributes
      $elm.setAttribute("autocorrect", autocorrect);
      if (inputMode) {
        $elm.inputMode = inputMode;
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

      // Handle style
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

      // Event listeners
      if (onClick) {
        $elm.addEventListener("click", function (event: MouseEvent) {
          onClick(event);
        });
      }

      if (onDoubleClick) {
        $elm.addEventListener("dblclick", function (event: MouseEvent) {
          onDoubleClick(event);
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
            onLongPress(event);
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
          onPointerDown(event);
        });
      }

      if (onFocus) {
        $elm.addEventListener("focus", function (event: FocusEvent) {
          onFocus(event);
        });
      }

      if (onBlur) {
        $elm.addEventListener("blur", function (event: FocusEvent) {
          onBlur(event);
        });
      }

      if (onKeyDown) {
        $elm.addEventListener("keydown", function (event: KeyboardEvent) {
          onKeyDown(event);
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

      if (onInput) {
        $elm.addEventListener("input", function (event: Event) {
          onInput(event);
        });
      }

      if (onChange) {
        $elm.addEventListener("change", function (event: Event) {
          onChange(event);
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
