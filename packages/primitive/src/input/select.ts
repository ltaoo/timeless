import { DerivedRef, Ref, computed, isRef } from "@timeless/inner-reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { MountedEvent } from "@/event";
import { For, ForProps } from "@/reactive/for";
import { Show } from "@/reactive/show";
import { Box, BoxProps } from "@/content/box";
import { bind_disabled } from "@/util/disabled";

type SelectValue = string[];

export type SelectProps<T extends { label: string; value: any }> = BoxProps & {
  id?: string | Ref<string>;
  name?: string | Ref<string>;
  key?: string;
  options: ForProps<T>["each"];
  render?: ForProps<T>["render"];
  value?: Ref<SelectValue>;
  placeholder?: string | Ref<string>;
  disabled?: boolean | Ref<boolean>;
  readonly?: boolean | Ref<boolean>;
  required?: boolean | Ref<boolean>;
  multiple?: boolean | Ref<boolean>;
  onChange?: (e: Event) => void;
};
type SelectState<T extends { label: string; value: any }> = {
  id?: string;
  name?: string;
  options: { value: string; label: string }[];
  option_elements: (TimelessElement | null)[];
  placeholder: string;
  value: T["value"];
  selected: null | ReturnType<typeof SelectOption>;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
};
function defaultSelectRender<
  T extends {
    value: any;
    label: string;
    options?: {
      value: any;
      label: string;
    }[];
  },
>(opt: T, idx: DerivedRef<number>) {
  console.log("invoke defualt select render", opt);
  if (!!opt["options"]) {
    return SelectOptionGroup({ ...opt, options: opt.options });
  }
  return SelectOption(opt);
  // return Show({
  //   when: !!opt["options"],
  //   ok() {
  //     return SelectOptionGroup({ ...opt, options: opt.options });
  //   },
  //   else() {
  //     return SelectOption(opt);
  //   },
  // });
}

export function Select<T extends { value: any; label: string }>(
  props: SelectProps<T>,
  // children?: ViewChildren,
) {
  const {
    id,
    key,
    options,
    render = defaultSelectRender,
    value,
    placeholder = "请选择",
    disabled,
    attributes,
    readonly,
    required,
    name,
    onFocus,
    onBlur,
    onChange,
    ...rest
  } = props;

  let select_attributes = attributes;
  if (disabled !== undefined) {
    select_attributes = { ...attributes };
    delete select_attributes.disabled;
  }

  let $elm: any = null;

  const box$ = Box<SelectState<T>>({ ...rest, attributes: select_attributes }, {
    placeholder: "",
    value: null,
    selected: null,
    disabled: false,
  } as SelectState<T>);
  const for$ = For({
    key,
    each: options,
    render,
  });
  const state = box$.state;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      if (id !== undefined) {
        if (isRef(id)) {
          box$.methods.unsubscribe(
            id.subscribe({
              onChange(v) {},
            }),
          );
        } else {
        }
      }
      if (value !== undefined) {
        if (isRef(value)) {
          state.value = value.value;
          box$.methods.unsubscribe(
            value.subscribe({
              onChange(v) {
                state.value = v;
                $elm?.setValue?.(v);
              },
            }),
          );
        } else {
          state.value = value;
        }
      }
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          state.placeholder = placeholder.value;
          box$.methods.unsubscribe(
            placeholder.subscribe({
              onChange(v) {
                state.placeholder = v;
                $elm?.setPlaceholder?.(v);
              },
            }),
          );
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
        add_cleanup: box$.methods.unsubscribe,
      });
      if (readonly !== undefined) {
        const set_readonly = (value: boolean) => {
          state.readonly = value;
          state.attributes.readonly = value ? "" : undefined;
          box$.methods.apply_attr("readonly", value);
        };
        set_readonly(isRef(readonly) ? readonly.value : readonly);
        if (isRef(readonly))
          box$.methods.unsubscribe(
            readonly.subscribe({ onChange: set_readonly }),
          );
      }
      if (required !== undefined) {
        if (isRef(required)) {
          box$.methods.unsubscribe(
            required.subscribe({
              onChange(v) {},
            }),
          );
        } else {
        }
      }
      if (name !== undefined) {
        if (isRef(name)) {
          box$.methods.unsubscribe(
            name.subscribe({
              onChange(v) {},
            }),
          );
        } else {
        }
      }
    },
    select(value: any) {
      const selected_value = Array.isArray(value) ? value[0] : value;
      const visit = (children: any[]) => {
        for (const child of children) {
          if (!child) continue;
          if (child.t === "select-option") {
            if (String(child.state.value) === String(selected_value)) {
              child.select();
              state.selected = child;
            } else child.unselect();
          } else visit(child.children ?? []);
        }
      };
      state.selected = null;
      visit(state.children);
    },
    // build_option_elements(children?: ViewChildren) {},
  };

  methods.subscribe_props();
  box$.methods.add_event();
  state.children = [for$];
  const events = box$.events;
  events.onFocus = onFocus;
  events.onBlur = onBlur;
  events.onChange = function (event) {
    if (state.disabled) {
      return;
    }
    if (onChange) {
      onChange(event);
    }
    methods.select((event.target as any).value);
  };

  if (state.value) {
    methods.select(state.value);
  }
  console.log("before return", state.children, state.selected);

  return {
    t: "select",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      box$.methods.set$elm(value);
      $elm = value;
    },
    state,
    events,
    children: state.children,
    onMounted(event: MountedEvent) {
      console.log("[primitive]select onMounted", $elm);
      state.rendered = true;
      for$.onMounted(event);
      if (rest.onMounted) {
        box$.methods.unsubscribe(rest.onMounted(event));
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      for$.onUnmounted();
      box$.methods.destroy();
      state.rendered = false;
      state.children.length = 0;
    },
  };
}

