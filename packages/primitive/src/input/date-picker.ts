/**
 * DatePicker - A date picker input component.
 *
 * DatePicker renders a calendar popup for selecting a single date.
 * Commonly used for:
 * - Birthday/date selection
 * - Scheduling forms
 * - Event date input
 *
 * Supports reactive `value`, `onChange` callback,
 * and `placeholder` for empty state.
 *
 * @example
 * ```tsx
 * <DatePicker
 *   value={selectedDate}
 *   placeholder="选择日期"
 *   onChange={(date) => setDate(date)}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";

/** Props for DatePicker component */
export type DatePickerProps = BoxProps & {
  /** Selected date value (ISO string or Date) */
  value?: string | Date | Ref<string | Date | null> | null;
  /** Placeholder text when no date is selected */
  placeholder?: string | Ref<string>;
  /** Whether the picker is disabled */
  disabled?: boolean | Ref<boolean>;
  /** Whether the picker is readonly */
  readonly?: boolean | Ref<boolean>;
  /** Minimum selectable date */
  min?: Date | Ref<Date | null> | null;
  /** Maximum selectable date */
  max?: Date | Ref<Date | null> | null;
  /** Called when date selection changes */
  onChange?: (value: Date | null) => void;
};

/** Internal state for DatePicker */
type DatePickerState = {
  value: Date | null;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
};

/**
 * Creates a DatePicker component - a single date selector.
 *
 * @param props - DatePicker props (value, placeholder, onChange, min, max, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a date picker
 */
export function DatePicker(
  props: DatePickerProps = {},
  children?: ViewChildren,
): TimelessElement<DatePickerState> {
  const {
    value = null,
    placeholder = "选择日期",
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

  const state = box$.state as typeof box$.state & DatePickerState;
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
    t: "date-picker",
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

export type DatePicker = ReturnType<typeof DatePicker>;
