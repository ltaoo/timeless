/**
 * SearchSelect - A select input with search/filter capability.
 *
 * SearchSelect renders a dropdown that allows users to search/filter
 * through options before selecting. Commonly used for:
 * - Large option lists
 * - Remote search / async data loading
 * - Autocomplete-style selection
 *
 * Supports reactive `value`, `options` for filtering,
 * `searchValue` for the input keyword, and `onSearch` callback.
 *
 * @example
 * ```tsx
 * <SearchSelect
 *   value={selected}
 *   options={filteredOptions}
 *   searchValue={keyword}
 *   placeholder="搜索并选择"
 *   onSearch={(kw) => fetchOptions(kw)}
 *   onChange={(val) => setSelected(val)}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/inner-reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";

/** A search-select option */
export type SearchSelectOption<T = any> = {
  label: string;
  value: T;
  disabled?: boolean;
};

/** Props for SearchSelect component */
export type SearchSelectProps<T = any> = BoxProps & {
  /** Selected value */
  value?: T | Ref<T | null> | null;
  /** Options (filtered by search) */
  options?: SearchSelectOption<T>[] | Ref<SearchSelectOption<T>[]>;
  /** Current search keyword */
  searchValue?: string | Ref<string>;
  /** Placeholder text */
  placeholder?: string | Ref<string>;
  /** Whether the select is disabled */
  disabled?: boolean | Ref<boolean>;
  /** Whether the select is readonly */
  readonly?: boolean | Ref<boolean>;
  /** Whether to support clearing */
  allowClear?: boolean | Ref<boolean>;
  /** Whether it's loading */
  loading?: boolean | Ref<boolean>;
  /** Called when search keyword changes */
  onSearch?: (keyword: string) => void;
  /** Called when selection changes */
  onChange?: (value: T | null) => void;
};

/** Internal state for SearchSelect */
type SearchSelectState = {
  value: any;
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
  loading: boolean;
  searchValue: string;
  allowClear: boolean;
};

/**
 * Creates a SearchSelect component - a searchable select.
 *
 * @param props - SearchSelect props (value, options, searchValue, onSearch, onChange, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a search-select
 */
export function SearchSelect<T = any>(
  props: SearchSelectProps<T> = {},
  children?: ViewChildren,
): TimelessElement<SearchSelectState> {
  const {
    value = null,
    options,
    searchValue = "",
    placeholder = "搜索并选择",
    disabled = false,
    readonly = false,
    allowClear = false,
    loading = false,
    onSearch,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, {
    value: null,
    placeholder,
    disabled,
    readonly,
    loading,
    searchValue: "",
    allowClear,
  });

  const state = box$.state as typeof box$.state & SearchSelectState;
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
        state.value = value.value;
        const unsub = value.subscribe({
          onChange(v) {
            state.value = v;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
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
    subscribe_searchValue() {
      if (isRef(searchValue)) {
        state.searchValue = searchValue.value as string;
        const unsub = searchValue.subscribe({
          onChange(v) {
            state.searchValue = v as string;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.searchValue = searchValue as string;
      }
    },
    subscribe_loading() {
      if (isRef(loading)) {
        state.loading = loading.value as boolean;
        const unsub = loading.subscribe({
          onChange(v) {
            state.loading = v as boolean;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.loading = loading as boolean;
      }
    },
    subscribe_allowClear() {
      if (isRef(allowClear)) {
        state.allowClear = allowClear.value as boolean;
        const unsub = allowClear.subscribe({
          onChange(v) {
            state.allowClear = v as boolean;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.allowClear = allowClear as boolean;
      }
    },
  };

  methods.subscribe_props();
  methods.subscribe_value();
  methods.subscribe_placeholder();
  methods.subscribe_disabled();
  methods.subscribe_searchValue();
  methods.subscribe_loading();
  methods.subscribe_allowClear();
  box$.methods.add_event();

  if (children) {
    box$.methods.build_children(children);
  }

  return {
    t: "search-select",
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

export type SearchSelect = ReturnType<typeof SearchSelect>;