type SelectOptionProps = BoxProps & {
  value: any;
  label: string;
  disabled?: boolean;
};
export function SelectOption(props: SelectOptionProps) {
  let $elm: any = null;

  const state = {
    get value() {
      return props.value;
    },
    get label() {
      return props.label;
    },
    get disabled() {
      return props.disabled;
    },
    selected: false,
  };

  return {
    t: "select-option",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      $elm = v;
    },
    state,
    children: [],
    select() {
      state.selected = true;
      if ($elm) {
        $elm.select();
      }
    },
    unselect() {
      state.selected = false;
      if ($elm) {
        $elm.unselect();
      }
    },
    onMounted(event: MountedEvent) {
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}

type SelectOptionGroupProps<T extends { label: string; value: any }> =
  BoxProps & {
    key?: string;
    label: string;
    options: ForProps<T>["each"];
    render?: ForProps<T>["render"];
  };
export function SelectOptionGroup<T extends { label: string; value: any }>(
  props: SelectOptionGroupProps<T>,
) {
  const { key, label, options, render = defaultSelectGroupRender } = props;

  let $elm: any = null;
  const for$ = For({
    key,
    each: options,
    render,
  });
  const state: { label: string; selected: any } = {
    label: props.label,
    selected: null,
  };

  const methods = {
    subscribe_props() {},
  };

  const children = [for$];

  return {
    t: "select-option-group",
    get $elm() {
      return $elm;
    },
    set $elm(v: any) {
      $elm = v;
    },
    state,
    children,
    select(v: any) {
      const matched = for$.children.find((child) => {
        return child?.state.value === v;
      }) as any;
      if (!matched) {
        return null;
      }
      if (state.selected) {
        state.selected.unselect();
      }
      state.selected = matched;
      matched.select(v);
      return matched;
    },
    unselect() {
      if (state.selected) {
        state.selected.unselect();
      }
    },
    onMounted(event: MountedEvent) {
      for$.onMounted(event);
      if (props.onMounted) {
        props.onMounted(event);
      }
    },
    onUnmounted() {
      for$.onUnmounted();
      if (props.onUnmounted) {
        props.onUnmounted();
      }
    },
  };
}

function defaultSelectGroupRender<T extends { label: string; value: any }>(
  props: T,
) {
  return SelectOption(props);
}
