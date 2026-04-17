import { DerivedRef, Ref, computed, isRef } from "@timeless/reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { MountedEvent } from "@/event";
import { For, ForProps } from "@/reactive/for";
import { Box, BoxProps } from "@/content/box";
import { View } from "@/content/view";
import { ListenerManager } from "@/util/listener";

type SelectValue = string[];

export type SelectProps<T> = BoxProps & {
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
  onInput?: (e: Event) => void;
};
type SelectState = {
  id?: string;
  name?: string;
  options: { value: string; label: string }[];
  option_elements: (TimelessElement | null)[];
  value: SelectValue;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
};
function defaultSelectRender<T extends { value: any; label: string }>(
  opt: T,
  idx: DerivedRef<number>,
) {
  return View({}, [computed(opt, (t) => t.label)]);
}

export function Select<T extends { value: any; label: string }>(
  props: SelectProps<T>,
  children?: ViewChildren,
) {
  const {
    id,
    key,
    options,
    render = defaultSelectRender,
    value,
    placeholder,
    disabled,
    readonly,
    required,
    name,
    onFocus,
    onBlur,
    onInput,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  const listener$ = ListenerManager();
  const box$ = Box<SelectState>(rest, {} as SelectState);
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
          listener$.push(id.subscribe({
            onChange(v) {},
          }));
        } else {
        }
      }
      if (value !== undefined) {
        if (isRef(value)) {
          listener$.push(value.subscribe({
            onChange(v) {},
          }));
        } else {
        }
      }
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          listener$.push(placeholder.subscribe({
            onChange(v) {},
          }));
        } else {
        }
      }
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          listener$.push(disabled.subscribe({
            onChange(v) {},
          }));
        } else {
        }
      }
      if (readonly !== undefined) {
        if (isRef(readonly)) {
          listener$.push(readonly.subscribe({
            onChange(v) {},
          }));
        } else {
        }
      }
      if (required !== undefined) {
        if (isRef(required)) {
          listener$.push(required.subscribe({
            onChange(v) {},
          }));
        } else {
        }
      }

      // Handle name attribute
      if (name !== undefined) {
        if (isRef(name)) {
          listener$.push(name.subscribe({
            onChange(v) {},
          }));
        } else {
        }
      }
    },
    build_option_elements(children?: ViewChildren) {},
  };

  methods.subscribe_props();
  // box$.methods.build_children([View({}, children)]);
  box$.methods.build_children(children);
  state.option_elements = for$.children;

  return {
    t: "select",
    get $elm() {
      return $elm;
    },
    set $elm(value: any) {
      $elm = value;
    },
    state,
    children: state.children,
    onMounted(event: MountedEvent) {
      console.log("[primitive]select onMounted", $elm);
      state.rendered = true;
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
      listener$.destroy();
      if (rest.onUnmounted) {
        rest.onUnmounted();
      }
      box$.methods.destroy();
      state.rendered = false;
    },
  };
}
