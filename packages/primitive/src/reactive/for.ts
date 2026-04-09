import {
  isRef,
  Ref,
  registryGet,
  registrySet,
  computed,
  DerivedRef,
  isWriteableRef,
  isArrayRef,
} from "@timeless/reactive";

import { TimelessElement, isElement } from "@/content/type";
import { MountedEvent } from "@/event";
// import { safeCreateTextNode, safeCreateDocumentFragment } from "@/util/env";

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
  items: T[];
  children: (TimelessElement | null)[];
};

export function For<T>(props: ForProps<T>) {
  let $anchor: any = null;
  let $elm: any = null;

  const { key, each, render, onMounted, beforeUnmounted, onUnmounted } = props;

  const _key = key;
  const state: ForState<T> = {
    rendered: false,
    items: [],
    children: [],
  };
  // let _values: T[] = [];
  let _elements: (TimelessElement | null)[] = [];
  let _$children: (any | null)[] = [];
  let _original_items: T[] = []; // Store original item references for indexOf lookup
  let _index_computed: DerivedRef<number>[] = []; // Computed indexes that depend on `each`

  // Helper to create a computed index that depends on `each`
  const create_idx = (origin_item: T): DerivedRef<number> => {
    return computed(each, () => {
      const arr = isRef(each) ? each.value : each;
      return arr ? arr.indexOf(origin_item) : -1;
    });
  };

  const _existing_map = new Map();

  const render_result = (input: any) => {
    let res = input;
    if (typeof res === "function") res = res();
    if (!res) return { node: null, elm: null, trackElm: null, empty: true };

    // if (isVNodeDescriptor(res)) {
    //   const vnode = mount(res as any, scheduler);
    //   commitTree(vnode, renderer);
    //   const elm = (vnode as any)._hostNode ?? null;
    //   return { node: vnode, elm, trackElm: elm };
    // }

    // if (isElement(res)) {
    //   const elm = res.render();
    //   return { node: res, elm, trackElm: res.$elm };
    // }

    return { node: null, elm: null, trackElm: null, empty: true };
  };

  const methods = {
    render_item(item: T, idxComputed: DerivedRef<number>) {
      const rr: {
        node: null | TimelessElement;
        elm: null | any;
        trackElm?: null | any;
        empty?: boolean;
        delete?: boolean;
      } = (() => {
        const base = render_result(() => render(item, idxComputed));
        // Canvas：为子节点添加定位容器，并填充宽高
        // if (host.kind === "canvas") {
        //   const wrap = host.createElement("div");
        //   const y = Math.max(0, Number(idxComputed.value || 0)) * lineH;
        //   host.setStyleText(
        //     wrap,
        //     `left: 0; top: ${y}px; width: 100%; height: ${lineH}px;`,
        //   );
        //   // 子节点填满容器
        //   if (host.patchStyle) {
        //     host.patchStyle(base.elm, {
        //       left: "0",
        //       top: "0",
        //       width: "100%",
        //       height: `${lineH}px`,
        //     });
        //   } else {
        //     host.setStyleText(
        //       base.elm,
        //       "left: 0; top: 0; width: 100%; height: 24px;",
        //     );
        //   }
        //   host.appendChild(wrap, base.elm);
        //   return { node: base.node, elm: wrap, trackElm: wrap };
        // }
        return base;
      })();
      return rr;
    },
    /** 在指定位置，插入 n 个节点 */
    insert(index: number, items: T[]) {
      const inserted_elements: (TimelessElement | null)[] = [];

      for (let i = 0; i < items.length; i++) {
        const child = items[i];
        // Create computed index that depends on `each`
        const idx = create_idx(child);
        state.items.splice(index + i, 0, child);
        _original_items.splice(index + i, 0, child);
        _index_computed.splice(index + i, 0, idx);
        const res = render(child, idx);
        inserted_elements.push(res);
        state.children.splice(index + i, 0, res);
        // _elements.splice(index + i, 0, res.node);
        // _$children.splice(index + i, 0, res.trackElm || res.elm);
        // if (res.elm) {
        //   // host.appendChild($fragment, res.elm);
        //   $fragment.appendChild(res.elm);
        // }
      }

      if ($elm && typeof $elm.insert === "function") {
        $elm.insert(index, inserted_elements);
      }

      // const $base = _$children[index] || anchor;
      // // const $parent = host.getParentNode(anchor);
      // const $parent = anchor.getParentNode();

      // if (!$parent) return;

      // const $fragment = safeCreateDocumentFragment();

      // $parent.insertBefore($fragment, $base);
    },
    /** 从指定下标移除 n 个元素 */
    remove(index: number, count: number) {
      for (let i = 0; i < count; i += 1) {
        // const elm = _$children[index];
        // const $pa = elm.getParentNode();
        // if (elm && $pa === $parent) {
        //   try {
        //     // host.removeChild($parent, elm);
        //     $parent.removeChild(elm);
        //   } catch (e) {
        //     // ignore
        //   }
        // }
        const item = state.items[index];
        if (_existing_map.has(item)) {
          _existing_map.delete(item);
        }
        state.children.splice(index, 1);
        state.items.splice(index, 1);
        _elements.splice(index, 1);
        _$children.splice(index, 1);
        _original_items.splice(index, 1);
        _index_computed.splice(index, 1);
      }

      if ($elm && typeof $elm.remove === "function") {
        $elm.remove(index, count);
      }
      // const $parent = host.getParentNode(anchor);
      // const $parent = anchor.getParentNode();
      // if (!$parent) return;

      // No need to manually update computed indexes - they auto-recompute
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
      splice_arr(state.children);
      splice_arr(_elements);
      splice_arr(_$children);
      splice_arr(_original_items);
      splice_arr(_index_computed);

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
      swap_arr(state.children);
      swap_arr(_elements);
      swap_arr(_$children);
      swap_arr(_original_items);
      swap_arr(_index_computed);

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
        "[For _refresh] called with",
        v.length,
        "items, current:",
        state.items.length,
      );
      const new_items = v;
      const prev_items = state.items;
      const prev_elements = _elements;
      const prev_children = _$children;
      const prev_original_items = _original_items;
      const prev_index_computed = _index_computed;

      // const $parent = anchor.getParentNode();
      // if (!$parent) return;

      // 1. Prepare target state
      const new_elements: (TimelessElement | null)[] = new Array(
        new_items.length,
      );
      // const new_children: (any | null)[] = new Array(new_items.length);
      // const new_original_items: T[] = new Array(new_items.length);
      const new_index_computed: DerivedRef<number>[] = new Array(
        new_items.length,
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
      for (let i = 0; i < new_items.length; i++) {
        const new_item = new_items[i];
        const k =
          props.key && new_item ? (new_item as any)[props.key] : new_item;
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
            new_item !== prev_item &&
            prev_item &&
            typeof prev_item === "object"
          ) {
            const proxy = registryGet(prev_item);
            if (proxy && isWriteableRef(proxy)) {
              proxy.as(new_item);
              // Update registry to map new item to the same proxy
              registrySet(new_item, proxy);
            }
          }
        } else {
          // Added (New) - create new computed index and render
          const idx_computed = create_idx(new_item);
          // new_original_items[i] = new_item;
          new_index_computed[i] = idx_computed;
          const res = render(new_item, idx_computed);
          state.children[i] = res;
          // new_elements[i] = res.node;
          // new_children[i] = res.trackElm || res.elm;
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
        "[For _refresh] removed:",
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
      state.items = new_items.slice();
      state.children = new_elements;
      // _elements = new_elements;
      // _$children = new_children;
      // _original_items = new_original_items;
      _index_computed = new_index_computed;

      return diff;
    },
  };

  if (isArrayRef(each)) {
    each.subscribe({
      // @ts-ignore
      onPatch(action: {
        type: "insert" | "delete" | "update" | "move" | "swap";
        index: number;
        item: T;
        items?: T[];
        deleteCount?: number;
        from?: number;
        to?: number;
      }) {
        if (!state.rendered) {
          return;
        }
        console.log("[primitive]For - ctx.onPatch - handle patch", action);
        if (action.type === "insert" && action.items !== undefined) {
          methods.insert(action.index, action.items);
        }
        if (action.type === "delete" && action.deleteCount !== undefined) {
          methods.remove(action.index, action.deleteCount);
        }
        // if (action.type === "update") {
        //   methods.update(action.index, action.item);
        // }
        if (
          action.type === "move" &&
          action.from !== undefined &&
          action.to !== undefined
        ) {
          methods.move(action.from, action.to);
        }
        if (
          action.type === "swap" &&
          action.from !== undefined &&
          action.to !== undefined
        ) {
          methods.swap(action.from, action.to);
        }
      },
      onChange(v: any) {
        console.log("[primitive]For - ctx.onChange", v, state.rendered);
        // if (!state.rendered) {
        //   return;
        // }
        methods.refresh(v);
      },
    });
  }

  const _children = isRef(each) ? each.value : each;
  for (let i = 0; i < _children.length; i += 1) {
    // const v = _children[i];
    // const idx = _children.indexOf(v);
    // const r = render(v, ref(idx));
    // if (r) {
    //   state.children.push(r);
    // }
    const child = _children[i];
    state.items[i] = child;
    // const idx = _children.indexOf(child);
    const idx_computed = create_idx(child);
    // const res = render_result(() => );
    const res = render(child, idx_computed);
    state.children.push(res);
    _original_items[i] = child;
    _index_computed[i] = idx_computed;
    // _elements[i] = res.node;
    // _$children[i] = res.trackElm || res.elm;
  }

  return {
    t: "for",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = v;
    },
    state,
    children: state.children,
    render() {
      return $elm;
    },
    hydrate(start_dom: any, parent_dom?: any) {
      const nodes = (isRef(each) ? each.value : each) || [];

      // Create anchor if not already created
      if (!$anchor) {
        // anchor = safeCreateTextNode("");
        $elm = $anchor;
      }

      let cur_dom = start_dom;

      for (let i = 0; i < nodes.length; i += 1) {
        const item = nodes[i];
        state.items[i] = item;
        // Create computed index that depends on `each`
        _original_items[i] = item;
        const idx_computed = create_idx(item);
        _index_computed[i] = idx_computed;
        let res = render(item, idx_computed);
        // if (typeof res === "function") {
        //   res = res();
        // }

        if (!res) {
          _elements[i] = null;
          continue;
        }

        if (isElement(res)) {
          _elements[i] = res;
          if (cur_dom && typeof (res as any).hydrate === "function") {
            (res as any).hydrate(cur_dom);
            _$children[i] = res.$elm;
            // const $sibling = (() => {
            //   if (res.$elm) {
            //     return res.$elm.getNextSibling();
            //   }
            //   return cur_dom.getNextSibling();
            // })();
            // cur_dom = $sibling;
          } else if (cur_dom) {
            res.$elm = cur_dom;
            // res.render();
            // _$children[i] = res.$elm;
            // cur_dom = cur_dom.getNextSibling();
          }
        }
      }

      const $parent = (() => {
        if (parent_dom) {
          return parent_dom;
        }
        if (start_dom) {
          return start_dom.getParentNode();
        }
        return null;
      })();
      if ($parent) {
        if (cur_dom) {
          // host.insertBefore($parent, anchor, currentDom);
          $parent.insertBefore(cur_dom, $anchor);
        } else {
          // host.appendChild($parent, anchor);
          $parent.appendChild($anchor);
        }
      }

      state.rendered = true;

      if (onMounted) {
        onMounted({ target: $anchor });
      }

      // Call onMounted for children
      for (let i = 0; i < _elements.length; i += 1) {
        const el = _elements[i];
        if (isElement(el) && el.onMounted) {
          el.onMounted({ target: el.$elm });
        }
      }
      return $anchor;
    },
    onMounted(event: MountedEvent) {
      state.rendered = true;
      if (onMounted) {
        onMounted(event);
      }
      // for (const child of state.children) {
      //   if (isElement(child) && child.onMounted) {
      //     child.onMounted({ target: child.$elm });
      //   }
      // }
    },
    beforeUnmounted() {
      if (beforeUnmounted) {
        beforeUnmounted();
      }
    },
    onUnmounted() {
      state.rendered = true;
      if (onUnmounted) {
        onUnmounted();
      }
      for (let i = 0; i < _elements.length; i += 1) {
        const component = _elements[i];
        if (!component) {
          continue;
        }
        if (
          isElement(component) &&
          typeof component.onUnmounted === "function"
        ) {
          component.onUnmounted();
        }
      }

      // Remove DOM nodes
      if ($elm && $elm.removeChildren) {
        $elm.removeChildren();
      }
      // const $parent = host.getParentNode(anchor);
      // const $parent = $anchor.getParentNode();
      // if ($parent) {
      //   for (const elm of _$children) {
      //     const $pa = elm.getParentNode();
      //     if (elm && $pa === $parent) {
      //       try {
      //         // host.removeChild($parent, elm);
      //         $parent.removeChild(elm);
      //       } catch (e) {
      //         // ignore
      //       }
      //     }
      //   }
      // }

      state.rendered = false;
      state.items = [];
      _elements = [];
      _$children = [];
      _original_items = [];
      _index_computed = [];
    },
  };
}
