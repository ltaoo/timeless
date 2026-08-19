import { DerivedRef, Ref, isRef } from "@timeless/inner-reactive";

import { MountedEvent } from "@/event";
import { ViewProps } from "@/content/view";
import { ListenerManager } from "@/util/listener";
import { isClassNameRef, isStyleRef, RawViewStyleProperties } from "@/style";
import { Logger } from "@/util/logger";
import { Box, BoxProps } from "@/content/box";
import { bind_disabled } from "@/util/disabled";

const logger = Logger({ prefix: "primitive", scope: "input/checkbox" });

export type CheckboxProps = BoxProps & {
  id?: string;
  name?: string | DerivedRef<string> | Ref<string>;
  checked?: boolean | DerivedRef<boolean> | Ref<boolean>;
  indeterminate?: boolean | DerivedRef<boolean> | Ref<boolean>;
  readonly?: boolean | DerivedRef<boolean> | Ref<boolean>;
  disabled?: boolean | DerivedRef<boolean> | Ref<boolean>;
  required?: boolean | DerivedRef<boolean> | Ref<boolean>;
  tabindex?: number;
  onChange?: (event: Event) => void;
  onClick?: (event: MouseEvent) => void;
  onMounted?: ViewProps["onMounted"];
  beforeUnmounted?: ViewProps["beforeUnmounted"];
  onUnmounted?: ViewProps["onUnmounted"];
};

type CheckboxState = {
  id: string;
  name: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  readonly: boolean;
  tabindex?: number;
};

export function Checkbox(props: CheckboxProps) {
  const {
    id,
    name,
    checked,
    indeterminate,
    disabled,
    attributes,
    readonly,
    required,
    tabindex,
    onMounted,
    onChange,
    ...rest
  } = props;

  let checkbox_attributes = attributes;
  if (disabled !== undefined) {
    checkbox_attributes = { ...attributes };
    delete checkbox_attributes.disabled;
  }

  let $elm: any = null;
  const box$ = Box<CheckboxState>(
    { ...rest, attributes: checkbox_attributes },
    {
      id: "",
      name: "",
      checked: false,
      indeterminate: false,
      disabled: false,
      required: false,
      readonly: false,
    } as CheckboxState,
  );
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
              // if ($elm && typeof $elm.setChecked === "function") {
              //   setTimeout(() => {
              //     $elm.setChecked(v);
              //   }, 0);
              // }
            },
          });
          box$.methods.unsubscribe(unsub);
        } else {
          state.checked = checked;
        }
      }

      bind_disabled({
        value: disabled,
        set_disabled(value) {
          state.disabled = value;
          state.attributes.disabled = value ? "" : undefined;
          box$.methods.apply_attr("disabled", value);
        },
        add_cleanup: box$.methods.unsubscribe,
      });

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

      if (tabindex !== undefined) {
        state.tabindex = tabindex;
      }
    },
  };

  methods.subscribe_props();
  box$.methods.add_event();

  if (onChange) {
    events.onChange = onChange;
  }

  return {
    t: "checkbox",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      box$.methods.set$elm(value);
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
