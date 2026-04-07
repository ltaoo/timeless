import { Ref, isRef } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import { viewStyleToCssText, isStyleRef, isClassName } from "@/style/index";
import { MountedEvent } from "@/event";

export interface InputProps extends Omit<ViewProps, "as" | "type"> {
  id?: string;
  value?: Ref<string>;
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

export function Input(props: InputProps = {}) {
  const {
    id,
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

  const methods = {
    listen(type: string, handler: (event: any) => void, options?: any) {
      // console.log("listen", type, $elm, handler, options);
      // host.addEventListener($elm, type, handler, options);
      $elm.addEventListener(type, handler, options);
      listenerCleanups.push(() => {
        // host.removeEventListener($elm, type, handler, options);
        $elm.removeEventListener(type, handler, options);
      });
    },
    setProp(key: string, value: any) {
      if ($elm) {
        $elm.setAttribute(key, value);
      }
      // @ts-ignore
      state.props[key] = value;
    },
    applyAttr(k: string, v: any) {
      if (v === undefined || v === null || v === false) {
        // host.removeAttribute($elm, k);
        if ($elm) {
          $elm.removeAttribute(k);
        }
        return;
      }
      if (v === true) {
        // host.setAttribute($elm, k, "");
        if ($elm) {
          $elm.setAttribute(k, "");
        }
        return;
      }
      // host.setAttribute($elm, k, String(v));
      if ($elm) {
        $elm.setAttribute(k, String(v));
      }
    },
    setup_value_subscribe() {
      if (id !== undefined) {
        if (isRef(id)) {
          id.subscribe({
            onChange(v) {
              methods.setProp("id", String(v));
            },
          });
          methods.setProp("id", id.value);
        } else {
          methods.setProp("id", id);
        }
      }

      // Handle type attribute
      // if (isRef(type)) {
      //   type.subscribe({
      //     onChange(v) {
      //       methods.setProp("type", v);
      //     },
      //   });
      //   methods.setProp("type", type.value);
      // } else {
      //   methods.setProp("type", type as any);
      // }

      // Handle value attribute
      if (value !== undefined) {
        if (isRef(value)) {
          value.subscribe({
            onChange(v) {
              methods.setProp("value", v);
            },
          });
          methods.setProp("value", value.value);
        } else {
          methods.setProp("value", value);
        }
      }

      // Handle placeholder attribute
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          placeholder.subscribe({
            onChange(v) {
              methods.setProp("placeholder", v);
            },
          });
          methods.setProp("placeholder", placeholder.value);
        } else {
          methods.setProp("placeholder", placeholder as string);
        }
      }

      // Handle disabled attribute
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          disabled.subscribe({
            onChange(v) {
              methods.setProp("disabled", v);
            },
          });
          methods.setProp("disabled", disabled.value);
        } else {
          methods.setProp("disabled", disabled as boolean);
        }
      }

      // Handle readonly attribute
      if (readonly !== undefined) {
        if (isRef(readonly)) {
          readonly.subscribe({
            onChange(v) {
              methods.setProp("readOnly", v);
            },
          });
          methods.setProp("readOnly", readonly.value);
        } else {
          methods.setProp("readOnly", readonly as boolean);
        }
      }

      // Handle maxLength attribute
      if (maxLength !== undefined) {
        if (isRef(maxLength)) {
          maxLength.subscribe({
            onChange(v) {
              methods.setProp("maxLength", v);
            },
          });
          methods.setProp("maxLength", maxLength.value);
        } else {
          methods.setProp("maxLength", maxLength as number);
        }
      }

      // Handle minLength attribute
      if (minLength !== undefined) {
        if (isRef(minLength)) {
          minLength.subscribe({
            onChange(v) {
              methods.setProp("minLength", v);
            },
          });
          methods.setProp("minLength", minLength.value);
        } else {
          methods.setProp("minLength", minLength as any);
        }
      }

      // Handle pattern attribute
      if (pattern !== undefined) {
        if (isRef(pattern)) {
          pattern.subscribe({
            onChange(v) {
              methods.setProp("pattern", v);
            },
          });
          methods.setProp("pattern", pattern.value);
        } else {
          methods.setProp("pattern", pattern as string);
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          required.subscribe({
            onChange(v) {
              methods.setProp("required", v);
            },
          });
          methods.setProp("required", required.value);
        } else {
          methods.setProp("required", required as boolean);
        }
      }

