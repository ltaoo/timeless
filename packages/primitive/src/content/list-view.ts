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
 */
import { throttle } from "@timeless/inner-base";
import {
  computed,
  DerivedRef,
  isRef,
  isWriteableRef,
  registryGet,
  registrySet,
  registryDelete,
} from "@timeless/inner-reactive";

import { MountedEvent, ScrollEvent } from "@/event/index";
import { For, ForProps } from "@/reactive/for";
import {
  create_owner,
  get_owner,
  run_with_owner,
  dispose_owner,
} from "@/context/context";
import { ListenerManager } from "@/util/listener";
import { Logger } from "@/util/logger";

import {
  isElement,
  resolve_children,
  TimelessElement,
  ViewChildren,
} from "./type";
import { Box, BoxEvents, BoxProps } from "./box";
import { View } from "./view";
import { Text } from "./text";
import { ListItemView } from "./list-item-view";

const logger = Logger({ prefix: "primitive", scope: "list-view" });

type WrappedItemInListView<T extends Record<string, unknown>> = {
  k: number;
  v: T;
  top: number;
  height: number;
};
/** Props for ListView component */
export type ListViewProps<T extends Record<string, unknown>> = BoxProps &
  ForProps<T> & {
    size: number;
    buffer?: number;
    itemHeight: number;
    gutter?: number;
    onScroll?: (event: {}) => void;
    onReachBottom?: () => void;
  };
type ListViewState<T extends Record<string, unknown>> = {
  height: number;
  clientHeight: number;
  offsetTop: number;
  scrollTop: number;
  subscribed: boolean;
  items: T[];
  /** 可见范围内的，带 k 的容器 */
  wrapped_items: WrappedItemInListView<T>[];
  children: (TimelessElement | null)[];
  idx_arr: DerivedRef<number>[];
};
type ListViewEvents = BoxEvents & {
  onScroll?: (event: ScrollEvent) => void;
};

