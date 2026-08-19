import { DerivedRef, Ref, isRef } from "@timeless/inner-reactive";

import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";
import { ListenerManager } from "@/util/listener";
import { Logger } from "@/util/logger";
import { bind_disabled } from "@/util/disabled";

const logger = Logger({ prefix: "primitive", scope: "input/input" });

export type InputProps = BoxProps & {
  id?: string | null;
  name?: string | DerivedRef<string> | Ref<string>;
  value?: DerivedRef<string> | Ref<string>;
  focused?: boolean | DerivedRef<boolean> | Ref<boolean>;
  placeholder?: string | DerivedRef<string> | Ref<string>;
  disabled?: boolean | DerivedRef<boolean> | Ref<boolean>;
  readonly?: boolean | DerivedRef<boolean> | Ref<boolean>;
  maxLength?: number | DerivedRef<number> | Ref<number>;
  minLength?: number | DerivedRef<number> | Ref<number>;
  pattern?: string | DerivedRef<string> | Ref<string>;
  required?: boolean | DerivedRef<boolean> | Ref<boolean>;
  autocomplete?: boolean | DerivedRef<boolean> | Ref<boolean>;
  autocorrect?: boolean;
  tabindex?: number;
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
  tabindex: number;
  autoComplete: boolean;
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
    attributes,
    readonly,
    maxLength,
    minLength,
    pattern,
    required,
    autocomplete,
    autocorrect = "off",
    tabindex,
    onInput,
    onChange,
    onFocus,
    onBlur,
    ...rest
  } = props;

  let input_attributes = attributes;
  if (disabled !== undefined) {
    input_attributes = { ...attributes };
    delete input_attributes.disabled;
  }

  let $elm: any = null;

  const box$ = Box<InputState>({ ...rest, attributes: input_attributes }, {
    value: "",
    autoComplete: false,
    disabled: false,
  } as InputState);
  const listener$ = ListenerManager();

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
          const unsub_id = id.subscribe({
            onChange(v) {
              state.id = v as string;
              methods.setProp("id", String(v));
            },
          });
          listener$.push(unsub_id);
          state.id = id.value;
        } else {
          state.id = id;
        }
      }

      // Handle value attribute
      if (value !== undefined) {
        if (isRef(value)) {
          const unsub_value = value.subscribe({
            onChange(v) {
              state.value = v;
              if ($elm && typeof $elm.setValue === "function") {
                $elm.setValue(v);
              }
              // methods.setProp("value", v);
            },
          });
          listener$.push(unsub_value);
          state.value = value.value;
        } else {
          state.value = value;
        }
      }

      // Handle placeholder attribute
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          const unsub_placeholder = placeholder.subscribe({
            onChange(v) {
              state.placeholder = v;
              methods.setProp("placeholder", v);
            },
          });
          listener$.push(unsub_placeholder);
          state.placeholder = placeholder.value;
        } else {
          state.placeholder = placeholder;
        }
      }

      bind_disabled({
        value: disabled,
        set_disabled(value) {
          state.disabled = value;
          state.attributes.disabled = value ? "" : undefined;
          box$.methods.apply_attr("disabled", value);
        },
        add_cleanup: listener$.add,
      });

      // Handle readonly attribute
      if (readonly !== undefined) {
        if (isRef(readonly)) {
          const unsub_readonly = readonly.subscribe({
            onChange(v) {
              methods.setProp("readOnly", v);
            },
          });
          listener$.push(unsub_readonly);
          // methods.setProp("readOnly", readonly.value);
        } else {
          // methods.setProp("readOnly", readonly);
        }
      }

      // Handle maxLength attribute
      if (maxLength !== undefined) {
        if (isRef(maxLength)) {
          state.maxLength = maxLength.value;
          const unsub_maxLength = maxLength.subscribe({
            onChange(v) {
              state.maxLength = v;
              methods.setProp("maxLength", v);
            },
          });
          listener$.push(unsub_maxLength);
        } else {
          state.maxLength = maxLength;
        }
      }

      // Handle minLength attribute
      if (minLength !== undefined) {
        if (isRef(minLength)) {
          state.minLength = minLength.value;
          const unsub_minLength = minLength.subscribe({
            onChange(v) {
              state.minLength = v;
              methods.setProp("minLength", v);
            },
          });
          listener$.push(unsub_minLength);
        } else {
          state.minLength = minLength;
        }
      }

      // Handle pattern attribute
      if (pattern !== undefined) {
        if (isRef(pattern)) {
          const unsub_pattern = pattern.subscribe({
            onChange(v) {
              methods.setProp("pattern", v);
            },
          });
          listener$.push(unsub_pattern);
          // methods.setProp("pattern", pattern.value);
        } else {
          // methods.setProp("pattern", pattern);
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          state.required = required.value;
          const unsub_required = required.subscribe({
            onChange(v) {
              state.required = v;
              methods.setProp("required", v);
            },
          });
          listener$.push(unsub_required);
        } else {
          state.required = required;
        }
      }

      // Handle autocomplete attribute
      if (autocomplete !== undefined) {
        if (isRef(autocomplete)) {
          const unsub_autocomplete = autocomplete.subscribe({
            onChange(v) {
              methods.setProp("autocomplete", v);
            },
          });
          listener$.push(unsub_autocomplete);
          // methods.setProp("autocomplete", autocomplete.value);
        } else {
          // methods.setProp("autocomplete", autocomplete);
        }
      }

      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          state.name = name.value;
          const unsub_name = name.subscribe({
            onChange(v) {
              state.name = v;
              methods.setProp("name", v);
            },
          });
          listener$.push(unsub_name);
        } else {
          state.name = name;
        }
      }

      if (tabindex !== undefined) {
        state.tabindex = tabindex;
      }
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();

  if (onInput) {
    events.onInput = onInput;
  }
  if (onChange) {
    events.onChange = onChange;
  }
  if (onFocus) {
    events.onFocus = onFocus;
  }
  if (onBlur) {
    events.onBlur = onBlur;
  }

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
      // console.log("[]input onMounted", $elm);
      state.rendered = true;
      if (rest.onMounted) {
        rest.onMounted(event);
      }
    },
    onUnmounted() {
      listener$.destroy();
      box$.methods.destroy();
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      state.rendered = false;
    },
  };
}
