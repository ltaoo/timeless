import {
  isRef,
  Ref,
  registryGet,
  registrySet,
  computed,
  DerivedRef,
  isWriteableRef,
} from "@timeless/reactive";

import {
  TimelessElement,
  ViewChildren,
  isElement,
  resolve_children,
} from "@/content/type";
import { MountedEvent } from "@/event";
import { Text } from "@/content/text";
import { ListenerManager } from "@/util/listener";
import { Logger } from "@/util/logger";
import { get_owner, run_with_owner } from "@/context/context";

const logger = Logger({ prefix: "primitive", scope: "reactive/for" });

export type ForProps<T> = {
  key?: string;
  each: T[] | DerivedRef<T[]> | Ref<T[]>;
  render: (item: T, idx: DerivedRef<number>) => TimelessElement | null;
  onMounted?: (event: MountedEvent) => void;
  beforeUnmounted?: () => void;
  onUnmounted?: () => void;
};
export type ForState<T> = {
  rendered: boolean;
  subscribed: boolean;
  items: T[];
  wrapped_items: { k: number; v: T }[];
  children: (TimelessElement | null)[];
  idx_arr: DerivedRef<number>[];
};

export function For<T>(
  props: ForProps<T>,
  bus?: Partial<{
    onRefresh: (diff: {
      added: {
        idx: number;
        elements: (TimelessElement<any, any> | null)[];
      }[];
      removed: {
        idx: number;
      }[];
      moved: {
        from: number;
        to: number;
      }[];
    }) => void;
  }>,
) {
  let $elm: any = null;
  const _owner = get_owner();
  const _existing_map = new Map();
  // Track subscription unsubscribers separately for HMR
  const _hmr_subs: (() => void)[] = [];
  let _id = 0;
  const listener$ = ListenerManager();

  const _key = props.key;
  const state: ForState<T> = {
    rendered: false,
    subscribed: false,
    items: [],
    wrapped_items: [] as { k: number; v: T }[],
    children: [],
    idx_arr: [],
  };

  const methods = {
    unique_id() {
      return _id++;
    },
    init_state() {
      const vv = props.each;
      if (!vv) {
        return;
      }
      const items = isRef(vv) ? (vv.value as T[]) : (vv as T[]);
      state.wrapped_items = items.map((item) => ({
        k: methods.unique_id(),
        v: item,
      }));
      state.items = [...items];
    },
    subscribe_props() {
      if (state.subscribed) {
        return;
      }
      state.subscribed = true;
      const vv = props.each;
      if (isRef(vv)) {
        const unsub = vv.subscribe({
          onPatch(action) {
            if (!state.rendered) {
              return;
            }
            console.log(
              "[primitive]For - ctx.onPatch - handle patch",
              action,
              vv.value,
            );
            if (action.type === "insert" && action.items !== undefined) {
              methods.insert(action.index, action.items as T[]);
              return;
            }
            if (action.type === "delete" && action.deleteCount !== undefined) {
              methods.remove(action.index, action.deleteCount);
              return;
            }
            if (
              action.type === "move" &&
              action.from !== undefined &&
              action.to !== undefined
            ) {
              methods.move(action.from, action.to);
              return;
            }
            if (
              action.type === "swap" &&
              action.from !== undefined &&
              action.to !== undefined
            ) {
              methods.swap(action.from, action.to);
              return;
            }
          },
          onChange(v) {
            console.log("[primitive]For - ctx.onChange", v, state.rendered);
            // if (!state.rendered) {
            //   return;
            // }
            methods.refresh(v);
          },
        });
        listener$.add(unsub);
        _hmr_subs.push(unsub);
      }
    },
    // Helper to create a computed index that depends on `each`
    create_idx(origin_item: { k: number; v: T }): DerivedRef<number> {
      return computed(props.each, (t) => {
        const r = state.wrapped_items.indexOf(origin_item);
        // console.log("recompute index when the each is changed", origin_item);
        return r;
      });
    },
    normalize_children(children?: ViewChildren) {
      if (children === null || children === undefined) return [];
      const resolved = resolve_children(children);
      if (!resolved) return [];
      if (Array.isArray(resolved)) {
        return resolved;
      }
      return [resolved];
    },
    build_children() {
      const items = state.wrapped_items;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const idx_computed = methods.create_idx(item);
        const elm = _owner
          ? run_with_owner(_owner, () => props.render(item.v, idx_computed))
          : props.render(item.v, idx_computed);
        state.items[i] = item.v;
        if (isElement(elm)) {
          state.children[i] = elm;
        } else if (isRef(elm)) {
          state.children[i] = Text(elm);
        } else if (elm) {
          state.children[i] = Text(elm);
        } else {
          state.children[i] = null;
        }

        state.idx_arr[i] = idx_computed;
      }
    },
    /** 在指定位置，插入 n 个节点 */
    insert(index: number, items: T[]) {
      console.log("[primitive]for - insert", index, items);
      const inserted_elements: (TimelessElement | null)[] = [];
      const inserted_items: T[] = [];
      const inserted_wrapped_items: { k: number; v: T }[] = [];
      const inserted_idx: DerivedRef<number>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const wrapped_item = { k: methods.unique_id(), v: item };
        const idx = methods.create_idx(wrapped_item);
        console.log(
          "[primitive]for - insert items",
          isRef(props.each) ? props.each.value : props.each,
          item,
          idx.value,
        );
        inserted_wrapped_items.push(wrapped_item);
        inserted_items.push(item);
        inserted_idx.push(idx);
        const child_tmp = _owner
          ? run_with_owner(_owner, () => props.render(item, idx))
          : props.render(item, idx);
        const child = (() => {
          if (isElement(child_tmp)) {
            return child_tmp;
          }
          if (isRef(child_tmp)) {
            return Text(child_tmp);
          }
          if (typeof child_tmp === "function") {
          }
          if (child_tmp) {
            return Text(child_tmp);
          }
          return null;
        })();
        inserted_elements[i] = child;
      }
      state.wrapped_items.splice(index, 0, ...inserted_wrapped_items);
      state.items.splice(index, 0, ...inserted_items);
      state.idx_arr.splice(index, 0, ...inserted_idx);
      state.children.splice(index, 0, ...inserted_elements);
      if ($elm && typeof $elm.insert === "function") {
        $elm.insert(index, inserted_elements);
      }
    },
    /** 从指定下标移除 n 个元素 */
    remove(index: number, count: number) {
      console.log("[primitive]for - remove", index, count, state.idx_arr);
      const removed_idx: DerivedRef<number>[] = [];
      for (let i = 0; i < count; i += 1) {
        const item = state.items[index + i];
        if (_existing_map.has(item)) {
          _existing_map.delete(item);
        }
        console.log(
          "[primitive]for - remove in loop",
          index + i,
          state.idx_arr[index + i],
        );
        removed_idx.push(state.idx_arr[index + i]);
      }
      console.log("[primitive]for - remove before destroy idx", removed_idx);
      for (const idx of removed_idx) {
        idx.destroy();
      }
      state.wrapped_items.splice(index, count);
      state.items.splice(index, count);
      state.idx_arr.splice(index, count);
      state.children.splice(index, count);
      if ($elm && typeof $elm.remove === "function") {
        $elm.remove(index, count);
      }
    },
    /** 将元素从 from 位置移动到 to 位置（splice 语义） */
    move(from: number, to: number) {
      const splice_arr = (arr: any[]) => {
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
      };
      splice_arr(state.items);
      splice_arr(state.wrapped_items);
      splice_arr(state.children);
      splice_arr(state.idx_arr);

      // console.log('[]For move', $elm);
      if ($elm && typeof $elm.move === "function") {
        $elm.move(from, to);
      }

      if (bus?.onRefresh) {
        bus.onRefresh({
          added: [],
          removed: [],
          moved: [{ from, to }],
        });
      }
    },
    /** 交换 indexA 和 indexB 位置的元素 */
    swap(indexA: number, indexB: number) {
      const swap_arr = (arr: any[]) => {
        const tmp = arr[indexA];
        arr[indexA] = arr[indexB];
        arr[indexB] = tmp;
      };
      swap_arr(state.items);
      swap_arr(state.wrapped_items);
      swap_arr(state.children);
      swap_arr(state.idx_arr);

      if ($elm && typeof $elm.swap === "function") {
        $elm.swap(indexA, indexB);
      }
    },
    /**
     * 使用新的列表，覆盖原先的
     * 计算出 新增、更新 和 删除 的记录，提交给宿主层，刷新视图
     */
    refresh(v: T[]) {
      logger.log("refresh", v.length, "items, current:", state.items.length);
      const new_wrapped_items = v.map((item) => {
        const existing = state.wrapped_items.find((vv) => {
          if (_key && typeof item === "object") {
            // @ts-ignore
            if (item[_key] === vv.v[_key]) {
              return true;
            }
          }
          return item === vv.v;
        });
        if (existing) {
          return existing;
        }
        return {
          k: methods.unique_id(),
          v: item,
        };
      });
      const prev_items = state.items;
      const prev_elements = state.children;
      const prev_index_computed = state.idx_arr;
      // 1. Prepare target state
      const new_elements: (TimelessElement | null)[] = new Array(
        new_wrapped_items.length,
      );
      // const new_children: (any | null)[] = new Array(new_items.length);
      // const new_original_items: T[] = new Array(new_items.length);
      const new_index_computed: DerivedRef<number>[] = new Array(
        new_wrapped_items.length,
      );

      // 2. Index old items for O(1) lookup
      const old_map = new Map<any, number[]>();
      prev_items.forEach((item, index) => {
        const k = props.key && item ? (item as any)[props.key] : item;
        let indices = old_map.get(k);
        if (!indices) {
          indices = [];
          old_map.set(k, indices);
        }
        indices.push(index);
      });

      // 3. Diff Phase: Identify operations
      const added_nodes: {
        idx: number;
        elements: (TimelessElement | null)[];
      }[] = [];
      const removed_nodes: { idx: number }[] = [];
      const moved_nodes: { from: number; to: number }[] = [];
      let _add_start = -1;

      // Iterate new items -> Determine Reused vs Added
      for (let i = 0; i < new_wrapped_items.length; i++) {
        const new_item = new_wrapped_items[i];
        const k =
          _key && new_item
            ? // @ts-ignore
              new_item.v[_key]
            : new_item.v;
        const prev_indices = old_map.get(k);
        if (prev_indices && prev_indices.length > 0) {
          // Reused - same key found in old list
          _add_start = -1;
          const old_idx = prev_indices.shift()!;
          const prev_item = prev_items[old_idx];
          // Reuse existing DOM element and computed index
          new_elements[i] = prev_elements[old_idx];
          // new_children[i] = prev_children[old_idx];
          // new_original_items[i] = prev_original_items[old_idx];
          new_index_computed[i] = prev_index_computed[old_idx];
          // Track moved items only for swaps/reorders, not insertions/deletions
          // Expected position = old_idx + insertions_before
          // Insertions shift positions naturally; reorder means actual != expected
          let insertions_before = 0;
          for (let j = 0; j < i; j++) {
            const new_j = new_wrapped_items[j];
            const k_j =
              _key && new_j
                ? // @ts-ignore
                  new_j.v[_key]
                : new_j.v;
            if (!old_map.has(k_j)) {
              insertions_before++;
            }
          }
          const expected_new_idx = old_idx + insertions_before;
          if (i !== expected_new_idx) {
            moved_nodes.push({ from: old_idx, to: i });
          }
          // No need to manually update index - computed auto-recomputes based on `each`
          // If item data changed, update the reactive proxy so computed values re-evaluate
          if (
            new_item.v !== prev_item &&
            prev_item &&
            typeof prev_item === "object"
          ) {
            const proxy = registryGet(prev_item);
            if (proxy && isWriteableRef(proxy)) {
              proxy.as(new_item.v);
              // Update registry to map new item to the same proxy
              registrySet(new_item.v, proxy);
            }
          }
        } else {
          // Added (New) - create new computed index and render
          if (_add_start === -1) {
            _add_start = i;
            added_nodes.push({ idx: i, elements: [] });
          }
          const idx_computed = methods.create_idx(new_item);
          new_index_computed[i] = idx_computed;
          const res = _owner
            ? run_with_owner(_owner, () =>
                props.render(new_item.v, idx_computed),
              )
            : props.render(new_item.v, idx_computed);
          new_elements[i] = res;
          added_nodes[added_nodes.length - 1].elements.push(res);
        }
      }

      // Remaining items in old_map are Removed
      for (const indices of old_map.values()) {
        for (const index of indices) {
          removed_nodes.push({ idx: index });
        }
      }
      console.log(
        "[primitive]for removed:",
        removed_nodes.length,
        "added:",
        added_nodes.length,
        "moved:",
        moved_nodes.length,
      );

      // Destroy idx_computed for removed items
      for (const { idx } of removed_nodes) {
        if (prev_index_computed[idx]) {
          prev_index_computed[idx].destroy();
        }
      }

      const diff = {
        children: new_elements,
        added: added_nodes,
        removed: removed_nodes,
        moved: moved_nodes,
      };

      // 4. Patch Phase: Apply to DOM

      if (bus?.onRefresh) {
        bus.onRefresh(diff);
      }
      // 4.1 Remove nodes
      if ($elm && typeof $elm.refresh === "function") {
        $elm.refresh(diff);
      }
      // 4.2 Trigger Lifecycle (Unmounted) for removed elements
      // for (const { idx } of removed_nodes) {
      //   const element = prev_elements[idx];
      //   if (element && isElement(element)) {
      //     if (element.beforeUnmounted) {
      //       element.beforeUnmounted();
      //     }
      //     if (element.onUnmounted) {
      //       element.onUnmounted();
      //     }
      //   }
      // }

      // 4.3 Trigger Lifecycle (Mounted) for newly added elements
      // for (const { element } of added_nodes) {
      //   if (element && isElement(element) && element.onMounted) {
      //     element.onMounted({ target: element.$elm });
      //   }
      // }

      // 5. Update State
      // Use slice() to create a copy, preventing _values from referencing _local_value directly
      // This ensures prev_items reflects the state before reverse/sort operations
      state.wrapped_items = new_wrapped_items.slice();
      state.items = new_wrapped_items.slice().map((item) => item.v);
      state.idx_arr = new_index_computed;
      state.children = new_elements;

      return diff;
    },
  };

  methods.init_state();
  methods.subscribe_props();
  methods.build_children();

  return {
    t: "for",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state: {
      items: state.items,
    },
    get children() {
      return [...state.children];
    },
    onMounted(event: MountedEvent) {
      // logger.log("onMounted", state.children);
      methods.subscribe_props();
      state.rendered = true;
      if (props.onMounted) {
        listener$.add(props.onMounted(event));
      }
      for (const child of state.children) {
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
    },
    onUnmounted() {
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      listener$.destroy();
      for (let i = 0; i < state.idx_arr.length; i += 1) {
        const v = state.idx_arr[i];
        if (v) {
          v.destroy();
        }
      }
      state.rendered = false;
      state.subscribed = false;
      // state.items = [];
      // state.wrapped_items = [];
      state.idx_arr = [];
      // state.children = [];
    },
    _hmr_dispose() {
      _hmr_subs.forEach((fn) => fn());
      _hmr_subs.length = 0;
    },
  };
}
