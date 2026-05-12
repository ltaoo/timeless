import {
  isRef,
  Ref,
  registryGet,
  registrySet,
  registryDelete,
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
import {
  get_owner,
  create_owner,
  run_with_owner,
  dispose_owner,
} from "@/context/context";

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
  item_owners: any[];
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
    item_owners: [],
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
            // console.log(
            //   "[primitive]For - ctx.onPatch - handle patch",
            //   action,
            //   vv.value,
            // );
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
            // console.log("[primitive]For - ctx.onChange", v, state.rendered);
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
        // Create per-item owner for tracking render-created refs
        const item_owner = create_owner(_owner);
        const elm = run_with_owner(item_owner, () =>
          props.render(item.v, idx_computed),
        );
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
        state.item_owners[i] = item_owner;
      }
    },
    /** 在指定位置，插入 n 个节点 */
    insert(index: number, items: T[]) {
      // console.log("[primitive]for - insert", index, items);
      const inserted_elements: (TimelessElement | null)[] = [];
      const inserted_items: T[] = [];
      const inserted_wrapped_items: { k: number; v: T }[] = [];
      const inserted_idx: DerivedRef<number>[] = [];
      const inserted_owners: any[] = [];

      // Build wrapped items and insert into state first,
      // so create_idx can find them via indexOf
      for (let i = 0; i < items.length; i++) {
        inserted_wrapped_items.push({ k: methods.unique_id(), v: items[i] });
        inserted_items.push(items[i]);
      }
      state.wrapped_items.splice(index, 0, ...inserted_wrapped_items);
      state.items.splice(index, 0, ...inserted_items);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const wrapped_item = inserted_wrapped_items[i];
        const idx = methods.create_idx(wrapped_item);
        // Create per-item owner for tracking render-created refs
        const item_owner = create_owner(_owner);
        inserted_idx.push(idx);
        inserted_owners.push(item_owner);
        const child_tmp = run_with_owner(item_owner, () =>
          props.render(item, idx),
        );
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
      state.idx_arr.splice(index, 0, ...inserted_idx);
      state.children.splice(index, 0, ...inserted_elements);
      state.item_owners.splice(index, 0, ...inserted_owners);
      if ($elm && typeof $elm.insert === "function") {
        $elm.insert(index, inserted_elements);
      }
    },
    /** 从指定下标移除 n 个元素 */
    remove(index: number, count: number) {
      // console.log("[primitive]for - remove", index, count, state.idx_arr);
      const removed_idx: DerivedRef<number>[] = [];
      const removed_owners: any[] = [];
      for (let i = 0; i < count; i += 1) {
        const item = state.items[index + i];
        if (_existing_map.has(item)) {
          _existing_map.delete(item);
        }
        // console.log(
        //   "[primitive]for - remove in loop",
        //   index + i,
        //   state.idx_arr[index + i],
        // );
        removed_idx.push(state.idx_arr[index + i]);
        removed_owners.push(state.item_owners[index + i]);
      }
      // console.log("[primitive]for - remove before destroy idx", removed_idx);
      for (const idx of removed_idx) {
        idx.destroy();
      }
      // Dispose per-item owners (cleans up render-created refs)
      for (const owner of removed_owners) {
        if (owner) dispose_owner(owner);
      }
      // Clean up stale registry entries for removed items
      for (let i = 0; i < count; i += 1) {
        const item = state.items[index + i];
        if (item && typeof item === "object") {
          registryDelete(item);
        }
      }
      state.wrapped_items.splice(index, count);
      state.items.splice(index, count);
      state.idx_arr.splice(index, count);
      state.children.splice(index, count);
      state.item_owners.splice(index, count);
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
      splice_arr(state.item_owners);

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
      swap_arr(state.item_owners);

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
            const _item = item as Record<string, unknown>;
            const _vv = vv as { v: Record<string, unknown> };
            if (_item[_key] === _vv.v[_key]) {
              return true;
            }
          }
          return item === vv.v;
        });
        if (existing) {
          logger.log("diff existing object", item);
          registryGet(existing.v)?.diff(item);
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
      const prev_item_owners = state.item_owners;
      // 1. Prepare target state
      const new_elements: (TimelessElement | null)[] = new Array(
        new_wrapped_items.length,
      );
      // const new_children: (any | null)[] = new Array(new_items.length);
      // const new_original_items: T[] = new Array(new_items.length);
      const new_index_computed: DerivedRef<number>[] = new Array(
        new_wrapped_items.length,
      );
      const new_item_owners: any[] = new Array(new_wrapped_items.length);

      // 2. Index old items for O(1) lookup
      const old_map = new Map<any, number[]>();
      prev_items.forEach((item, index) => {
        const k = _key && item ? (item as any)[_key] : item;
        let indices = old_map.get(k);
        if (!indices) {
          indices = [];
          old_map.set(k, indices);
        }
        indices.push(index);
      });

      // Pre-compute prefix sums for accurate move detection.
      // A position shift caused purely by removals/insertions is not a "move".
      // Formula: expected_new_idx = old_idx - deletions_before_old_idx + insertions_before_new_idx
      const new_key_set = new Set<any>();
      for (const item of new_wrapped_items) {
        const k =
          _key && item
            ? (item as { v: Record<string, unknown> }).v[_key]
            : item.v;
        new_key_set.add(k);
      }
      // removed_old_prefix[i] = number of old items at indices [0, i) that are NOT in new array
      const removed_old_prefix: number[] = new Array(
        prev_items.length + 1,
      ).fill(0);
      for (let i = 0; i < prev_items.length; i++) {
        const item = prev_items[i];
        const k = _key && item ? (item as any)[_key] : item;
        removed_old_prefix[i + 1] =
          removed_old_prefix[i] + (new_key_set.has(k) ? 0 : 1);
      }
      const old_key_set = new Set<any>();
      for (const item of prev_items) {
        const k = _key && item ? (item as any)[_key] : item;
        old_key_set.add(k);
      }
      // insertion_new_prefix[i] = number of new items at indices [0, i) that are NOT in old array
      const insertion_new_prefix: number[] = new Array(
        new_wrapped_items.length + 1,
      ).fill(0);
      for (let i = 0; i < new_wrapped_items.length; i++) {
        const item = new_wrapped_items[i];
        const k =
          _key && item
            ? (item as { v: Record<string, unknown> }).v[_key]
            : item.v;
        insertion_new_prefix[i + 1] =
          insertion_new_prefix[i] + (old_key_set.has(k) ? 0 : 1);
      }

      // 3. Diff Phase: Identify operations
      const added_nodes: {
        idx: number;
        elements: (TimelessElement | null)[];
      }[] = [];
      const removed_nodes: { idx: number; count: number }[] = [];
      const moved_nodes: { from: number; to: number }[] = [];
      let _add_start = -1;

      // Iterate new items -> Determine Reused vs Added
      // Update wrapped_items before rendering so create_idx can find new items
      state.wrapped_items = new_wrapped_items;
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
          // Reuse existing DOM element, computed index, and owner
          new_elements[i] = prev_elements[old_idx];
          new_index_computed[i] = prev_index_computed[old_idx];
          new_item_owners[i] = prev_item_owners[old_idx];
          // Track moved items only for true reorders, not position shifts caused
          // by removals or insertions.
          // expected = old_idx - (removed old items before old_idx) + (inserted new items before new_idx i)
          const deletions_before = removed_old_prefix[old_idx];
          const insertions_before = insertion_new_prefix[i];
          const expected_new_idx =
            old_idx - deletions_before + insertions_before;
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
              // Clean up stale registry entry for old raw object
              if (prev_item !== new_item.v) {
                registryDelete(prev_item);
              }
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
          // Create per-item owner for tracking render-created refs
          const item_owner = create_owner(_owner);
          new_item_owners[i] = item_owner;
          const res = run_with_owner(item_owner, () =>
            props.render(new_item.v, idx_computed),
          );
          new_elements[i] = res;
          added_nodes[added_nodes.length - 1].elements.push(res);
        }
      }

      // Remaining items in old_map are Removed - merge consecutive indices
      const sorted_removed_indices: number[] = [];
      for (const indices of old_map.values()) {
        for (const index of indices) {
          sorted_removed_indices.push(index);
        }
      }
      sorted_removed_indices.sort((a, b) => a - b);

      let start = -1;
      let count = 0;
      for (let i = 0; i < sorted_removed_indices.length; i++) {
        if (start === -1) {
          start = sorted_removed_indices[i];
          count = 1;
        } else if (sorted_removed_indices[i] === start + count) {
          count++;
        } else {
          removed_nodes.push({ idx: start, count });
          start = sorted_removed_indices[i];
          count = 1;
        }
      }
      if (start !== -1) {
        removed_nodes.push({ idx: start, count });
      }
      // console.log(
      //   "[primitive]for removed:",
      //   removed_nodes,
      //   "added:",
      //   added_nodes.length,
      //   "moved:",
      //   moved_nodes,
      // );

      // Destroy idx_computed and dispose owners for removed items
      for (const { idx, count } of removed_nodes) {
        for (let i = 0; i < count; i++) {
          if (prev_index_computed[idx + i]) {
            prev_index_computed[idx + i].destroy();
          }
          if (prev_item_owners[idx + i]) {
            dispose_owner(prev_item_owners[idx + i]);
          }
          // Clean up stale registry entry
          const removed_item = prev_items[idx + i];
          if (removed_item && typeof removed_item === "object") {
            registryDelete(removed_item);
          }
        }
      }

      const diff = {
        children: new_elements,
        added: added_nodes,
        removed: removed_nodes,
        moved: moved_nodes,
      };

      const actions_count =
        diff.added.length + diff.removed.length + diff.moved.length;
      if (actions_count === 0) {
        return;
      }
      // 4. Patch Phase: Apply to DOM

      if (bus?.onRefresh) {
        bus.onRefresh(diff);
      }
      // 4.1 Remove nodes
      if ($elm && typeof $elm.refresh === "function") {
        $elm.refresh(diff);
      }
      state.wrapped_items = new_wrapped_items.slice();
      state.items = new_wrapped_items.slice().map((item) => item.v);
      state.idx_arr = new_index_computed;
      state.children = new_elements;
      state.item_owners = new_item_owners;

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
      // Dispose all per-item owners (cleans up render-created refs)
      for (let i = 0; i < state.item_owners.length; i += 1) {
        const owner = state.item_owners[i];
        if (owner) {
          dispose_owner(owner);
        }
      }
      state.rendered = false;
      state.subscribed = false;
      state.items = [];
      state.wrapped_items = [];
      state.idx_arr = [];
      state.item_owners = [];
      state.children = [];
    },
    _hmr_dispose() {
      _hmr_subs.forEach((fn) => fn());
      _hmr_subs.length = 0;
    },
  };
}
