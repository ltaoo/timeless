import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { ViewProps } from "@/content/view";
import {
  isClassNameRef,
  isStyleRef,
  RawViewStyleProperties,
} from "@/style/index";
import { MountedEvent } from "@/event";
import { ListenerManager } from "@/util/listener";

export interface InputProps extends Omit<ViewProps, "as" | "type"> {
  id?: string;
  name?: string | DerivedRef<string> | Ref<string>;
  value?: DerivedRef<string> | Ref<string>;
  placeholder?: string | DerivedRef<string> | Ref<string>;
  disabled?: boolean | DerivedRef<boolean> | Ref<boolean>;
  readonly?: boolean | DerivedRef<boolean> | Ref<boolean>;
  maxLength?: number | DerivedRef<number> | Ref<number>;
  minLength?: number | DerivedRef<number> | Ref<number>;
  pattern?: string | DerivedRef<string> | Ref<string>;
  required?: boolean | DerivedRef<boolean> | Ref<boolean>;
  autocomplete?: boolean | DerivedRef<boolean> | Ref<boolean>;
  autocorrect?: boolean;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
}
type InputState = {
  rendered: boolean;
  style: RawViewStyleProperties;
  styleSet?: string[];
  id?: string;
  name?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
};

export function Input(props: InputProps = {}) {
  const {
    id,
    name,
    style,
    class: cls,
    attributes,
    dataset = {},
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

  let $elm: any = null;
  const manager$ = ListenerManager();
  const state: InputState = {
    rendered: false,
    id: "",
    name: "",
    value: "",
    style: {},
    styleSet: [],
  };
  const events = {
    onInput,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
  };

  const methods = {
    listen(type: string, handler: (event: any) => void, options?: any) {
      $elm.addEventListener(type, handler, options);
      return function () {
        $elm.removeEventListener(type, handler, options);
      };
    },
    setProp(key: string, value: any) {
      if ($elm) {
        $elm.setAttribute(key, value);
      }
      // state.props[key] = value;
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
              state.id = v as string;
              methods.setProp("id", String(v));
            },
          });
          // methods.setProp("id", id.value);
          state.id = id.value;
        } else {
          // methods.setProp("id", id);
          state.id = id;
        }
      }

      // Handle value attribute
      if (value !== undefined) {
        if (isRef(value)) {
          value.subscribe({
            onChange(v) {
              state.value = v as string;
              if ($elm && typeof $elm.setValue === "function") {
                $elm.setValue(v as string);
              }
              // methods.setProp("value", v);
            },
          });
          state.value = value.value;
          // methods.setProp("value", value.value);
        } else {
          state.value = value;
          // methods.setProp("value", value);
        }
      }

      // Handle placeholder attribute
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          placeholder.subscribe({
            onChange(v) {
              state.placeholder = v as string;
              methods.setProp("placeholder", v);
            },
          });
          // methods.setProp("placeholder", placeholder.value);
          state.placeholder = placeholder.value;
        } else {
          // methods.setProp("placeholder", placeholder);
          state.placeholder = placeholder;
        }
      }

      // Handle disabled attribute
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          disabled.subscribe({
            onChange(v) {
              state.disabled = v as boolean;
              if (v) {
                $elm.setAttribute("disabled", "");
              } else {
                $elm.removeAttribute("disabled");
              }
              // methods.setProp("disabled", v);
            },
          });
          // methods.setProp("disabled", disabled.value);
          state.disabled = disabled.value;
        } else {
          // methods.setProp("disabled", disabled);
          state.disabled = disabled;
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
          // methods.setProp("readOnly", readonly.value);
        } else {
          // methods.setProp("readOnly", readonly);
        }
      }

      // Handle maxLength attribute
      if (maxLength !== undefined) {
        if (isRef(maxLength)) {
          maxLength.subscribe({
            onChange(v) {
              state.maxLength = v as number;
              methods.setProp("maxLength", v);
            },
          });
          // methods.setProp("maxLength", maxLength.value);
          state.maxLength = maxLength.value;
        } else {
          // methods.setProp("maxLength", maxLength);
          state.maxLength = maxLength;
        }
      }

      // Handle minLength attribute
      if (minLength !== undefined) {
        if (isRef(minLength)) {
          minLength.subscribe({
            onChange(v) {
              state.minLength = v as number;
              methods.setProp("minLength", v);
            },
          });
          state.minLength = minLength.value;
          // methods.setProp("minLength", minLength.value);
        } else {
          // methods.setProp("minLength", minLength);
          state.minLength = minLength;
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
          // methods.setProp("pattern", pattern.value);
        } else {
          // methods.setProp("pattern", pattern);
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          required.subscribe({
            onChange(v) {
              state.required = v as boolean;
              methods.setProp("required", v);
            },
          });
          // methods.setProp("required", required.value);
          state.required = required.value;
        } else {
          // methods.setProp("required", required);
          state.required = required;
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
          // methods.setProp("autocomplete", autocomplete.value);
        } else {
          // methods.setProp("autocomplete", autocomplete);
        }
      }

      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          name.subscribe({
            onChange(v) {
              state.name = v as string;
              methods.setProp("name", v);
            },
          });
          // methods.setProp("name", name.value);
          state.name = name.value;
        } else {
          // methods.setProp("name", name);
          state.name = name;
        }
      }

      // Set static attributes
      // host.setAttribute($elm, "autocorrect", autocorrect);
      // if ($elm) {
      //   $elm.setAttribute("autocorrect", autocorrect);
      // }

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
          // methods.applyAttr(attrName, vv.value);
          return;
        }
        // methods.applyAttr(attrName, vv);
      });

      // Handle class
      if (cls) {
        if (typeof cls === "string") {
          state.styleSet = [cls];
          // host.setClassName($elm, cls);
        } else if (isRef(cls)) {
          cls.subscribe({
            onChange(v) {
              // host.setClassName($elm, String(v));
              if ($elm) {
                state.styleSet = v as string[];
                $elm.setStyleSet(v);
              }
            },
          });
          // host.setClassName($elm, String(cls.value));
          state.styleSet = [cls.value];
        } else if (isClassNameRef(cls)) {
          cls.subscribe({
            onChange(v: any) {
              state.styleSet = v as string[];
              if ($elm) {
                $elm.setStyleSet(
                  Array.isArray(v) ? v.join(" ") : String(v ?? ""),
                );
              }
            },
          });
          state.styleSet = [cls.toString()];
        }
      }

      // Handle style
      if (style) {
        if (isRef(style)) {
          const st = style;
          st.subscribe({
            onChange(v) {
              // host.setStyleText($elm, viewStyleToCssText(v ?? {}));
              state.style = v as any;
              if ($elm) {
                $elm.setStyleSet(v);
              }
            },
          });
          // host.setStyleText($elm, viewStyleToCssText(st.value));
          state.style = st.value as RawViewStyleProperties;
        } else if (isStyleRef(style)) {
          const st = style;
          st.subscribe({
            onChange() {
              state.style = st.value as RawViewStyleProperties;
              $elm.setStyleSet(st.value || {});
            },
          });
          state.style = st.value;
        } else {
          Object.keys(style as any).forEach((k) => {
            const vv = style[k];
            if (isRef(vv)) {
              vv.subscribe({
                onChange() {
                  state.style = style as any;
                  $elm.setStyleSet(style);
                },
              });
            }
          });
          state.style = style as any;
        }
      }
    },
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
    state,
    children: [],
    events: events,
    render() {
      // if (state.rendered) {
      //   return $elm;
      // }
      // state.rendered = true;

      // // Event methods.listeners
      // if (onClick) {
      //   const handler = function (event: MouseEvent) {
      //     onClick(event);
      //   };
      //   methods.listen("click", handler);
      // }

      // if (onDoubleClick) {
      //   const handler = function (event: MouseEvent) {
      //     onDoubleClick(event);
      //   };
      //   methods.listen("dblclick", handler);
      // }

      // if (onLongPress) {
      //   let long_press_timer: any = null;
      //   let start_x = 0;
      //   let start_y = 0;
      //   const longPressDuration = 500;
      //   const moveThreshold = 10;

      //   const handleStart = (event: PointerEvent) => {
      //     start_x = event.clientX;
      //     start_y = event.clientY;
      //     long_press_timer = setTimeout(() => {
      //       onLongPress(event);
      //       long_press_timer = null;
      //     }, longPressDuration);
      //   };

      //   const handleMove = (event: PointerEvent) => {
      //     if (long_press_timer) {
      //       const deltaX = Math.abs(event.clientX - start_x);
      //       const deltaY = Math.abs(event.clientY - start_y);
      //       if (deltaX > moveThreshold || deltaY > moveThreshold) {
      //         clearTimeout(long_press_timer);
      //         long_press_timer = null;
      //       }
      //     }
      //   };

      //   const handleEnd = () => {
      //     if (long_press_timer) {
      //       clearTimeout(long_press_timer);
      //       long_press_timer = null;
      //     }
      //   };

      //   methods.listen("pointerdown", handleStart);
      //   methods.listen("pointermove", handleMove);
      //   methods.listen("pointerup", handleEnd);
      //   methods.listen("pointercancel", handleEnd);
      // }

      // if (onPointerDown) {
      //   const handler = function (event: PointerEvent) {
      //     onPointerDown(event);
      //   };
      //   methods.listen("pointerdown", handler);
      // }

      // if (onFocus) {
      //   const handler = function (event: FocusEvent) {
      //     onFocus(event);
      //   };
      //   methods.listen("focus", handler);
      // }

      // if (onBlur) {
      //   const handler = function (event: FocusEvent) {
      //     onBlur(event);
      //   };
      //   methods.listen("blur", handler);
      // }

      // if (onKeyDown) {
      //   const handler = function (event: KeyboardEvent) {
      //     onKeyDown(event);
      //   };
      //   methods.listen("keydown", handler);
      // }

      // if (onMouseEnter) {
      //   const handler = function (event: MouseEvent) {
      //     onMouseEnter(event);
      //   };
      //   methods.listen("mouseenter", handler);
      // }

      // if (onMouseLeave) {
      //   const handler = function (event: MouseEvent) {
      //     onMouseLeave(event);
      //   };
      //   methods.listen("mouseleave", handler);
      // }

      // if (onChange) {
      //   const handler = function (event: Event) {
      //     onChange(event);
      //   };
      //   methods.listen("change", handler);
      // }

      // if (onMounted) {
      //   manager$.push(onMounted({ target: $elm }));
      // }

      return $elm;
    },
    onMounted(event: MountedEvent) {
      // console.log("[]input onMounted", $elm);
      // $elm = event.target;
      state.rendered = true;
      const handler = function (event: InputEvent) {
        if (onInput) {
          onInput(event);
        }
      };
      if (onMounted) {
        onMounted(event);
      }
      methods.listen("input", handler);
    },
    beforeUnmounted() {
      if (beforeUnmounted) {
        beforeUnmounted();
      }
    },
    onUnmounted() {
      manager$.clean();
      if (onUnmounted) {
        onUnmounted();
      }
      state.rendered = false;
    },
  };
}
