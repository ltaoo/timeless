import { DerivedRef, Ref, isRef } from "@timeless/inner-reactive";

import { ViewProps } from "@/content/view";
import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";
import { ListenerManager } from "@/util/listener";

export type RadioProps = BoxProps & {
  id?: string;
  name?: string | DerivedRef<string> | Ref<string>;
  checked?: boolean | DerivedRef<boolean> | Ref<boolean>;
  readonly?: boolean | DerivedRef<boolean> | Ref<boolean>;
  disabled?: boolean | DerivedRef<boolean> | Ref<boolean>;
  required?: boolean | DerivedRef<boolean> | Ref<boolean>;
  tabindex?: number;
  onChange?: (event: MouseEvent) => void;
  onClick?: (event: Event) => void;
  onMounted?: ViewProps["onMounted"];
  beforeUnmounted?: ViewProps["beforeUnmounted"];
  onUnmounted?: ViewProps["onUnmounted"];
};
type RadioState = {
  id?: string;
  name?: string;
  checked: boolean;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  tabindex?: number;
};

export function Radio(props: RadioProps) {
  const {
    id,
    name,
    checked,
    disabled,
    readonly,
    required,
    tabindex,
    onMounted,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  const listener$ = ListenerManager();
  const box$ = Box<RadioState>(rest, {
    checked: false,
    disabled: false,
    readonly: false,
    required: false,
  } as RadioState);

  const state = box$.state;
  const events = box$.events;

  const methods = {
    setProp(key: string, value: any) {
      if ($elm) {
        $elm.setAttribute(key, value);
      }
      // state.props[key] = value;
    },
    subscribe_props() {
      box$.methods.subscribe_props();

      if (id !== undefined) {
        if (isRef(id)) {
          state.id = id.value;
          const unsub = id.subscribe({
            onChange(v) {
              state.id = v;
              methods.setProp("id", v);
            },
          });
          listener$.push(unsub);
        } else {
          state.id = id;
        }
      }
      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          state.name = name.value;
          const unsub = name.subscribe({
            onChange(v) {
              state.name = v;
              methods.setProp("name", v);
            },
          });
          listener$.push(unsub);
        } else {
          state.name = name;
        }
      }

      // Handle value attribute
      if (checked !== undefined) {
        if (isRef(checked)) {
          state.checked = checked.value;
          const unsub = checked.subscribe({
            onChange(v) {
              state.checked = v;
              methods.setProp("checked", v);
            },
          });
          listener$.push(unsub);
        } else {
          state.checked = checked;
        }
      }

      // Handle disabled attribute
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          state.disabled = disabled.value;
          const unsub = disabled.subscribe({
            onChange(v) {
              state.disabled = v;
              methods.setProp("disabled", v);
            },
          });
          listener$.push(unsub);
        } else {
          state.disabled = disabled;
        }
      }

      // Handle readonly attribute
      if (readonly !== undefined) {
        if (isRef(readonly)) {
          state.readonly = readonly.value;
          const unsub = readonly.subscribe({
            onChange(v) {
              state.readonly = v;
              methods.setProp("readOnly", v);
            },
          });
          listener$.push(unsub);
        } else {
          state.readonly = readonly;
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          state.required = required.value;
          const unsub = required.subscribe({
            onChange(v) {
              state.required = v;
              methods.setProp("required", v);
            },
          });
          listener$.push(unsub);
        } else {
          state.required = required;
        }
      }

      if (tabindex !== undefined) {
        state.tabindex = tabindex;
      }
    },
  };

  methods.subscribe_props();

  return {
    t: "radio",
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
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
    onUnmounted() {
      listener$.destroy();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}
