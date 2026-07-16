/**
 * Cascader - A cascading select component for hierarchical data.
 *
 * Cascader renders a multi-panel select that allows drilling into
 * nested options, similar to a file-browser or category picker.
 * Commonly used for:
 * - Region/city/district selection
 * - Category/subcategory selection
 * - Organizational hierarchy selection
 *
 * Supports reactive `value`, `options` tree structure,
 * and `onChange` callback.
 *
 * @example
 * ```tsx
 * <Cascader
 *   value={selectedPath}
 *   options={treeOptions}
 *   placeholder="请选择"
 *   onChange={(path) => selectPath(path)}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";

/** A single cascader option with optional children */
export type CascaderOption<T = any> = {
  label: string;
  value: T;
  disabled?: boolean;
  children?: CascaderOption<T>[];
};

/** Props for Cascader component */
export type CascaderProps<T = any> = BoxProps & {
  /** Selected value path (array of values from root to selected node) */
  value?: T[] | Ref<T[]>;
  /** Tree-structured options */
  options?: CascaderOption<T>[] | Ref<CascaderOption<T>[]>;
  /** Placeholder text when no value is selected */
  placeholder?: string | Ref<string>;
  /** Whether the cascader is disabled */
  disabled?: boolean | Ref<boolean>;
  /** Whether the cascader is readonly */
  readonly?: boolean | Ref<boolean>;
  /** Called when selection changes */
  onChange?: (path: T[]) => void;
};

/** Internal state for Cascader */
type CascaderState = {
  value: any[];
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
};

/**
 * Creates a Cascader component - a hierarchical select.
 *
 * @param props - Cascader props (value, options, placeholder, onChange, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a cascading select
 */
export function Cascader(
  props: CascaderProps = {},
  children?: ViewChildren,
): TimelessElement<CascaderState> {
  const {
    value,
    options,
    placeholder = "请选择",
    disabled = false,
    readonly = false,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, {
    value: [] as any[],
    placeholder,
    disabled,
    readonly,
  });

  const state = box$.state as typeof box$.state & CascaderState;
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
        state.value = value.value as any[];
        const unsub = value.subscribe({
          onChange(v) {
            state.value = v as any[];
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
    t: "cascader",
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

export type Cascader = ReturnType<typeof Cascader>;
