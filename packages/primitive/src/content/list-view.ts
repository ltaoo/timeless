/**
 * ListView - A scrollable list container component.
 *
 * ListView is designed for rendering lists of items with virtual scrolling.
 * It supports:
 * - Child element rendering
 * - Reactive style/class updates
 * - Full event handling (click, drag, keyboard)
 * - Hydration for SSR/SSG
 *
 * This is the main scrollable container used in Timeless apps.
 *
 * @example
 * ```tsx
 * <ListView
 *   style={{ height: 300 }}
 *   onScroll={(e) => console.log('scroll', e)}
 * >
 *   {items.map(item => <Text>{item}</Text>)}
 * </ListView>
 * ```
 */
import { remove_arr_item, throttle } from "@timeless/base";
import {
  computed,
  DerivedRef,
  isRef,
  isWriteableRef,
  registryGet,
  registrySet,
} from "@timeless/reactive";

import { MountedEvent, ScrollEvent } from "@/event/index";
import { For, ForProps } from "@/reactive/for";
import { Logger } from "@/util/logger";

import {
  isElement,
  resolve_children,
  TimelessElement,
  ViewChildren,
} from "./type";
import { Box, BoxEvents, BoxProps } from "./box";
import { View } from "./view";
import { get_owner, run_with_owner } from "@/context/context";
import { ListenerManager } from "@/util/listener";
import { Text } from "./text";

const logger = Logger({ prefix: "primitive", scope: "list-view" });

type WrappedItemInListView<T> = {
  k: number;
  v: T;
  top: number;
  height: number;
};
/** Props for ListView component */
export type ListViewProps<T> = BoxProps &
  ForProps<T> & {
    size: number;
    buffer?: number;
    itemHeight: number;
    gutter?: number;
    onScroll?: (event: {}) => void;
    onReachBottom?: () => void;
  };
type ListViewState<T> = {
  height: number;
  clientHeight: number;
  offsetTop: number;
  scrollTop: number;
  subscribed: boolean;
  items: T[];
  wrapped_items: WrappedItemInListView<T>[];
  children: (TimelessElement | null)[];
  idx_arr: DerivedRef<number>[];
};
type ListViewEvents = BoxEvents & {
  onScroll?: (event: ScrollEvent) => void;
};

