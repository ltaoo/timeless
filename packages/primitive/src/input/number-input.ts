import { DerivedRef, Ref, isRef } from "@timeless/reactive";

import { Box, BoxProps } from "@/content/box";
import { MountedEvent } from "@/event";

export type NumberInputProps = BoxProps & {
  value?: (number | null) | DerivedRef<number | null> | Ref<number | null>;
  step?: number | DerivedRef<number> | Ref<number>;
  precision?: number | DerivedRef<number> | Ref<number>;
  min?: number | DerivedRef<number> | Ref<number>;
  max?: number | DerivedRef<number> | Ref<number>;
  placeholder?: string | DerivedRef<string> | Ref<string>;
  disabled?: boolean | DerivedRef<boolean> | Ref<boolean>;
  onChange?: (event: Event) => void;
};
type NumberInputState = {
  value: string;
  step: number;
  precision: number;
  min: number;
  max: number;
  placeholder?: string;
  disabled?: boolean;
};

export function NumberInput(props: NumberInputProps = {}) {
  const { ...rest } = props;

  let $elm: any = null;
  const box$ = Box<NumberInputState>(rest, {
    value: "",
    step: 1,
    precision: 0,
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
  });

  const state = box$.state;
  const events = box$.events;

  const methods = {
    subscribe_props() {
      box$.methods.subscribe_props();
      const value = props.value;
      if (value !== undefined) {
        if (isRef(value)) {
          state.value = value.value === null ? "0" : String(value.value);
          box$.methods.unsubscribe(
            value.subscribe({
              onChange(v) {
                state.value = v === null ? "0" : String(v);
                if ($elm && typeof $elm.setValue === "function") {
                  $elm.setValue(v);
                }
              },
            }),
          );
        } else {
          state.value = value === null ? "0" : String(value);
        }
      }
      const placeholder = props.placeholder;
      if (placeholder !== undefined) {
        if (isRef(placeholder)) {
          state.placeholder = placeholder.value;
          box$.methods.unsubscribe(
            placeholder.subscribe({
              onChange(v) {
                state.placeholder = v;
              },
            }),
          );
        } else {
          state.placeholder = placeholder;
        }
      }
      const disabled = props.disabled;
      if (disabled !== undefined) {
        if (isRef(disabled)) {
          state.disabled = disabled.value;
          box$.methods.unsubscribe(
            disabled.subscribe({
              onChange(v) {
                state.disabled = v;
              },
            }),
          );
        } else {
          state.disabled = disabled;
        }
      }

      const step = props.step;
      if (step !== undefined) {
        if (isRef(step)) {
          state.step = step.value;
          const unsubscribe = step.subscribe({
            onChange(v) {
              state.step = v;
            },
          });
          box$.methods.unsubscribe(unsubscribe);
        } else {
          state.step = step;
        }
      }
    },
  };

  methods.subscribe_props();

  return {
    t: "number-input",
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
