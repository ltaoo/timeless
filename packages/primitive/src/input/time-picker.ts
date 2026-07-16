/**
 * TimePicker - A time picker input component.
 *
 * TimePicker renders a time selection popup with hour/minute options.
 * Commonly used for:
 * - Appointment time selection
 * - Event scheduling
 * - Alarm/time configuration
 *
 * Supports reactive `value`, `onChange` callback,
 * and `format` for 12h/24h display.
 *
 * @example
 * ```tsx
 * <TimePicker
 *   value="14:30"
 *   format="24h"
 *   placeholder="选择时间"
 *   onChange={(time) => setTime(time)}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";

/** Time format for display */
export type TimeFormat = "12h" | "24h";

/** Props for TimePicker component */
export type TimePickerProps = BoxProps & {
  /** Selected time value (HH:mm format string) */
  value?: string | Ref<string | null> | null;
  /** Placeholder text when no time is selected */
  placeholder?: string | Ref<string>;
  /** Time display format */
  format?: TimeFormat | Ref<TimeFormat>;
  /** Whether the picker is disabled */
  disabled?: boolean | Ref<boolean>;
  /** Whether the picker is readonly */
  readonly?: boolean | Ref<boolean>;
  /** Step interval in minutes */
  step?: number | Ref<number>;
  /** Called when time selection changes */
  onChange?: (value: string | null) => void;
};

/** Internal state for TimePicker */
type TimePickerState = {
  value: string | null;
  placeholder: string;
  format: TimeFormat;
  disabled: boolean;
  readonly: boolean;
  step: number;
};

/**
 * Creates a TimePicker component - a time selector.
 *
 * @param props - TimePicker props (value, format, placeholder, onChange, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a time picker
 */
export function TimePicker(
  props: TimePickerProps = {},
  children?: ViewChildren,
): TimelessElement<TimePickerState> {
  const {
    value = null,
    placeholder = "选择时间",
    format = "24h",
    disabled = false,
    readonly = false,
    step = 30,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, {
    value: null as string | null,
    placeholder,
    format,
    disabled,
    readonly,
    step,
  });

  const state = box$.state as typeof box$.state & TimePickerState;
  const events = box$.events;

  const _mount_cleanups: (() => void)[] = [];

  const _unmount = () => {
    _mount_cleanups.forEach((fn) => fn());
    _mount_cleanups.length = 0;
    box$.methods.set$elm(null);
    if (rest.onUnmounted) {
      rest.onUnmounted();
    }
    state.rendered = false;
    $elm = null;
  };

  const methods = {
    subscribe_props() {
      if (box$.listener$.length === 0) {
        box$.methods.subscribe_props();
      }
    },
    subscribe_value() {
      if (isRef(value)) {
        state.value = value.value as string | null;
        const unsub = value.subscribe({
          onChange(v) {
            state.value = v as string | null;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.value = value as string | null;
      }
    },
    subscribe_placeholder() {
      if (isRef(placeholder)) {
        state.placeholder = placeholder.value as string;
        const unsub = placeholder.subscribe({
          onChange(v) {
            state.placeholder = v as string;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.placeholder = placeholder as string;
      }
    },
    subscribe_format() {
      if (isRef(format)) {
        state.format = format.value as TimeFormat;
        const unsub = format.subscribe({
          onChange(v) {
            state.format = v as TimeFormat;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.format = format as TimeFormat;
      }
    },
    subscribe_disabled() {
      if (isRef(disabled)) {
        state.disabled = disabled.value as boolean;
        const unsub = disabled.subscribe({
          onChange(v) {
            state.disabled = v as boolean;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.disabled = disabled as boolean;
      }
    },
    subscribe_step() {
      if (isRef(step)) {
        state.step = step.value as number;
        const unsub = step.subscribe({
          onChange(v) {
            state.step = v as number;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.step = step as number;
      }
    },
  };

  methods.subscribe_props();
  methods.subscribe_value();
  methods.subscribe_placeholder();
  methods.subscribe_format();
  methods.subscribe_disabled();
  methods.subscribe_step();
  box$.methods.add_event();

  if (children) {
    box$.methods.build_children(children);
  }

  return {
    t: "time-picker",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      box$.methods.set$elm(v);
      $elm = v;
    },
    state,
    children: state.children,
    events,
    onMounted(event) {
      state.rendered = true;
      if (rest.onMounted) {
        const cleanup = rest.onMounted(event);
        if (typeof cleanup === "function") {
          _mount_cleanups.push(cleanup);
        }
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (child && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (rest.beforeUnmounted) {
        rest.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (node && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      _unmount();
    },
  };
}

export type TimePicker = ReturnType<typeof TimePicker>;
