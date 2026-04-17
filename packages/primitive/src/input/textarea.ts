import {
  classNames,
  isClassNameRef,
  isStyleRef,
  RawViewStyleProperties,
} from "@/style/index";
import { isRef } from "@timeless/reactive";
import { ListenerManager } from "@/util/listener";
import { MountedEvent } from "@/event";

import { InputProps } from "./input";

export type TextareaProps = InputProps & { id?: string };
type TextareaState = {
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

export function Textarea(props: TextareaProps) {
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
  const state: TextareaState = {
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
          const unsub = id.subscribe({
            onChange(v) {
              state.id = v as string;
              methods.setProp("id", String(v));
            },
          });
          manager$.push(unsub);
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
          const unsub = value.subscribe({
            onChange(v) {
              state.value = v as string;
              if ($elm && typeof $elm.setValue === "function") {
                $elm.setValue(v as string);
              }
              // methods.setProp("value", v);
            },
          });
          manager$.push(unsub);
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
          const unsub = placeholder.subscribe({
            onChange(v) {
              state.placeholder = v as string;
              methods.setProp("placeholder", v);
            },
          });
          manager$.push(unsub);
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
          const unsub = disabled.subscribe({
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
          manager$.push(unsub);
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
          const unsub = readonly.subscribe({
            onChange(v) {
              methods.setProp("readOnly", v);
            },
          });
          manager$.push(unsub);
          // methods.setProp("readOnly", readonly.value);
        } else {
          // methods.setProp("readOnly", readonly);
        }
      }

      // Handle maxLength attribute
      if (maxLength !== undefined) {
        if (isRef(maxLength)) {
          const unsub = maxLength.subscribe({
            onChange(v) {
              state.maxLength = v as number;
              methods.setProp("maxLength", v);
            },
          });
          manager$.push(unsub);
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
          const unsub = minLength.subscribe({
            onChange(v) {
              state.minLength = v as number;
              methods.setProp("minLength", v);
            },
          });
          manager$.push(unsub);
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
          const unsub = pattern.subscribe({
            onChange(v) {
              methods.setProp("pattern", v);
            },
          });
          manager$.push(unsub);
          // methods.setProp("pattern", pattern.value);
        } else {
          // methods.setProp("pattern", pattern);
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          const unsub = required.subscribe({
            onChange(v) {
              state.required = v as boolean;
              methods.setProp("required", v);
            },
          });
          manager$.push(unsub);
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
          const unsub = autocomplete.subscribe({
            onChange(v) {
              methods.setProp("autocomplete", v);
            },
          });
          manager$.push(unsub);
          // methods.setProp("autocomplete", autocomplete.value);
        } else {
          // methods.setProp("autocomplete", autocomplete);
        }
      }

      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          const unsub = name.subscribe({
            onChange(v) {
              state.name = v as string;
              methods.setProp("name", v);
            },
          });
          manager$.push(unsub);
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
            const unsub = vv.subscribe({
              onChange(v: any) {
                methods.applyAttr(k, v);
              },
            });
            manager$.push(unsub);
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
          const unsub = vv.subscribe({
            onChange(v: any) {
              methods.applyAttr(attrName, v);
            },
          });
          manager$.push(unsub);
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
          const unsub = cls.subscribe({
            onChange(v: string) {
              state.styleSet = v.split(" ");
              if ($elm) {
                $elm.setStyleSet(state.styleSet);
              }
            },
          });
          manager$.push(unsub);
          // host.setClassName($elm, String(cls.value));
          state.styleSet = cls.value.split(" ");
        } else if (isClassNameRef(cls)) {
          const unsub = cls.subscribe({
            onChange(v: string[]) {
              state.styleSet = v;
              if ($elm) {
                $elm.setStyleSet(v);
              }
            },
          });
          manager$.push(unsub);
          state.styleSet = cls.value;
        }
      }

      // Handle style
      if (style) {
        if (isRef(style)) {
          const st = style;
          const unsub = st.subscribe({
            onChange(v) {
              // host.setStyleText($elm, viewStyleToCssText(v ?? {}));
              state.style = v as any;
              if ($elm) {
                $elm.setStyleSet(v);
              }
            },
          });
          manager$.push(unsub);
          // host.setStyleText($elm, viewStyleToCssText(st.value));
          state.style = st.value as RawViewStyleProperties;
        } else if (isStyleRef(style)) {
          const st = style;
          const unsub = st.subscribe({
            onChange() {
              state.style = st.value as RawViewStyleProperties;
              $elm.setStyleSet(st.value || {});
            },
          });
          manager$.push(unsub);
          state.style = st.value;
        } else {
          Object.keys(style as any).forEach((k) => {
            const vv = style[k];
            if (isRef(vv)) {
              const unsub = vv.subscribe({
                onChange() {
                  state.style = style as any;
                  $elm.setStyleSet(style);
                },
              });
              manager$.push(unsub);
            }
          });
          state.style = style as any;
        }
      }
    },
  };

  methods.setup_value_subscribe();

  return {
    t: "textarea",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    value: state.value,
    state,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) props.beforeUnmounted();
    },
    onUnmounted() {
      manager$.destroy();
      if (props.onUnmounted) props.onUnmounted();
    },
  };
}
