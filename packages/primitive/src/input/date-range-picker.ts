/**
 * DateRangePicker - A date range picker input component.
 *
 * DateRangePicker renders a dual-calendar popup for selecting
 * a start and end date. Commonly used for:
 * - Booking date ranges
 * - Report date filters
 * - Travel date selection
 *
 * Supports reactive `value` (tuple of start/end dates),
 * `onChange` callback, and `placeholder`.
 *
 * @example
 * ```tsx
 * <DateRangePicker
 *   value={[startDate, endDate]}
 *   placeholder="选择日期范围"
 *   onChange={([start, end]) => setRange(start, end)}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";

/** Date range tuple */
export type DateRange = [Date | null, Date | null];

/** Props for DateRangePicker component */
export type DateRangePickerProps = BoxProps & {
  /** Selected date range [start, end] */
  value?: DateRange | Ref<DateRange>;
  /** Placeholder text when no range is selected */
  placeholder?: string | Ref<string>;
  /** Whether the picker is disabled */
  disabled?: boolean | Ref<boolean>;
  /** Whether the picker is readonly */
  readonly?: boolean | Ref<boolean>;
  /** Minimum selectable date */
  min?: Date | Ref<Date | null> | null;
  /** Maximum selectable date */
  max?: Date | Ref<Date | null> | null;
  /** Called when range selection changes */
  onChange?: (value: DateRange) => void;
};

/** Internal state for DateRangePicker */
type DateRangePickerState = {
  value: DateRange;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
};

/**
 * Creates a DateRangePicker component - a date range selector.
 *
 * @param props - DateRangePicker props (value, placeholder, onChange, min, max, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a date range picker
 */
export function DateRangePicker(
  props: DateRangePickerProps = {},
  children?: ViewChildren,
): TimelessElement<DateRangePickerState> {
  const {
    value,
    placeholder = "选择日期范围",
    disabled = false,
    readonly = false,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, {
    value: [null, null] as DateRange,
    placeholder,
    disabled,
    readonly,
  });

  const state = box$.state as typeof box$.state & DateRangePickerState;
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
        state.value = value.value || [null, null];
        const unsub = value.subscribe({
          onChange(v) {
            state.value = (v as DateRange) || [null, null];
          },
        });
        box$.methods.unsubscribe(unsub);
      } else if (Array.isArray(value)) {
        state.value = value;
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
    t: "date-range-picker",
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

export type DateRangePicker = ReturnType<typeof DateRangePicker>;