export function ListView<T>(props: ListViewProps<T>) {
  const {
    itemHeight,
    gutter = 0,
    size,
    buffer = 10,
    key,
    each,
    render,
    onScroll,
    onReachBottom,
    ...rest
  } = props;

  let $elm: any = null;
  // let _dirty_from = Infinity;
  /** 固定槽位池 */
  let _slots: View[] = [];
  /** 数据 dataId → 绑定的槽位 */
  let _slot_bindings = new Map<string, View>();
  /** 空闲槽位池 */
  let _free_slots: View[] = [];
  /** 渲染的列表 */
  let _children: (TimelessElement | null)[] = [];
  /** 默认显示的数量 */
  let _size = size ?? 4;
  /** 缓冲的数量 */
  let _buffer_size = buffer ?? 10;
  /** 每个元素和下面元素的距离 */
  let _gutter = gutter ?? 0;
  let _scroll = { scrollTop: 0 };
  let _start = 0;
  let _end = _size + _buffer_size;
  /** 标记从哪个下标开始 top 需要重算，Infinity 表示干净 */
  let _dirty_from = Infinity;
  const _owner = get_owner();
  const _existing_map = new Map();
  // Track subscription unsubscribers separately for HMR
  const _hmr_subs: (() => void)[] = [];
  let _id = 0;
  const listener$ = ListenerManager();

  const _key = props.key;

  const box$ = Box<ListViewState<T>>(rest, {
    height: 0,
    clientHeight: 0,
    offsetTop: 0,
    scrollTop: 0,
    subscribed: false,
    items: [],
    wrapped_items: [] as WrappedItemInListView<T>[],
    children: [],
    idx_arr: [],
  });
  // const for$ = For({ key, each, render });

  const state = box$.state;
  const events: ListViewEvents = box$.events;
  // _children = for$.state.items;
  // let children = for$.children;

  const methods = {
    unique_id() {
      return _id++;
    },
    ready() {
      const vv = props.each;
      if (!vv) {
        return;
      }
      const items = isRef(vv) ? (vv.value as T[]) : (vv as T[]);
      state.wrapped_items = items.map((item, i) => ({
        k: methods.unique_id(),
        v: item,
        height: itemHeight,
        top: i * itemHeight + gutter,
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
            logger.log("ctx.onPatch - handle patch", action, vv.value);
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
            logger.log("ctx.onChange", v, state.rendered);
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
    create_idx(origin_item: WrappedItemInListView<T>): DerivedRef<number> {
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
    build_children(range: { start: number; end: number }) {
      const wrapped_items = state.wrapped_items.slice(range.start, range.end);
      for (let i = 0; i < wrapped_items.length; i += 1) {
        const wrapped_item = wrapped_items[i];
        const idx_computed = methods.create_idx(wrapped_item);
        const elm = _owner
          ? run_with_owner(_owner, () =>
              props.render(wrapped_item.v, idx_computed),
            )
          : props.render(wrapped_item.v, idx_computed);
        state.items[i] = wrapped_item.v;
        const top =
          (range.start + i) * itemHeight + (range.start + i - 1) * _gutter;
        if (isElement(elm)) {
          const item$ = View(
            {
              dataset: {
                id: wrapped_item.k,
              },
              style: {
                position: "absolute",
                top: `${top}px`,
              },
            },
            [elm],
          );
          state.children[i] = item$;
        } else if (isRef(elm)) {
          const item$ = View(
            {
              style: {
                position: "absolute",
                top: `${top}px`,
              },
            },
            [Text(elm)],
          );
          state.children[i] = item$;
        } else if (elm) {
          const item$ = View(
            {
              style: {
                position: "absolute",
                top: `${top}px`,
              },
            },
            [Text(elm)],
          );
          state.children[i] = item$;
        } else {
          state.children[i] = null;
        }
        state.idx_arr[i] = idx_computed;
      }
    },
    /** 在指定位置，插入 n 个节点 */
    insert(index: number, items: T[]) {
      logger.log("insert - start", index, items);
      const inserted_elements: (TimelessElement | null)[] = [];
      const inserted_items: T[] = [];
      const inserted_wrapped_items: WrappedItemInListView<T>[] = [];
      const inserted_idx: DerivedRef<number>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const wrapped_item = {
          k: methods.unique_id(),
          v: item,
          top: i * itemHeight + gutter,
          height: itemHeight,
        };
        const idx = methods.create_idx(wrapped_item);
        // logger.log(
        //   "insert items",
        //   isRef(props.each) ? props.each.value : props.each,
        //   item,
        //   idx.value,
        // );
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
      const new_wrapped_items = v.map((item, i) => {
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
          top: i * itemHeight + gutter,
          height: itemHeight,
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
      console.log(
        "[primitive]for removed:",
        removed_nodes,
        "added:",
        added_nodes.length,
        "moved:",
        moved_nodes,
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

      const actions_count =
        diff.added.length + diff.removed.length + diff.moved.length;
      if (actions_count === 0) {
        return;
      }
      // 4.1 Remove nodes
      if ($elm && typeof $elm.refresh === "function") {
        $elm.refresh(diff);
      }
      state.wrapped_items = new_wrapped_items.slice();
      state.items = new_wrapped_items.slice().map((item) => item.v);
      state.idx_arr = new_index_computed;
      state.children = new_elements;

      return diff;
    },
    compute_visible_children() {
      // children = children.slice(0, 10);
    },
    setHeight(h: number) {
      state.height = h;
    },
    addHeight(h: number) {
      const height = state.height + h;
      methods.setHeight(height);
    },
    setClientHeight(v: number) {
      state.clientHeight = v;
    },
    _dataIdStr(dataId: number | string): string {
      return String(dataId);
    },
    /** 同步已绑定槽位的 top 值 */
    _syncBoundSlotTops() {
      // for (const [key, slot] of _slot_bindings) {
      //   if (!slot.state.bound) continue;
      //   const dataCell = _children.find((v) => {
      //     const did = (v.state as any).id ?? v.uid;
      //     return methods._dataIdStr(did) === key;
      //   });
      //   if (dataCell) {
      //     slot.methods.setTop(dataCell.state.top);
      //   }
      // }
    },
    /**
     * 从 _dirty_from 开始批量重算 top，一次 O(n) 完成
     */
    recomputeTops() {
      // if (_dirty_from >= _children.length) {
      //   _dirty_from = Infinity;
      //   return;
      // }
      // const from = Math.max(0, _dirty_from);
      // for (let i = from; i < _children.length; i++) {
      //   const $item = _children[i];
      //   const $prev = _children[i - 1];
      //   const newTop = $prev
      //     ? $prev.state.top + $prev.state.height + _gutter
      //     : 0;
      //   // $item.methods.setTop(newTop);
      // }
      // _dirty_from = Infinity;
      // // 同步已绑定槽位的 top
      // methods._syncBoundSlotTops();
    },
    /**
     * 放置一个 item 到列中
     */
    appendItem($item: View) {
      // $item.onHeightChange(([original_height, height_difference]) => {
      //   const dataId = ($item.state as any).id ?? $item.uid;
      //   // 找到绑定了此数据的槽位，同步高度
      //   const boundSlot = _slot_bindings.get(methods._dataIdStr(dataId));
      //   if (boundSlot) {
      //     // 槽位高度跟随数据 Cell
      //     // 不需要额外操作，rebind 时会同步
      //   }
      //   const idx = _children.findIndex((v) => v === $item);
      //   if (idx !== -1) {
      //     _dirty_from = Math.min(_dirty_from, idx + 1);
      //   }
      //   console.log(
      //     "[DOMAIN]appendItem - after this.height += heightDiff",
      //     "加载完成，发现高度差异为",
      //     [$item.uid, idx],
      //     [original_height, height_difference],
      //   );
      //   state.height += height_difference;
      //   // bus.emit(Events.HeightChange, _height);
      //   // methods.refresh();
      // });
      // $item.onTopChange(() => {
      //   // 同步绑定的槽位 top
      //   const dataId = ($item.state as any).id ?? $item.uid;
      //   const boundSlot = _slot_bindings.get(methods._dataIdStr(dataId));
      //   if (boundSlot) {
      //     boundSlot.methods.setTop($item.state.top);
      //   }
      // });
      // const idx = _children.length;
      // $item.methods.setColumnIdx(_index);
      // _height += $item.state.height + (_children.length > 0 ? _gutter : 0);
      // _children.push($item);
      // const $prev = _children[idx - 1];
      // if ($prev) {
      //   $item.methods.setTop($prev.state.top + $prev.state.height + _gutter);
      // }
      // // 如果新 item 落入当前可见范围，绑定到空闲槽位
      // if (idx >= _start && idx < _end && _free_slots.length > 0) {
      //   const slot = _free_slots.pop()!;
      //   const dataId = ($item.state as any).id ?? $item.uid;
      //   slot.methods.rebind({
      //     payload: $item.state.payload,
      //     uid: $item.uid,
      //     dataId,
      //     top: $item.state.top,
      //     height: $item.state.height,
      //   });
      //   _slot_bindings.set(methods._dataIdStr(dataId), slot);
      // }
      // bus.emit(Events.HeightChange, _height);
    },
    /**
     * 往顶部插入一个 item 到列中
     */
    unshiftItem($item: View, opt: Partial<{ skipUpdateHeight: boolean }> = {}) {
      // $item.onHeightChange(([original_height, height_difference]) => {
      //   state.height += height_difference;
      //   const idx = _children.findIndex((v) => v === $item);
      //   if (idx !== -1) {
      //     _dirty_from = Math.min(_dirty_from, idx + 1);
      //   }
      // });
      // $item.onTopChange(() => {
      //   const dataId = ($item.state as any).id ?? $item.uid;
      //   const boundSlot = _slot_bindings.get(methods._dataIdStr(dataId));
      //   if (boundSlot) {
      //     boundSlot.methods.setTop($item.state.top);
      //   }
      // });
      // // $item.methods.setColumnIdx(_index);
      // state.height += $item.height + (_children.length > 0 ? _gutter : 0);
      // _children.unshift($item);
      // // 新 item 插入到头部，从 index 1 开始所有 top 都需要重算
      // _dirty_from = Math.min(_dirty_from, 1);
      // methods.recomputeTops();
      // // 重新计算可见范围并 rebind
      // methods.update({
      //   start: _start,
      //   end: Math.min(_start + _size + _buffer_size, _children.length),
      // });
      // bus.emit(Events.HeightChange, _height);
      // methods.refresh();
    },
    findItemById(id: number) {
      // return _children.find((v) => (v.state as any).id === id);
    },
    // deleteCell($item: ) {
    //   const dataId = ($item.state as any).id ?? $item.uid;
    //   const idx = _children.findIndex((v) => v === $item);
    //   if (idx === -1) {
    //     return;
    //   }
    //   // 如果被删除的 Cell 当前绑定了某个槽位，先 unbind
    //   const boundSlot = _slot_bindings.get(methods._dataIdStr(dataId));
    //   if (boundSlot) {
    //     boundSlot.methods.unbind();
    //     _slot_bindings.delete(methods._dataIdStr(dataId));
    //     _free_slots.push(boundSlot);
    //   }
    //   const height_difference =
    //     $item.height + (_children.length > 1 ? _gutter : 0);
    //   state.height -= height_difference;
    //   _children = remove_arr_item(_children, idx);
    //   // 删除后，从该位置开始所有后续 item 的 top 需要重算
    //   _dirty_from = Math.min(_dirty_from, idx);
    //   methods.recomputeTops();
    //   // 重新计算可见范围并 rebind 替补 Cell
    //   const range = methods.calcVisibleRange(_scroll.scrollTop);
    //   methods.update(range);
    //   // methods.refresh();
    // },
    clean() {
      // unbind 所有槽位
      // for (const [key, slot] of _slot_bindings) {
      //   slot.methods.unbind();
      //   _free_slots.push(slot);
      // }
      _slot_bindings.clear();
      _children = [];
      state.height = 0;
      _dirty_from = Infinity;
      _start = 0;
      _end = _size + _buffer_size;
      // bus.emit(Events.StateChange, { ..._state });
    },
    resetRange() {
      _start = 0;
      _end = _size + _buffer_size;
      // 重新计算范围并 rebind 所有槽位
      const range = {
        start: _start,
        end: Math.min(_end, _children.length),
      };
      methods.update(range);
      // methods.refresh();
    },
    calcVisibleRange(scroll_top: number) {
      // 先批量重算脏区间的 top，保证二分查找数据正确
      // methods.recomputeTops();
      logger.log("calcVisibleRange - start", scroll_top, _start, _end);
      let start = _start;
      let end = _end;
      // 二分查找，快速定位第一个 top >= scroll_top 的元素
      (() => {
        const len = state.wrapped_items.length;
        if (len === 0) {
          return;
        }
        let lo = 0;
        let hi = len - 1;
        let found = len; // 默认值：没找到则指向末尾之后
        while (lo <= hi) {
          const mid = (lo + hi) >>> 1;
          if (state.wrapped_items[mid].top >= scroll_top) {
            found = mid;
            hi = mid - 1;
          } else {
            lo = mid + 1;
          }
        }
        const baseStart = Math.min(len - 1, Math.max(0, found - 1));
        start = Math.max(0, baseStart - _buffer_size);
        end = Math.min(baseStart + _size + _buffer_size, len);
      })();
      logger.log(
        "calcVisibleRange - before Math.max",
        [start, start - _buffer_size],
        [end, _children.length],
      );
      const result = {
        start,
        end,
      };
      return result;
    },
    update(range: { start: number; end: number }) {
      logger.log("update case range is changed", range);

      const has_change = range.start !== _start || range.end !== _end;
      if (!has_change) {
        return;
      }

      // 先假设是慢慢滚动的场景，上面的内容被移除，下面的内容被添加
      const removed_count = Math.abs(range.start - _start);
      const inserted_count = Math.abs(range.end - _end);

      logger.log(
        "update - removed and inserted count",
        removed_count,
        inserted_count,
      );

      const inserted_elements = (() => {
        const items = state.items.slice(_end, _end + inserted_count);
        logger.log("sliced items count is", items.length);
        const result: (TimelessElement | null)[] = [];
        for (let i = 0; i < items.length; i += 1) {
          const item = items[i];
          const existing_idx = state.wrapped_items.findIndex(
            (wi) => wi.v === item,
          );
          const wrapped_item =
            existing_idx !== -1
              ? state.wrapped_items[existing_idx]
              : {
                  k: methods.unique_id(),
                  v: item,
                  top: i * itemHeight + (i - 1) * gutter,
                  height: itemHeight,
                };
          const idx =
            existing_idx !== -1
              ? state.idx_arr[existing_idx]
              : methods.create_idx(wrapped_item);
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
            if (child_tmp) {
              return Text(child_tmp);
            }
            return null;
          })();
          const top = (_end + i) * itemHeight;
          result[i] = View(
            {
              dataset: {
                id: wrapped_item.k,
              },
              style: {
                position: "absolute",
                top: `${top}px`,
              },
            },
            child,
          );
        }
        return result;
      })();

      if (range.start > _start) {
        $elm.insert(_end, inserted_elements);
      } else {
        $elm.insert(range.start, inserted_elements);
      }
      if (range.end > _end) {
        $elm.remove(0, removed_count);
      } else {
        $elm.remove(range.end, removed_count);
      }

      _start = range.start;
      _end = range.end;

      // const new_children = state.wrapped_items.slice(range.start, range.end);
      // if (new_children.length === 0 && _children.length === 0) {
      //   return;
      // }

      // methods.build_children(range);

      // 构建新数据 Cell 的 dataId Set
      // const newDataIdSet = new Set<string>();
      // for (const cell of new_cells) {
      //   const dataId = (cell.state as any).id ?? cell.uid;
      //   newDataIdSet.add(methods._dataIdStr(dataId));
      // }

      // 计算 exitingCells（当前绑定但不在 newDataCells 中的）
      // const exitingKeys: string[] = [];
      // for (const [key, slot] of _slot_bindings) {
      //   if (!newDataIdSet.has(key)) {
      //     exitingKeys.push(key);
      //   }
      // }

      // // 对 exitingCells: slot.unbind()，归还到 _freeSlots
      // for (const key of exitingKeys) {
      //   const slot = _slot_bindings.get(key)!;
      //   slot.methods.unbind();
      //   _slot_bindings.delete(key);
      //   _free_slots.push(slot);
      // }

      // // 计算 enteringCells（在 newDataCells 中但当前未绑定的）
      // for (const cell of new_cells) {
      //   const dataId = (cell.state as any).id ?? cell.uid;
      //   const key = methods._dataIdStr(dataId);
      //   if (!_slot_bindings.has(key)) {
      //     // 从 _freeSlots 取槽位
      //     if (_free_slots.length > 0) {
      //       const slot = _free_slots.pop()!;
      //       slot.methods.rebind({
      //         payload: cell.state.payload,
      //         uid: cell.uid,
      //         dataId,
      //         top: cell.state.top,
      //         height: cell.state.height,
      //       });
      //       _slot_bindings.set(key, slot);
      //     }
      //   } else {
      //     // stayingCells — 仅更新 top/height
      //     const slot = _slot_bindings.get(key)!;
      //     slot.methods.setTop(cell.state.top);
      //   }
      // }

      // methods.refresh();
    },
    handleScrollForce(event: ScrollEvent) {
      const { scrollTop } = event;
      if (onScroll) {
        onScroll(event);
      }
      _scroll = {
        scrollTop: event.scrollTop,
      };
      if (_scroll.scrollTop < 0) {
        return;
      }
      const range = methods.calcVisibleRange(scrollTop);
      const update = (() => {
        if (scrollTop === 0) {
          return true;
        }
        if (range.start !== _start || range.end !== _end) {
          return true;
        }
        return false;
      })();
      logger.log("before if (!update", update, scrollTop, range);
      if (!update) {
        return;
      }
      methods.update(range);
    },
    handleScroll: throttle(800, (event) => {
      methods.handleScrollForce(event);
    }),
  };

  methods.ready();
  methods.subscribe_props();
  methods.build_children({ start: 0, end: size + buffer });
  // methods.compute_visible_children();
  box$.methods.subscribe_props();
  box$.methods.add_event();
  const children = state.children;

  state.height =
    state.wrapped_items.length * itemHeight +
    (state.wrapped_items.length - 1) * gutter;

  events.onScroll = methods.handleScroll;

  return {
    t: "list-view",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state,
    events,
    children,
    onMounted(event: MountedEvent) {
      // console.log("the view mounted", event.target);
      if (props.onMounted) {
        props.onMounted(event);
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const child = state.children[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
    },
    beforeUnmounted() {
      if (props.beforeUnmounted) {
        props.beforeUnmounted();
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node) && node.beforeUnmounted) {
          node.beforeUnmounted();
        }
      }
    },
    onUnmounted() {
      // console.log(
      //   "[View] onUnmounted called, children count:",
      //   _children.length,
      // );
      if (props.onUnmounted) {
        // console.log("[View] calling props.onUnmounted");
        props.onUnmounted();
      }
      // listener$.destroy();
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node)) {
          node.onUnmounted();
        }
      }
      state.rendered = false;
      $elm = null;
    },
  };
}
