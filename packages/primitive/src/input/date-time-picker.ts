/**
 * DateTimePicker - A combined date + time picker component.
 *
 * DateTimePicker renders a calendar popup with integrated time selection,
 * allowing users to select both date and time in one widget.
 * Commonly used for:
 * - Appointment scheduling
 * - Event creation with precise timing
 * - Deadline input
 *
 * Supports reactive `value` (Date), `onChange` callback,
 * and `placeholder`.
 *
 * @example
 * ```tsx
 * <DateTimePicker
 *   value={dateTimeValue}
 *   placeholder="选择日期时间"
 *   onChange={(date) => setDateTime(date)}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";

/** Props for DateTimePicker component */
export type DateTimePickerProps = BoxProps & {
  /** Selected date-time value (Date object or ISO string) */
  value?: string | Date | Ref<string | Date | null> | null;
  /** Placeholder text when no value is selected */
  placeholder?: string | Ref<string>;
  /** Whether the picker is disabled */
  disabled?: boolean | Ref<boolean>;
  /** Whether the picker is readonly */
  readonly?: boolean | Ref<boolean>;
  /** Minimum selectable date-time */
  min?: Date | Ref<Date | null> | null;
  /** Maximum selectable date-time */
  max?: Date | Ref<Date | null> | null;
  /** Called when selection changes */
  onChange?: (value: Date | null) => void;
};

/** Internal state for DateTimePicker */
type DateTimePickerState = {
  value: Date | null;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
};

/**
 * Creates a DateTimePicker component - a date + time selector.
 *
 * @param props - DateTimePicker props (value, placeholder, onChange, min, max, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a date-time picker
 */
export function DateTimePicker(
  props: DateTimePickerProps = {},
  children?: ViewChildren,
): TimelessElement<DateTimePickerState> {
  const {
    value = null,
    placeholder = "选择日期时间",
    disabled = false,
    readonly = false,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, {
    value: null as Date | null,
    placeholder,
    disabled,
    readonly,
  });

  const state = box$.state as typeof box$.state & DateTimePickerState;
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

  const resolveDate = (v: string | Date | null): Date | null => {
    if (v === null || v === undefined) return null;
    if (v instanceof Date) return v;
    return new Date(v);
  };

  const methods = {
    subscribe_props() {
      if (box$.listener$.length === 0) {
        box$.methods.subscribe_props();
      }
    },
    subscribe_value() {
      if (isRef(value)) {
        state.value = resolveDate(value.value);
        const unsub = value.subscribe({
          onChange(v) {
            state.value = resolveDate(v as string | Date | null);
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.value = resolveDate(value as string | Date | null);
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
  };

  methods.subscribe_props();
  methods.subscribe_value();
  methods.subscribe_placeholder();
  methods.subscribe_disabled();
  box$.methods.add_event();

  if (children) {
    box$.methods.build_children(children);
  }

  return {
    t: "date-time-picker",
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

export type DateTimePicker = ReturnType<typeof DateTimePicker>;