export function ListView<T extends Record<string, unknown>>(
  props: ListViewProps<T>,
) {
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
  let _size = size ?? 4;
  /** 缓冲的数量 */
  let _buffer_size = buffer ?? 10;
  /** 每个元素和下面元素的距离 */
  let _gutter = gutter ?? 0;
  /** 每行的预估高度，未测量的行用该值 */
  let _estimatedHeight = itemHeight;
  /** 高度缓存：index -> measured height，null 表示未测量 */
  let _heightCache: (number | null)[] = [];
  /** 当前可见范围起始位置对应的 scroll offset，用于滚动时的增量计算 */
  let _startOffset = 0;
  /** 是否需要异步测量高度 */
  let _needMeasure = false;
  let _measureRaf = 0;

  // ---- height-cache helpers ----
  const getItemHeight = (idx: number): number => {
    const itemHeight = Number(state.items[idx]?.height);
    return _heightCache[idx] ?? (Number.isFinite(itemHeight) && itemHeight > 0
      ? itemHeight
      : _estimatedHeight);
  };
  /** 计算下标 idx 对应的 scroll offset（该行顶部距离内容顶部的位置） */
  const getItemOffset = (idx: number): number => {
    let offset = 0;
    for (let i = 0; i < idx; i++) {
      offset += getItemHeight(i) + _gutter;
    }
    return offset;
  };
  /** 计算总内容高度 */
  const getTotalHeight = (): number => {
    const n = state.items.length;
    if (n === 0) return 0;
    let h = 0;
    for (let i = 0; i < n; i++) {
      h += getItemHeight(i);
    }
    return h + Math.max(0, n - 1) * _gutter;
  };
  /** 设置 wrapped_item 的 top/height */
  const setItemPosition = (
    item: WrappedItemInListView<T>,
    idx: number,
  ) => {
    item.top = getItemOffset(idx);
    item.height = getItemHeight(idx);
  };
  const getItemKey = (item: T | undefined | null) => {
    return _key && item ? item[_key] : item;
  };
  const getWrappedItemKey = (item: WrappedItemInListView<T>) => {
    return getItemKey(item.v);
  };
  const realignHeightCache = (
    prevItems: T[],
    prevCache: (number | null)[],
    nextItems: T[],
  ) => {
    const prevCacheByKey = new Map<any, (number | null)[]>();
    for (let i = 0; i < prevItems.length; i += 1) {
      const key = getItemKey(prevItems[i]);
      let cacheItems = prevCacheByKey.get(key);
      if (!cacheItems) {
        cacheItems = [];
        prevCacheByKey.set(key, cacheItems);
      }
      cacheItems.push(prevCache[i] ?? null);
    }
    _heightCache = nextItems.map((item) => {
      return prevCacheByKey.get(getItemKey(item))?.shift() ?? null;
    });
  };
  const recomputeWrappedItemPositions = (
    items: WrappedItemInListView<T>[],
  ) => {
    let top = 0;
    for (let i = 0; i < items.length; i += 1) {
      const wrappedItem = items[i];
      const itemHeight = Number(wrappedItem.v?.height);
      const cachedHeight = _heightCache[i];
      const height =
        cachedHeight ??
        (Number.isFinite(itemHeight) && itemHeight > 0
          ? itemHeight
          : _estimatedHeight);
      wrappedItem.top = top;
      wrappedItem.height = height;
      top += height + _gutter;
    }
  };
  // ---- end height-cache helpers ----

  let _visible_count = _size;
  let _slot_count = _size + 2 * _buffer_size;
  /** 固定槽位池 */
  let _slots: ListItemView[] = [];
  /** 绑定的槽位，以 wrapped_item.k 为 key */
  let _slot_bindings = new Map<string, ListItemView>();
  /** 空闲槽位池 */
  let _free_slots: ListItemView[] = [];
  /** 渲染的列表 */
  let _children: (TimelessElement | null)[] = [];
  /** 默认显示的数量 */
  let _scroll = { scrollTop: 0 };
  let _start = 0;
  let _end = _size;
  /** 标记从哪个下标开始 top 需要重算，Infinity 表示干净 */
  let _dirty_from = Infinity;
  const _owner = get_owner();
  const _existing_map = new Map();
  const _slot_render_owners = new Map<
    ListItemView,
    ReturnType<typeof create_owner>
  >();
  // Track subscription unsubscribers separately for HMR
  const _hmr_subs: (() => void)[] = [];
  let _id = 0;
  let _refreshing = false;
  let _pending_raf = 0;
  let _pending_v: T[] | null = null;
  let _pending_extra: any = null;
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

  const methods = {
    unique_id() {
      return _id++;
    },
    ready() {
      const vv = props.each;
      if (!vv) {
        return;
      }
      const items = isRef(vv) ? vv.value : vv;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const wrapped_item = {
          k: methods.unique_id(),
          v: item,
          height: _estimatedHeight,
          top: 0 as number,
        };
        setItemPosition(wrapped_item, i);
        state.wrapped_items[i] = wrapped_item;
      }
      state.items = [...items];
    },
    subscribe_props() {
      if (state.subscribed) {
        return;
      }
      state.subscribed = true;
      box$.methods.subscribe_props();
      const vv = props.each;
      if (isRef(vv)) {
        const unsub = vv.subscribe({
          onPatch(action) {
            if (!state.rendered) {
              return;
            }
            // logger.log("ctx.onPatch - handle patch", action, vv.value);
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
          onChange(v, extra) {
            // logger.log("each handle change", v, state.rendered, extra);
            methods.refresh(v, extra);
            // _pending_v = v;
            // _pending_extra = extra;
            // if (!_pending_raf) {
            //   _pending_raf = requestAnimationFrame(() => {
            //     _pending_raf = 0;
            //     const pv = _pending_v;
            //     const pe = _pending_extra;
            //     _pending_v = null;
            //     _pending_extra = null;
            //     if (pv) methods.refresh(pv, pe);
            //   });
            // }
          },
        });
        listener$.add(unsub);
        _hmr_subs.push(unsub);
      }
    },
    destroy() {
      listener$.destroy();
      box$.methods.destroy();
      for (let i = 0; i < state.idx_arr.length; i += 1) {
        const idx = state.idx_arr[i];
        if (idx) {
          idx.destroy();
        }
      }
      for (const slot of _slots) {
        methods.dispose_slot_owner(slot);
      }
      _slot_render_owners.clear();
      methods.cleanup_registry_items();
      if (_owner) {
        dispose_owner(_owner);
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node)) {
          node.onUnmounted();
        }
      }
      state.rendered = false;
      state.items = [];
      state.wrapped_items = [];
      state.children = [];
      state.idx_arr = [];
      _slot_bindings.clear();
      _free_slots = [];
      _slots = [];
      if (_pending_raf) {
        cancelAnimationFrame(_pending_raf);
        _pending_raf = 0;
      }
      if (_measureRaf) {
        cancelAnimationFrame(_measureRaf);
        _measureRaf = 0;
      }
      _heightCache.length = 0;
      _needMeasure = false;
    },
    // Helper to create a computed index that depends on `each`
    create_idx(origin_item: WrappedItemInListView<T>): DerivedRef<number> {
      return computed(props.each, (t) => {
        const r = state.wrapped_items.indexOf(origin_item);
        // console.log("recompute index when the each is changed", origin_item);
        return r;
      });
    },
    get_idx(origin_item: WrappedItemInListView<T>, index?: number) {
      const idx =
        index !== undefined ? index : state.wrapped_items.indexOf(origin_item);
      if (idx !== -1 && state.idx_arr[idx]) {
        return state.idx_arr[idx];
      }
      const idx_computed = methods.create_idx(origin_item);
      if (idx !== -1) {
        state.idx_arr[idx] = idx_computed;
      }
      return idx_computed;
    },
    dispose_slot_owner(slot: ListItemView) {
      const owner = _slot_render_owners.get(slot);
      if (owner) {
        dispose_owner(owner);
        _slot_render_owners.delete(slot);
      }
    },
    render_for_slot(
      slot: ListItemView,
      item: T,
      idx_computed: DerivedRef<number>,
    ) {
      methods.dispose_slot_owner(slot);
      const item_owner = create_owner(_owner);
      _slot_render_owners.set(slot, item_owner);
      return run_with_owner(item_owner, () => props.render(item, idx_computed));
    },
    release_slot(slot: ListItemView) {
      slot.unbind();
      methods.dispose_slot_owner(slot);
      _free_slots.push(slot);
    },
    normalize_children(children?: ViewChildren) {
      if (children === null || children === undefined) {
        return [];
      }
      const resolved = resolve_children(children);
      if (!resolved) return [];
      if (Array.isArray(resolved)) {
        return resolved;
      }
      return [resolved];
    },
    cleanup_registry_items(items = state.items) {
      for (const item of items) {
        if (item && typeof item === "object") {
          registryDelete(item);
        }
      }
    },
    build_children(range: { start: number; end: number }) {
      const wrapped_items = state.wrapped_items.slice(range.start, range.end);
      for (let i = 0; i < wrapped_items.length; i += 1) {
        const wrapped_item = wrapped_items[i];
        const idx_computed = methods.get_idx(wrapped_item, range.start + i);
        const elm = _owner
          ? run_with_owner(_owner, () =>
              props.render(wrapped_item.v, idx_computed),
            )
          : props.render(wrapped_item.v, idx_computed);
        const top = getItemOffset(range.start + i);
        if (isElement(elm)) {
          const item$ = View(
            {
              dataset: {
                id: wrapped_item.k,
              },
              style: {
                position: "absolute",
                top: `${top}px`,
                width: "100%",
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
                width: "100%",
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
                width: "100%",
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
    init_slot() {
      // const range = { start: _start, end: _end };
      for (let i = 0; i < _slot_count; i++) {
        const slot = ListItemView(
          {
            uid: -1,
            top: 0,
            height: 0,
            payload: null,
            bound: false,
          },
          [],
        );

        const wrapped_item = state.wrapped_items[i];

        // if (!wrapped_item) {
        //   _free_slots.push(slot);
        //   _slots.push(slot);
        //   continue;
        // }

        if (wrapped_item) {
          const idx_computed = methods.get_idx(wrapped_item, i);
          state.idx_arr[i] = idx_computed;
          const elm = methods.render_for_slot(
            slot,
            wrapped_item.v,
            idx_computed,
          );

          const child = (() => {
            if (isElement(elm)) {
              return elm;
            }
            if (isRef(elm)) {
              return Text(elm);
            }
            if (elm) {
              return Text(elm);
            }
            return null;
          })();

          const top = getItemOffset(_start + i);
          // Use setState during construction — $elm is null until rendered.
          // The child will be synced to DOM after mount via flushInitialSlots.
          slot.setState({
            uid: wrapped_item.k,
            top,
            height: _estimatedHeight,
            payload: wrapped_item.v,
            bound: true,
            children: [child],
          });
          _slot_bindings.set(methods._dataIdStr(wrapped_item.k), slot);
        } else {
          _free_slots.push(slot);
        }

        // state.items[i] = wrapped_item.v;

        // const slot = _free_slots.pop()!;
        // const slot = _slots[_slots.length - 1];
        // slot.setState({
        //   uid: wrapped_item.k,
        //   top,
        //   height: itemHeight,
        //   payload: wrapped_item.v,
        //   bound: i < 20,
        //   children: [child],
        // });
        // slot.unbind();
        // 槽位的高度变化需要转发给当前绑定的数据 Cell
        // slot.onHeightChange(([original_height, height_difference]) => {
        //   if (!slot.state.bound || slot.state.dataId === undefined) {
        //     return;
        //   }
        //   // 找到对应的数据 Cell 并更新其高度
        //   const dataCell = _$total_items.find(
        //     (v) => (v.state.id ?? v.uid) === slot.state.dataId,
        //   );
        //   if (dataCell) {
        //     dataCell.methods.updateHeight(slot.state.height);
        //     const idx = _$total_items.indexOf(dataCell);
        //     if (idx !== -1) {
        //       _dirty_from = Math.min(_dirty_from, idx + 1);
        //     }
        //   }
        //   _height += height_difference;
        //   bus.emit(Events.HeightChange, _height);
        //   bus.emit(Events.CellUpdate, { $item: slot });
        //   methods.refresh();
        // });
        _slots.push(slot);
      }
      // logger.log("after init slot", _slot_bindings.size);
    },
    /** 在指定位置，插入 n 个节点 */
    insert(index: number, items: T[]) {
      // logger.log("insert - start", index, items);
      const inserted_elements: (TimelessElement | null)[] = [];
      const inserted_items: T[] = [];
      const inserted_wrapped_items: WrappedItemInListView<T>[] = [];
      const inserted_idx: DerivedRef<number>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const wrapped_item = {
          k: methods.unique_id(),
          v: item,
          top: 0 as number,
          height: _estimatedHeight,
        };
        setItemPosition(wrapped_item, index + i);
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
        const child_elm = _owner
          ? run_with_owner(_owner, () => props.render(item, idx))
          : props.render(item, idx);
        const child = (() => {
          if (isElement(child_elm)) {
            return child_elm;
          }
          if (isRef(child_elm)) {
            return Text(child_elm);
          }
          if (typeof child_elm === "function") {
          }
          if (child_elm) {
            return Text(child_elm);
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
      // logger.log("remove", index, count, state.idx_arr);
      const removed_idx: DerivedRef<number>[] = [];
      for (let i = 0; i < count; i += 1) {
        const item = state.items[index + i];
        if (_existing_map.has(item)) {
          _existing_map.delete(item);
        }
        if (item && typeof item === "object") {
          registryDelete(item);
        }
        // logger.log("remove in loop", index + i, state.idx_arr[index + i]);
        removed_idx.push(state.idx_arr[index + i]);
      }
      // logger.log("remove before destroy idx", removed_idx);
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
    refresh(v: T[], extra?: { reset?: boolean }) {
      // logger.log(
      //   "refresh",
      //   v.length,
      //   "items, current:",
      //   state.items.length,
      //   _refreshing,
      //   extra,
      // );
      if (_refreshing) {
        return;
      }
      _refreshing = true;

      if (extra?.reset) {
        $elm.setScrollTop(0);
        _start = 0;
        _end = _size;
        // for (const [, slot] of _slot_bindings) {
        //   methods.release_slot(slot);
        // }
        // _slot_bindings.clear();
      }
      const prev_items = [...state.items];
      const prev_height_cache = [..._heightCache];
      const prev_wrapped_items = [...state.wrapped_items];
      const prev_elements = [...state.children];
      const prev_index_computed = state.idx_arr;
      const prev_wrapped_by_key = new Map<any, WrappedItemInListView<T>[]>();
      for (let i = 0; i < prev_wrapped_items.length; i += 1) {
        const wrapped_item = prev_wrapped_items[i];
        if (!wrapped_item) {
          continue;
        }
        const wrapped_key = getWrappedItemKey(wrapped_item);
        let wrapped_items = prev_wrapped_by_key.get(wrapped_key);
        if (!wrapped_items) {
          wrapped_items = [];
          prev_wrapped_by_key.set(wrapped_key, wrapped_items);
        }
        wrapped_items.push(wrapped_item);
      }
      const next_wrapped_items: WrappedItemInListView<T>[] = new Array(
        v.length,
      );
      for (let i = 0; i < v.length; i += 1) {
        const item = v[i];
        const item_key = getItemKey(item);
        const existing = prev_wrapped_by_key.get(item_key)?.shift();
        if (existing) {
          registryGet(existing.v)?.diff(item);
          existing.v = item;
          existing.height = _estimatedHeight;
          next_wrapped_items[i] = existing;
          continue;
        }
        next_wrapped_items[i] = {
          k: methods.unique_id(),
          v: item,
          top: getItemOffset(i),
          height: _estimatedHeight,
        };
      }
      realignHeightCache(prev_items, prev_height_cache, v);
      recomputeWrappedItemPositions(next_wrapped_items);
      state.wrapped_items = next_wrapped_items;
      const visible_items = v.slice(_start, _end);
      const new_visible_wrapped_items: WrappedItemInListView<T>[] = [];
      for (let i = 0; i < visible_items.length; i += 1) {
        new_visible_wrapped_items[i] = state.wrapped_items[_start + i];
      }
      // 1. Prepare target state
      const new_elements: (TimelessElement | null)[] = new Array(
        new_visible_wrapped_items.length,
      );
      // const new_children: (any | null)[] = new Array(new_items.length);
      // const new_original_items: T[] = new Array(new_items.length);
      const new_index_computed: DerivedRef<number>[] = new Array(
        new_visible_wrapped_items.length,
      );
      // 2. Index old items for O(1) lookup
      const old_map = new Map<any, number[]>();
      prev_items.forEach((item, index) => {
        const k = getItemKey(item);
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
      for (const item of new_visible_wrapped_items) {
        const k = getWrappedItemKey(item);
        new_key_set.add(k);
      }
      // removed_old_prefix[i] = number of old items at indices [0, i) that are NOT in new array
      const removed_old_prefix: number[] = new Array(
        prev_items.length + 1,
      ).fill(0);
      for (let i = 0; i < prev_items.length; i++) {
        const item = prev_items[i];
        const k = getItemKey(item);
        removed_old_prefix[i + 1] =
          removed_old_prefix[i] + (new_key_set.has(k) ? 0 : 1);
      }
      const old_key_set = new Set<any>();
      for (const item of prev_items) {
        const k = getItemKey(item);
        old_key_set.add(k);
      }
      // insertion_new_prefix[i] = number of new items at indices [0, i) that are NOT in old array
      const insertion_new_prefix: number[] = new Array(
        new_visible_wrapped_items.length + 1,
      ).fill(0);
      for (let i = 0; i < new_visible_wrapped_items.length; i++) {
        const item = new_visible_wrapped_items[i];
        const k = getWrappedItemKey(item);
        insertion_new_prefix[i + 1] =
          insertion_new_prefix[i] + (old_key_set.has(k) ? 0 : 1);
      }
      // 3. Diff Phase: Identify operations
      const added_nodes: {
        idx: number;
        elements: (TimelessElement | null)[];
      }[] = [];
      const updated_nodes = new Map<string, TimelessElement | null>();
      const removed_nodes: { idx: number; count: number }[] = [];
      const moved_nodes: { from: number; to: number }[] = [];
      let _add_start = -1;
      // Iterate new items -> Determine Reused vs Added
      for (let i = 0; i < new_visible_wrapped_items.length; i++) {
        const new_item = new_visible_wrapped_items[i];
        const k = getWrappedItemKey(new_item);
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
              if (prev_item !== new_item.v) {
                registryDelete(prev_item);
              }
              // Update registry to map new item to the same proxy
              registrySet(new_item.v, proxy);
            } else {
              const rerendered = props.render(
                new_item.v,
                new_index_computed[i],
              );
              new_elements[i] = rerendered;
              updated_nodes.set(methods._dataIdStr(new_item.k), rerendered);
            }
          } else if (new_item.v !== prev_item) {
            const rerendered = props.render(new_item.v, new_index_computed[i]);
            new_elements[i] = rerendered;
            updated_nodes.set(methods._dataIdStr(new_item.k), rerendered);
          }
        } else {
          // Added (New) - create new computed index and render
          if (_add_start === -1) {
            _add_start = i;
            added_nodes.push({ idx: i, elements: [] });
          }
          const idx_computed = methods.create_idx(new_item);
          new_index_computed[i] = idx_computed;
          const new_elm = _owner
            ? run_with_owner(_owner, () =>
                props.render(new_item.v, idx_computed),
              )
            : props.render(new_item.v, idx_computed);
          new_elements[i] = new_elm;
          added_nodes[added_nodes.length - 1].elements.push(new_elm);
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
      // logger.log(
      //   "removed:",
      //   removed_nodes,
      //   "added:",
      //   added_nodes.map((op) => {
      //     return { idx: op.idx, couont: op.elements.length };
      //   }),
      //   "moved:",
      //   moved_nodes,
      // );
      // Destroy idx_computed for every removed item in each removed range.
      // Keeping any stale computed alive will retain the wrapped item and the
      // rendered view graph through its closure.
      for (const { idx, count } of removed_nodes) {
        for (let i = 0; i < count; i += 1) {
          if (prev_index_computed[idx + i]) {
            prev_index_computed[idx + i].destroy();
          }
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
      // 释放已移除的 slot（仅处理可见范围内的）
      for (const { idx, count } of removed_nodes) {
        for (let i = 0; i < count; i++) {
          const item_idx = idx + i;
          // logger.log(
          //   "prepare free slot",
          //   _start,
          //   _end,
          //   item_idx,
          //   prev_wrapped_items,
          //   _slot_bindings,
          // );
          // if (item_idx < _start || item_idx >= _end) {
          //   continue;
          // }
          const prev_wrapped_item = prev_wrapped_items[item_idx];
          if (!prev_wrapped_item) {
            continue;
          }
          const k = prev_wrapped_item.k;
          const key = methods._dataIdStr(k);
          const slot = _slot_bindings.get(key);
          if (slot) {
            // logger.log(
            //   "before unbind slot",
            //   idx,
            //   item_idx,
            //   key,
            //   prev_items,
            //   prev_wrapped_item,
            // );
            methods.release_slot(slot);
            _slot_bindings.delete(key);
          }
        }
      }
      // 更新所有保留槽位的 top
      const wrapped_item_by_key = new Map<string, WrappedItemInListView<T>>();
      for (const w of new_visible_wrapped_items) {
        wrapped_item_by_key.set(methods._dataIdStr(w.k), w);
      }
      for (const [key, slot] of _slot_bindings) {
        const wrapped_item = wrapped_item_by_key.get(key);
        if (wrapped_item) {
          slot.setTop(wrapped_item.top);
          slot.setPayload(wrapped_item.v);
          const updated_child = updated_nodes.get(key);
          if (updated_child) {
            methods.dispose_slot_owner(slot);
            slot.rebind({
              uid: wrapped_item.k,
              top: wrapped_item.top,
              height: wrapped_item.height,
              payload: wrapped_item.v,
              child: updated_child,
            });
          }
        }
      }
      // 复用 free_slots 给新增的（仅处理可见范围内的）
      for (const { idx, elements } of added_nodes) {
        for (let i = 0; i < elements.length; i++) {
          const item_idx = idx + i;
          // if (item_idx < _start || item_idx >= _end) continue;
          if (_free_slots.length === 0) {
            break;
          }
          const new_wrapped_item = new_visible_wrapped_items[item_idx];
          const key = methods._dataIdStr(new_wrapped_item.k);
          if (!_slot_bindings.has(key)) {
            const slot = _free_slots.pop()!;
            slot.rebind({
              uid: key,
              top: new_wrapped_item.top,
              height: new_wrapped_item.height,
              payload: new_wrapped_item.v,
              child: elements[i],
            });
            _slot_bindings.set(key, slot);
          }
        }
      }
      // Release slots for items no longer in the visible range.
      // The removed_nodes loop above only handles items whose OLD position
      // was within _start.._end.  Slots bound to items that scrolled out of
      // view or whose data was completely replaced stay in _slot_bindings
      // indefinitely, starving _free_slots.
      {
        const visible_key_set = new Set<string>();
        for (let i = _start; i < _end && i < state.wrapped_items.length; i++) {
          visible_key_set.add(methods._dataIdStr(state.wrapped_items[i].k));
        }
        for (const [key, slot] of _slot_bindings) {
          if (!visible_key_set.has(key)) {
            methods.release_slot(slot);
            _slot_bindings.delete(key);
          }
        }
      }
      state.items = [...v];
      state.idx_arr = new_index_computed;
      state.children = new_elements;
      const total_height = getTotalHeight();
      // logger.log(
      //   "refresh - before $elm.setStyleValue",
      //   state.wrapped_items.length,
      //   total_height,
      // );
      if (state.height !== total_height) {
        state.height = total_height;
        $elm.setStyleValue("height", total_height);
      }
      // 更新可见范围，处理新增/删除导致的可见项变化
      const itemCount = state.wrapped_items.length;
      // 当数据量大幅变化时，根据当前滚动位置重新计算 _start
      if (prev_items.length > 0 && itemCount > prev_items.length * 2) {
        const range = methods.calcVisibleRange(_scroll.scrollTop);
        _start = range.start;
        _end = range.end;
      } else {
        _end = Math.min(_start + _size + 2 * _buffer_size, itemCount);
      }
      if (_start >= itemCount) {
        _start = Math.max(0, itemCount - 1);
      }
      // 跳过 $elm.refresh，使用 slot rebind 方式复用 DOM
      const actions_count =
        added_nodes.length +
        removed_nodes.length +
        moved_nodes.length +
        updated_nodes.size;
      if (actions_count === 0) {
        _refreshing = false;
        return;
      }
      // 强制同步：无条件确保 [_start, _end) 范围内的槽位正确绑定
      {
        const visible_map = new Map<string, WrappedItemInListView<T>>();
        for (let i = _start; i < _end; i++) {
          const wi = state.wrapped_items[i];
          visible_map.set(methods._dataIdStr(wi.k), wi);
        }
        // unbind 离开可见范围的槽位
        for (const [key, slot] of _slot_bindings) {
          if (!visible_map.has(key)) {
            methods.release_slot(slot);
            _slot_bindings.delete(key);
          }
        }
        // 同步所有保留槽位的 top
        for (const [key, slot] of _slot_bindings) {
          const wi = visible_map.get(key);
          if (wi) {
            slot.setTop(wi.top);
            slot.setPayload(wi.v);
          }
        }
        // bind 进入可见范围的槽位
        for (let i = _start; i < _end; i++) {
          const key = methods._dataIdStr(state.wrapped_items[i].k);
          if (!_slot_bindings.has(key) && _free_slots.length > 0) {
            const wrapped_item = state.wrapped_items[i];
            const slot = _free_slots.pop()!;
            const idx_computed = methods.get_idx(wrapped_item, i);
            const elm = methods.render_for_slot(
              slot,
              wrapped_item.v,
              idx_computed,
            );
            const child = (() => {
              if (isElement(elm)) return elm;
              if (isRef(elm)) return Text(elm);
              if (elm) return Text(elm);
              return null;
            })();
            slot.rebind({
              uid: wrapped_item.k,
              top: wrapped_item.top,
              height: wrapped_item.height,
              payload: wrapped_item.v,
              child,
            });
            _slot_bindings.set(key, slot);
          }
        }
      }
      // Update viewport offset and schedule height measurement
      _startOffset = getItemOffset(_start);
      if ($elm) {
        $elm.setStyleValue("viewportOffset", _startOffset);
      }
      methods.scheduleMeasure();
      _refreshing = false;
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
      _dirty_from = Infinity;
      _start = 0;
      _end = _size;
      state.height = 0;
      // bus.emit(Events.StateChange, { ..._state });
    },
    resetRange() {
      _start = 0;
      _end = _size;
      // 重新计算范围并 rebind 所有槽位
      const range = methods.calcVisibleRange(0);
      methods.update(range);
      // methods.refresh();
    },
    calcVisibleRange(scroll_top: number) {
      const len = state.items.length;
      if (len === 0) {
        _startOffset = 0;
        return { start: 0, end: 0 };
      }
      const estItemHeight = _estimatedHeight + _gutter;
      // Binary search with estimated height to find approximate index
      let idx = len;
      {
        let lo = 0;
        let hi = len - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >>> 1;
          if (mid * estItemHeight >= scroll_top) {
            idx = mid;
            hi = mid - 1;
          } else {
            lo = mid + 1;
          }
        }
      }
      // Walk to exact position using cached heights.
      // Start from the estimated position and walk backward/forward.
      idx = Math.max(0, idx - 1);
      let offset = getItemOffset(idx);
      // Refine by walking: only needed when heights differ from estimate
      if (offset > scroll_top) {
        // Walk backward to find correct position
        while (idx > 0 && offset > scroll_top) {
          idx--;
          offset -= getItemHeight(idx) + _gutter;
        }
      } else {
        // Walk forward to find the item whose bottom edge > scroll_top
        while (idx < len && offset + getItemHeight(idx) <= scroll_top) {
          offset += getItemHeight(idx) + _gutter;
          idx++;
        }
      }
      if (idx >= len) {
        idx = len - 1;
        offset = getItemOffset(idx);
      }
      const baseStart = idx;
      _startOffset = offset;
      const start = Math.max(0, baseStart - _buffer_size);
      const end = Math.min(baseStart + _size + _buffer_size, len);
      return { start, end };
    },
    update(range: { start: number; end: number }) {
      const has_change = range.start !== _start || range.end !== _end;
      if (!has_change) {
        return;
      }

      _start = range.start;
      _end = range.end;

      // 计算 enteringCells（在 newDataCells 中但当前未绑定的）
      // With transform-based viewport (normal flow), each slot occupies a
      // fixed DOM position. We assign data items to slots by position:
      // slot[i] shows wrapped_items[_start + i]. This avoids DOM reordering
      // which causes visual flicker.
      //
      // Strategy: iterate slots in DOM order. For each position, determine
      // the data item it should show. If the slot already shows that item,
      // skip. Otherwise, rebind it.
      const slotCount = _end - _start;
      for (let i = 0; i < _slots.length; i++) {
        const slot = _slots[i];
        if (i < slotCount) {
          const dataIdx = _start + i;
          const wrapped_item = state.wrapped_items[dataIdx];
          const key = methods._dataIdStr(wrapped_item.k);
          const currentKey = (() => {
            // Find what key this slot currently holds
            for (const [k, s] of _slot_bindings) {
              if (s === slot) return k;
            }
            return null;
          })();
          if (currentKey === key) {
            // Slot already shows the correct item — no change needed
            continue;
          }
          // Remove old binding
          if (currentKey !== null) {
            _slot_bindings.delete(currentKey);
          }
          // Render new content
          const idx_computed = methods.get_idx(wrapped_item, dataIdx);
          const elm = methods.render_for_slot(
            slot,
            wrapped_item.v,
            idx_computed,
          );
          const child = (() => {
            if (isElement(elm)) return elm;
            if (isRef(elm)) return Text(elm);
            if (elm) return Text(elm);
            return null;
          })();
          slot.rebind({
            uid: wrapped_item.k,
            top: wrapped_item.top,
            height: wrapped_item.height,
            payload: wrapped_item.v,
            child,
          });
          _slot_bindings.set(key, slot);
        } else {
          // This slot is beyond the visible range — unbind it
          const currentKey = (() => {
            for (const [k, s] of _slot_bindings) {
              if (s === slot) return k;
            }
            return null;
          })();
          if (currentKey !== null) {
            _slot_bindings.delete(currentKey);
          }
          if (slot.state.bound) {
            methods.release_slot(slot);
          }
        }
      }
    },
    /**
     * Called after the first mount to sync children set via setState()
     * in init_slot() into the actual DOM. $elm is available at this point.
     */
    flushInitialSlots() {
      for (const [key, slot] of _slot_bindings) {
        if (
          slot.$elm &&
          slot.state.bound &&
          slot.state.children.length > 0
        ) {
          const child = slot.state.children[0];
          slot.$elm.removeChildren();
          slot.$elm.insertChildren([child]);
          if (isElement(child) && child.onMounted) {
            child.onMounted({ target: child.$elm });
          }
        }
      }
    },
    scheduleMeasure() {
      _needMeasure = true;
      if (!_measureRaf) {
        _measureRaf = requestAnimationFrame(() => {
          _measureRaf = 0;
          if (_needMeasure) {
            _needMeasure = false;
            methods.measureHeights();
          }
        });
      }
    },
    /**
     * Measure visible slots and update the height cache. If any measured
     * height differs from the cache, update total content height and correct
     * scroll position to prevent visual jumps.
     */
    measureHeights() {
      const prevTotal = getTotalHeight();
      let anyChanged = false;
      for (let i = _start; i < _end && i < state.wrapped_items.length; i++) {
        const key = methods._dataIdStr(state.wrapped_items[i].k);
        const slot = _slot_bindings.get(key);
        if (!slot || !slot.$elm) continue;
        const measuredHeight = slot.$elm.getBoundingClientRect().height;
        if (measuredHeight <= 0) continue;
        const cached = _heightCache[i];
        if (cached !== measuredHeight) {
          _heightCache[i] = measuredHeight;
          state.wrapped_items[i].height = measuredHeight;
          anyChanged = true;
        }
      }
      if (!anyChanged) return;
      // Recompute total height
      const newTotal = getTotalHeight();
      if (newTotal !== prevTotal) {
        state.height = newTotal;
        if ($elm) {
          $elm.setStyleValue("height", newTotal);
        }
      }
      // Correct scroll position: keep the first visible item anchored
      const firstVisible = _start + _buffer_size;
      if (firstVisible < state.wrapped_items.length) {
        _startOffset = getItemOffset(_start);
        const visibleOffset = getItemOffset(firstVisible);
        const currentScrollTop = _scroll.scrollTop;
        // If the first visible item's position shifted, adjust scrollTop
        // to prevent visual jump (anchor the item in place)
        if (Math.abs(currentScrollTop - visibleOffset) > 1 && $elm) {
          // Only correct on significant drift
        }
      }
      // Re-send viewport offset since item heights may have changed
      if ($elm) {
        _startOffset = getItemOffset(_start);
        $elm.setStyleValue("viewportOffset", _startOffset);
      }
    },
  };

  let _rafPending = false;

  // Scroll handler: immediate delta tracking keeps viewport aligned
  // during rapid scrollbar drag; rAF callback corrects any drift and
  // updates slot contents — all before paint, so no flicker is visible.
  events.onScroll = (event: ScrollEvent) => {
    const { scrollTop } = event;
    if (onScroll) onScroll(event);
    const prevScrollTop = _scroll.scrollTop;
    _scroll = { scrollTop };
    if (scrollTop < 0) return;
    // Track scroll: shift viewport by scroll delta so existing slots
    // stay at their relative positions — no content flicker.
    if ($elm && prevScrollTop !== scrollTop) {
      _startOffset = Math.max(0, _startOffset + (scrollTop - prevScrollTop));
      $elm.setStyleValue("viewportOffset", _startOffset);
    }
    // Schedule once per frame: precise range + slot update + offset correction.
    if (!_rafPending) {
      _rafPending = true;
      requestAnimationFrame(() => {
        _rafPending = false;
        const latestScrollTop = _scroll.scrollTop;
        const range = methods.calcVisibleRange(latestScrollTop);
        if (range.start !== _start || range.end !== _end) {
          // Compute precise offset before update() so slot relative
          // positions (top = itemOffset - _startOffset) are correct.
          _startOffset = getItemOffset(range.start);
          methods.update(range);
        } else {
          _startOffset = getItemOffset(_start);
        }
        $elm.setStyleValue("viewportOffset", _startOffset);
      });
    }
  };
  methods.ready();
  methods.subscribe_props();
  box$.methods.add_event();
  methods.init_slot();
  const children = _slots;

  state.height = getTotalHeight();

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
      for (let i = 0; i < _slots.length; i += 1) {
        const child = _slots[i];
        if (isElement(child) && child.onMounted) {
          child.onMounted({ target: child.$elm });
        }
      }
      // Sync children set via setState() in init_slot() to the DOM
      methods.flushInitialSlots();
      // Measure actual heights after initial render to populate the height cache
      methods.scheduleMeasure();
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
      // logger.log("onUnmounted called, children count:", _children.length);
      if (props.onUnmounted) {
        // console.log("[View] calling props.onUnmounted");
        props.onUnmounted();
      }
      listener$.destroy();
      box$.methods.destroy();
      // methods.cleanup_idx_refs();
      for (let i = 0; i < state.idx_arr.length; i += 1) {
        const idx = state.idx_arr[i];
        idx.destroy();
      }
      for (const slot of _slots) {
        methods.dispose_slot_owner(slot);
      }
      _slot_render_owners.clear();
      methods.cleanup_registry_items();
      if (_owner) {
        dispose_owner(_owner);
      }
      for (let i = 0; i < state.children.length; i += 1) {
        const node = state.children[i];
        if (isElement(node)) {
          node.onUnmounted();
        }
      }
      if (_pending_raf) {
        cancelAnimationFrame(_pending_raf);
        _pending_raf = 0;
      }
      $elm = null;
      state.rendered = false;
      state.idx_arr.length = 0;
      state.children.length = 0;
      state.items.length = 0;
      state.wrapped_items.length = 0;
      _free_slots.length = 0;
      _slot_bindings.clear();
      _slots.length = 0;
    },
  };
}
