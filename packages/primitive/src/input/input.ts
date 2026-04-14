import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";

export type InputProps = BoxProps & {
  id?: string | null;
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
};
type InputState = {
  rendered: boolean;
  id?: string;
  name?: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  required: boolean;
  maxLength?: number;
  minLength?: number;
};

export function Input(props: InputProps = {}) {
  const {
    id,
    name,
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
    onInput,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;

  const box$ = Box<InputState>(rest, {
    value: "",
  } as InputState);

  const state = box$.state;
  const events = box$.events;

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
    subscribe_props() {
      box$.methods.subscribe_props();

      if (id !== undefined && id !== null) {
        if (isRef(id)) {
          id.subscribe({
            onChange(v) {
              state.id = v as string;
              methods.setProp("id", String(v));
            },
          });
          state.id = id.value;
        } else {
          state.id = id;
        }
      }

      // Handle value attribute
      if (value !== undefined) {
        if (isRef(value)) {
          value.subscribe({
            onChange(v) {
              state.value = v;
              if ($elm && typeof $elm.setValue === "function") {
                $elm.setValue(v);
              }
              // methods.setProp("value", v);
            },
          });
          state.value = value.value;
        } else {
          state.value = value;
        }
      }

      // Handle placeholder attribute
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          placeholder.subscribe({
            onChange(v) {
              state.placeholder = v;
              methods.setProp("placeholder", v);
            },
          });
          state.placeholder = placeholder.value;
        } else {
          state.placeholder = placeholder;
        }
      }

      // Handle disabled attribute
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          disabled.subscribe({
            onChange(v) {
              state.disabled = v;
              if (v) {
                $elm.setAttribute("disabled", "");
              } else {
                $elm.removeAttribute("disabled");
              }
            },
          });
          state.disabled = disabled.value;
        } else {
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
          state.maxLength = maxLength.value;
          maxLength.subscribe({
            onChange(v) {
              state.maxLength = v;
              methods.setProp("maxLength", v);
            },
          });
        } else {
          state.maxLength = maxLength;
        }
      }

      // Handle minLength attribute
      if (minLength !== undefined) {
        if (isRef(minLength)) {
          state.minLength = minLength.value;
          minLength.subscribe({
            onChange(v) {
              state.minLength = v;
              methods.setProp("minLength", v);
            },
          });
        } else {
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
          state.required = required.value;
          required.subscribe({
            onChange(v) {
              state.required = v;
              methods.setProp("required", v);
            },
          });
        } else {
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
          state.name = name.value;
          name.subscribe({
            onChange(v) {
              state.name = v;
              methods.setProp("name", v);
            },
          });
        } else {
          state.name = name;
        }
      }
    },
  };

  methods.subscribe_props();
  events.onInput = onInput
  events.onChange = onChange

  return {
    t: "input",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: [],
    events,
    onMounted(event: MountedEvent) {
      console.log("[]input onMounted", $elm);
      state.rendered = true;
      if (rest.onMounted) {
        rest.onMounted(event);
      }
    },
    onUnmounted() {
      box$.methods.destroy();
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      state.rendered = false;
    },
  };
}