      // Handle autocomplete attribute
      if (autocomplete !== undefined) {
        if (isRef(autocomplete)) {
          autocomplete.subscribe({
            onChange(v) {
              methods.setProp("autocomplete", v);
            },
          });
          methods.setProp("autocomplete", autocomplete.value as any);
        } else {
          methods.setProp("autocomplete", autocomplete as any);
        }
      }

      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          name.subscribe({
            onChange(v) {
              methods.setProp("name", v);
            },
          });
          methods.setProp("name", name.value);
        } else {
          methods.setProp("name", name as string);
        }
      }

      // Set static attributes
      // host.setAttribute($elm, "autocorrect", autocorrect);
      if ($elm) {
        $elm.setAttribute("autocorrect", autocorrect);
      }

      if (inputMode) {
        methods.setProp("inputMode", inputMode);
        // state.props.inputMode = inputMode;
      }

      if (attributes) {
        Object.keys(attributes).forEach((k) => {
          const vv = attributes[k];
          if (isRef(vv)) {
            vv.subscribe({
              onChange(v: any) {
                methods.applyAttr(k, v);
              },
            });
            methods.applyAttr(k, vv.value);
            return;
          }
          methods.applyAttr(k, vv);
        });
      }

      // Handle dataset
      Object.keys(dataset).forEach((k) => {
        if (!dataset) return;
        const vv = dataset[k];
        const attrName = `data-${k}`;
        if (isRef(vv)) {
          vv.subscribe({
            onChange(v: any) {
              methods.applyAttr(attrName, v);
            },
          });
          methods.applyAttr(attrName, vv.value);
          return;
        }
        methods.applyAttr(attrName, vv);
      });

      // Handle class
      if (cls) {
        if (typeof cls === "string") {
          // host.setClassName($elm, cls);
        } else if (isRef(cls)) {
          cls.subscribe({
            onChange(v) {
              // host.setClassName($elm, String(v));
              if ($elm) {
                $elm.setStyleSet(v);
              }
            },
          });
          // host.setClassName($elm, String(cls.value));
          if ($elm) {
            $elm.setStyleSet(String(cls.value));
          }
        } else if (isClassName(cls)) {
          cls.subscribe({
            onChange(v: any) {
              // host.setClassName(
              //   $elm,
              //   Array.isArray(v) ? v.join(" ") : String(v ?? ""),
              // );
              if ($elm) {
                $elm.setStyleSet(
                  Array.isArray(v) ? v.join(" ") : String(v ?? ""),
                );
              }
            },
          });
          // host.setClassName($elm, cls.toString());
          if ($elm) {
            $elm.setStyleSet(cls.toString());
          }
        }
      }

      // Handle style
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
    },
  };

  const listenerCleanups: (() => void)[] = [];
  let onMountedCleanup: (() => void) | undefined;
  let rendered = false;
  let $elm: any = null;
  const state = {
    value: "",
    props: {},
  };

  methods.setup_value_subscribe();

  return {
    t: "input",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    props: state.props,
    get value() {
      return state.value;
    },
    onMounted(event: MountedEvent) {
      console.log("[]input onMounted", $elm);
      // $elm = event.target;
      const handler = function (event: Event) {
        // @ts-ignore
        const next_value = event.target?.value || "";
        if (value && !value.isSame(next_value)) {
          value.as(next_value);
        }
        // state.value = value;
        if (onInput) {
          onInput(event);
        }
      };
      methods.listen("input", handler);
    },
    render() {
      if (rendered) {
        return $elm;
      }
      rendered = true;

      // Event methods.listeners
      if (onClick) {
        const handler = function (event: MouseEvent) {
          onClick(event);
        };
        methods.listen("click", handler);
      }

      if (onDoubleClick) {
        const handler = function (event: MouseEvent) {
          onDoubleClick(event);
        };
        methods.listen("dblclick", handler);
      }

      if (onLongPress) {
        let long_press_timer: any = null;
        let start_x = 0;
        let start_y = 0;
        const longPressDuration = 500;
        const moveThreshold = 10;

        const handleStart = (event: PointerEvent) => {
          start_x = event.clientX;
          start_y = event.clientY;
          long_press_timer = setTimeout(() => {
            onLongPress(event);
            long_press_timer = null;
          }, longPressDuration);
        };

        const handleMove = (event: PointerEvent) => {
          if (long_press_timer) {
            const deltaX = Math.abs(event.clientX - start_x);
            const deltaY = Math.abs(event.clientY - start_y);
            if (deltaX > moveThreshold || deltaY > moveThreshold) {
              clearTimeout(long_press_timer);
              long_press_timer = null;
            }
          }
        };

        const handleEnd = () => {
          if (long_press_timer) {
            clearTimeout(long_press_timer);
            long_press_timer = null;
          }
        };

        methods.listen("pointerdown", handleStart);
        methods.listen("pointermove", handleMove);
        methods.listen("pointerup", handleEnd);
        methods.listen("pointercancel", handleEnd);
      }

      if (onPointerDown) {
        const handler = function (event: PointerEvent) {
          onPointerDown(event);
        };
        methods.listen("pointerdown", handler);
      }

      if (onFocus) {
        const handler = function (event: FocusEvent) {
          onFocus(event);
        };
        methods.listen("focus", handler);
      }

      if (onBlur) {
        const handler = function (event: FocusEvent) {
          onBlur(event);
        };
        methods.listen("blur", handler);
      }

      if (onKeyDown) {
        const handler = function (event: KeyboardEvent) {
          onKeyDown(event);
        };
        methods.listen("keydown", handler);
      }

      if (onMouseEnter) {
        const handler = function (event: MouseEvent) {
          onMouseEnter(event);
        };
        methods.listen("mouseenter", handler);
      }

      if (onMouseLeave) {
        const handler = function (event: MouseEvent) {
          onMouseLeave(event);
        };
        methods.listen("mouseleave", handler);
      }

      if (onChange) {
        const handler = function (event: Event) {
          onChange(event);
        };
        methods.listen("change", handler);
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
