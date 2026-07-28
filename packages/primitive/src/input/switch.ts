import { DerivedRef, Ref, isRef } from "@timeless/inner-reactive";

import { MountedEvent } from "@/event";
import { ViewProps } from "@/content/view";
import { Logger } from "@/util/logger";
import { Box, BoxProps } from "@/content/box";

const logger = Logger({ prefix: "primitive", scope: "input/switch" });

export type SwitchProps = BoxProps & {
  id?: string;
  name?: string | DerivedRef<string> | Ref<string>;
  checked?: boolean | DerivedRef<boolean> | Ref<boolean>;
  readonly?: boolean | DerivedRef<boolean> | Ref<boolean>;
  disabled?: boolean | DerivedRef<boolean> | Ref<boolean>;
  required?: boolean | DerivedRef<boolean> | Ref<boolean>;
  loading?: boolean | DerivedRef<boolean> | Ref<boolean>;
  onChange?: (event: Event) => void;
  onClick?: (event: MouseEvent) => void;
  onMounted?: ViewProps["onMounted"];
  beforeUnmounted?: ViewProps["beforeUnmounted"];
  onUnmounted?: ViewProps["onUnmounted"];
};

type SwitchState = {
  id: string;
  name: string;
  checked: boolean;
  disabled: boolean;
  required: boolean;
  readonly: boolean;
  loading: boolean;
};

export function Switch(props: SwitchProps) {
  const {
    id,
    name,
    checked,
    disabled,
    readonly,
    required,
    loading,
    onMounted,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  const box$ = Box<SwitchState>(rest, {
    id: "",
    name: "",
    checked: false,
    disabled: false,
    required: false,
    readonly: false,
    loading: false,
  } as SwitchState);
  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();

      if (id !== undefined) {
        if (isRef(id)) {
          state.id = id.value;
          const unsub = id.subscribe({
            onChange(v) {
              state.id = String(v);
              // methods.setProp("id", String(v));
            },
          });
          box$.methods.unsubscribe(unsub);
          // methods.setProp("id", id.value);
        } else {
          // methods.setProp("id", id);
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
              // methods.setProp("name", v);
            },
          });
          box$.methods.unsubscribe(unsub);
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
              $elm.setChecked(v);
              // if ($elm && typeof $elm.setChecked === "function") {
              //   setTimeout(() => {
              //   }, 0);
              // }
            },
          });
          box$.methods.unsubscribe(unsub);
        } else {
          state.checked = checked;
        }
      }

      if (loading !== undefined) {
        if (isRef(loading)) {
          state.loading = loading.value;
          const unsub = loading.subscribe({
            onChange(v) {
              state.loading = v;
              $elm.setLoading(v);
            },
          });
          box$.methods.unsubscribe(unsub);
        } else {
          state.loading = loading;
        }
      }

      // Handle disabled attribute
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          state.disabled = disabled.value;
          const unsub = disabled.subscribe({
            onChange(v) {
              state.disabled = v;
              // methods.setProp("disabled", v);
            },
          });
          box$.methods.unsubscribe(unsub);
          // methods.setProp("disabled", disabled.value);
        } else {
          // methods.setProp("disabled", disabled as boolean);
          state.disabled = disabled as boolean;
        }
      }

      // Handle readonly attribute
      if (readonly !== undefined) {
        if (isRef(readonly)) {
          state.readonly = readonly.value;
          const unsub = readonly.subscribe({
            onChange(v) {
              state.readonly = v;
              // methods.setProp("readOnly", v);
            },
          });
          box$.methods.unsubscribe(unsub);
        } else {
          state.readonly = readonly as boolean;
        }
      }

      // Handle required attribute
      if (required !== undefined) {
        if (isRef(required)) {
          state.required = required.value;
          const unsub = required.subscribe({
            onChange(v) {
              // methods.setProp("required", v);
            },
          });
          box$.methods.unsubscribe(unsub);
          // methods.setProp("required", required.value);
        } else {
          // methods.setProp("required", required as boolean);
          state.required = required;
        }
      }
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();

  events.onChange = function (event) {
    if (state.loading) {
      return;
    }
    if (state.disabled) {
      return;
    }
    if (onChange) {
      onChange(event);
    }
  };

  return {
    t: "switch",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: [],
    events,
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        const unsubscribe = props.onMounted(event);
        box$.methods.unsubscribe(unsubscribe);
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      box$.methods.destroy();
    },
  };
}
