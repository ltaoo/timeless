/**
 * TreeSelect - A tree structure select component.
 *
 * TreeSelect renders a dropdown with expandable/collapsible tree nodes,
 * allowing users to select from hierarchical data.
 * Commonly used for:
 * - Organization/department selection
 * - Category tree selection
 * - Folder/file navigation
 * - Permission tree configuration
 *
 * Supports reactive `value`, `nodes` tree data,
 * `multiple` for multi-select with checkboxes,
 * and `onChange` callback.
 *
 * @example
 * ```tsx
 * <TreeSelect
 *   value={selectedKeys}
 *   nodes={treeData}
 *   multiple
 *   placeholder="请选择部门"
 *   onChange={(keys) => setSelectedKeys(keys)}
 * />
 * ```
 */
import { DerivedRef, isRef, Ref } from "@timeless/reactive";

import { TimelessElement, ViewChildren } from "@/content/type";
import { Box, BoxProps } from "@/content/box";

/** A single tree node */
export type TreeSelectNode<T = any> = {
  label: string;
  value: T;
  disabled?: boolean;
  children?: TreeSelectNode<T>[];
};

/** Props for TreeSelect component */
export type TreeSelectProps<T = any> = BoxProps & {
  /** Selected values (single value or array for multi-select) */
  value?: T | T[] | Ref<T | T[] | null> | null;
  /** Tree-structured nodes */
  nodes?: TreeSelectNode<T>[] | Ref<TreeSelectNode<T>[]>;
  /** Placeholder text */
  placeholder?: string | Ref<string>;
  /** Whether the select is disabled */
  disabled?: boolean | Ref<boolean>;
  /** Whether the select is readonly */
  readonly?: boolean | Ref<boolean>;
  /** Enable multi-select with checkboxes */
  multiple?: boolean | Ref<boolean>;
  /** Auto-check children when parent is checked */
  checkChildNodesAuto?: boolean | Ref<boolean>;
  /** Only allow leaf node selection */
  onlyLeafNode?: boolean | Ref<boolean>;
  /** Called when selection changes */
  onChange?: (node: TreeSelectNode<T>, checked: boolean) => void;
};

/** Internal state for TreeSelect */
type TreeSelectState = {
  value: any | any[];
  placeholder: string;
  disabled: boolean;
  readonly: boolean;
  multiple: boolean;
};

/**
 * Creates a TreeSelect component - a tree selector.
 *
 * @param props - TreeSelect props (value, nodes, multiple, onChange, etc.)
 * @param children - Child elements
 * @returns A TimelessElement representing a tree select
 */
export function TreeSelect<T = any>(
  props: TreeSelectProps<T> = {},
  children?: ViewChildren,
): TimelessElement<TreeSelectState> {
  const {
    value = null,
    nodes,
    placeholder = "请选择",
    disabled = false,
    readonly = false,
    multiple = false,
    checkChildNodesAuto = true,
    onlyLeafNode = false,
    onChange,
    ...rest
  } = props;

  let $elm: any = null;
  let box$ = Box(rest, {
    value: null,
    placeholder,
    disabled,
    readonly,
    multiple,
  });

  const state = box$.state as typeof box$.state & TreeSelectState;
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
    subscribe_multiple() {
      if (isRef(multiple)) {
        state.multiple = multiple.value as boolean;
        const unsub = multiple.subscribe({
          onChange(v) {
            state.multiple = v as boolean;
          },
        });
        box$.methods.unsubscribe(unsub);
      } else {
        state.multiple = multiple as boolean;
      }
    },
  };

  methods.subscribe_props();
  methods.subscribe_value();
  methods.subscribe_placeholder();
  methods.subscribe_disabled();
  methods.subscribe_multiple();
  box$.methods.add_event();

  if (children) {
    box$.methods.build_children(children);
  }

  return {
    t: "tree-select",
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

export type TreeSelect = ReturnType<typeof TreeSelect>;
