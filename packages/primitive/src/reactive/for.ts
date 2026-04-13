import {
  isRef,
  Ref,
  registryGet,
  registrySet,
  computed,
  DerivedRef,
  isWriteableRef,
} from "@timeless/reactive";

import { TimelessElement, isElement } from "@/content/type";
import { MountedEvent } from "@/event";
import { Text } from "@/content/text";
import { ListenerManager } from "@/util/listener";
import { Logger } from "@/util/logger";

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

const logger = Logger({ prefix: "primitive", scope: "reactive/for" });

export function For<T>(
  props: ForProps<T>,
  bus?: Partial<{
    onRefresh: (diff: {
      added: {
        idx: number;
        element: TimelessElement<any, any> | null;
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

  const _key = props.key;
  const state: ForState<T> = {
    rendered: false,
    subscribed: false,
    items: [],
    wrapped_items: [] as { k: number; v: T }[],
    children: [],
    idx_arr: [],
  };
  let _id = 0;
  const _existing_map = new Map();
  const listener$ = ListenerManager();

  const methods = {
    unique_id() {
      return _id++;
    },
    init_state() {
      const vv = props.each;
      const items = isRef(vv) ? (vv.value as T[]) : (vv as T[]);
      state.wrapped_items = items.map((item) => ({
        k: methods.unique_id(),
        v: item,
      }));
      state.items = [...items];
    },
    subscribe_value() {
      if (state.subscribed) {
        return;
      }
      state.subscribed = true;
      const vv = props.each;
      if (isRef(vv)) {
        listener$.add(
          vv.subscribe({
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
              if (
                action.type === "delete" &&
                action.deleteCount !== undefined
              ) {
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
          }),
        );
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
    build_children() {
      const items = state.wrapped_items;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const idx_computed = methods.create_idx(item);
        const elm = props.render(item.v, idx_computed);
        state.items[i] = item.v;
        state.children.push(elm);
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
        const child_tmp = props.render(item, idx);
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
    // update(index: number, item: any) {
    //   // const $parent = host.getParentNode(anchor);
    //   const $parent = $anchor.getParentNode();
    //   if (!$parent) return;

    //   // Reuse existing computed index or create new one
    //   let idxComputed = _index_computed[index];
    //   if (!idxComputed) {
    //     idxComputed = create_idx(item);
    //     _index_computed[index] = idxComputed;
    //     _original_items[index] = item;
    //   }
    //   const res = methods.render_item(item, idxComputed);
    //   if (!res) {
    //     return;
    //   }
    //   if (res.delete) {
    //     return;
    //   }
    //   const old = _$children[index];
    //   const $pa = old.getParentNode();
    //   if (old && $pa === $parent && res.elm) {
    //     // host.replaceChild($parent, res.elm, old);
    //     $parent.replaceChild(res.elm, old);
    //   } else if (res.elm) {
    //     // host.insertBefore($parent, res.elm, anchor);
    //     $parent.insertBefore(res.elm, $anchor);
    //   }
    //   const prev_item = state.items[index];
    //   if (prev_item !== item && _existing_map.has(prev_item)) {
    //     _existing_map.delete(prev_item);
    //   }
    //   state.items[index] = item;
    //   _elements[index] = res.node;
    //   _$children[index] = res.elm;
    // },
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
      console.log(
        "[primitive]for - refresh called with",
        v.length,
        "items, current:",
        state.items.length,
      );
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
      const added_nodes: { idx: number; element: TimelessElement | null }[] =
        [];
      const removed_nodes: { idx: number }[] = [];
      const moved_nodes: { from: number; to: number }[] = [];

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
          const old_idx = prev_indices.shift()!;
          const prev_item = prev_items[old_idx];
          // Reuse existing DOM element and computed index
          new_elements[i] = prev_elements[old_idx];
          // new_children[i] = prev_children[old_idx];
          // new_original_items[i] = prev_original_items[old_idx];
          new_index_computed[i] = prev_index_computed[old_idx];
          // Track moved items
          if (old_idx !== i) {
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
          const idx_computed = methods.create_idx(new_item);
          new_index_computed[i] = idx_computed;
          const res = props.render(new_item.v, idx_computed);
          new_elements[i] = res;
          added_nodes.push({ idx: i, element: res });
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
      // for (const { elm, component } of removed_nodes) {
      //   const $pa = elm.getParentNode();
      //   if (elm && $pa === $parent) {
      //     // host.removeChild($parent, elm);
      //     $parent.removeChild(elm);
      //   }
      //   if (component) {
      //     if (isElement(component)) {
      //       if (typeof component.onUnmounted === "function") {
      //         component.onUnmounted();
      //       }
      //     }
      //   }
      // }

      // // 4.2 Reorder / Insert nodes
      // // Backward loop for correct insertion relative to anchor
      // let next_sibling: any | null = anchor;
      // for (let i = new_children.length - 1; i >= 0; i--) {
      //   const node = new_children[i];
      //   if (!node) continue;

      //   // If node is already in correct position (immediately before nextSibling), skip.
      //   const $sibling = node.getNextSibling();
      //   if ($sibling === next_sibling) {
      //     next_sibling = node;
      //     continue;
      //   }

      //   if ($parent) {
      //     // If node is already in DOM elsewhere, insertBefore moves it.
      //     // host.insertBefore($parent, node, next_sibling);
      //     $parent.insertBefore(node, next_sibling);
      //   }

      //   next_sibling = node;
      // }

      // // 4.3 Trigger Lifecycle (Mounted)
      // for (const { node, elm } of added_nodes) {
      //   if (node && typeof node.onMounted === "function") {
      //     node.onMounted({ target: elm });
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
  methods.subscribe_value();
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
      logger.log("onMounted", state.children);
      methods.subscribe_value();
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
      state.rendered = true;
      if (props.onUnmounted) {
        props.onUnmounted();
      }
      // listener$.destroy();
      // for (let i = 0; i < state.idx_arr.length; i += 1) {
      //   state.idx_arr[i].destroy();
      // }
      // state.rendered = false;
      // state.items = [];
      // state.wrapped_items = [];
      // state.idx_arr = [];
      // state.children = [];
    },
  };
}
