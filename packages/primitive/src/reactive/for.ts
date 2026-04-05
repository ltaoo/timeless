import {
  isRef,
  Ref,
  ref,
  registryGet,
  registrySet,
  computed,
} from "@timeless/reactive";

import { ViewProps, TimelessElement, isElement } from "@/content/view";
import { getHost } from "@/host";
import { safeCreateTextNode, safeCreateDocumentFragment } from "@/util/env";
// import { commitTree, isDescriptor as isVNodeDescriptor, mount } from "@/vnode";
// import type { VNode } from "@/vnode/types";

export function For<T>(
  props: ViewProps & {
    key?: string;
    each: T[] | Ref<T[]>;
    render: (item: T, idx: Ref<number>) => TimelessElement | null;
  },
) {
  const host = getHost();
  // const scheduler = getRendererScheduler();
  // const renderer = getRenderer();
  const { key, each, render, onMounted, onUnmounted } = props;
  // const lineH = 24;

  const _key = key;
  let _mounted = false;
  let _values: T[] = [];
  let _elements: (TimelessElement | null)[] = [];
  let _$children: (any | null)[] = [];
  let _original_items: T[] = []; // Store original item references for indexOf lookup
  let _index_computed: Ref<number>[] = []; // Computed indexes that depend on `each`

  // Helper to create a computed index that depends on `each`
  const createIndexComputed = (originalItem: T): Ref<number> => {
    return computed(each, () => {
      // Use refarr's indexOf if available (supports registry lookup)
      if (isRef(each) && typeof (each as any).indexOf === "function") {
        return (each as any).indexOf(originalItem);
      }
      // Fallback for plain arrays
      const arr = isRef(each) ? each.value : each;
      return arr ? arr.indexOf(originalItem) : -1;
    });
  };

  let anchor: any = null;
  let $elm: any = null;

  const _existing_map = new Map();

  // const isVNode = (v: any): v is VNode => {
  //   const k = v?.kind;
  //   return k === "element" || k === "text" || k === "fragment";
  // };

  // const destroyVNode = (node: VNode) => {
  //   if (node.kind === "element" || node.kind === "fragment") {
  //     for (const child of node.children) destroyVNode(child);
  //   }
  //   renderer.removeNode(node);
  // };

  const renderResult = (input: any) => {
    let res = input;
    if (typeof res === "function") res = res();
    if (!res) return { node: null, elm: null, trackElm: null, empty: true };

    // if (isVNodeDescriptor(res)) {
    //   const vnode = mount(res as any, scheduler);
    //   commitTree(vnode, renderer);
    //   const elm = (vnode as any)._hostNode ?? null;
    //   return { node: vnode, elm, trackElm: elm };
    // }

    if (isElement(res)) {
      const elm = res.render();
      return { node: res, elm, trackElm: res.$elm };
    }

    return { node: null, elm: null, trackElm: null, empty: true };
  };

  const methods = {
    _render_item(item: T, idxComputed: Ref<number>) {
      const rr: {
        node: null | TimelessElement;
        elm: null | any;
        trackElm?: null | any;
        empty?: boolean;
        delete?: boolean;
      } = (() => {
        const base = renderResult(() => render(item, idxComputed));
        if (!base.elm) return base;
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
    _insert(index: number, items: T[]) {
      const $base = _$children[index] || anchor;
      const $parent = host.getParentNode(anchor);

      if (!$parent) return;

      const $fragment = safeCreateDocumentFragment();
      for (let i = 0; i < items.length; i++) {
        const item_prepare_insert = items[i];
        // Create computed index that depends on `each`
        const idxComputed = createIndexComputed(item_prepare_insert);
        _values.splice(index + i, 0, item_prepare_insert);
        _original_items.splice(index + i, 0, item_prepare_insert);
        _index_computed.splice(index + i, 0, idxComputed);
        const res = renderResult(() =>
          render(item_prepare_insert, idxComputed),
        );
        _elements.splice(index + i, 0, res.node);
        // _$children.splice(index + i, 0, res.trackElm || res.elm);
        if (res.elm) {
          host.appendChild($fragment, res.elm);
        }
      }
      // No need to manually update computed indexes - they auto-recompute
      host.insertBefore($parent, $fragment, $base);
    },
    _remove(index: number, count: number) {
      const $parent = host.getParentNode(anchor);
      if (!$parent) return;

      for (let i = 0; i < count; i += 1) {
        const elm = _$children[index];
        if (elm && host.getParentNode(elm) === $parent) {
          try {
            host.removeChild($parent, elm);
          } catch (e) {
            // ignore
          }
        }
        const item = _values[index];
        if (_existing_map.has(item)) {
          _existing_map.delete(item);
        }
        _values.splice(index, 1);
        _elements.splice(index, 1);
        _$children.splice(index, 1);
        _original_items.splice(index, 1);
        _index_computed.splice(index, 1);
      }
      // No need to manually update computed indexes - they auto-recompute
    },
    _update(index: number, item: any) {
      const $parent = host.getParentNode(anchor);
      if (!$parent) return;

      // Reuse existing computed index or create new one
      let idxComputed = _index_computed[index];
      if (!idxComputed) {
        idxComputed = createIndexComputed(item);
        _index_computed[index] = idxComputed;
        _original_items[index] = item;
      }

      const res = methods._render_item(item, idxComputed);
      if (!res) {
        return;
      }
      if (res.delete) {
        return;
      }
      const old = _$children[index];
      if (old && host.getParentNode(old) === $parent && res.elm) {
        host.replaceChild($parent, res.elm, old);
      } else if (res.elm) {
        host.insertBefore($parent, res.elm, anchor);
      }

      const oldItem = _values[index];
      if (oldItem !== item && _existing_map.has(oldItem)) {
        _existing_map.delete(oldItem);
      }

      _values[index] = item;
      _elements[index] = res.node;
      _$children[index] = res.elm;
    },
    _refresh(v: T[]) {
      console.log(
        "[For _refresh] called with",
        v.length,
        "items, current:",
        _values.length,
      );
      const new_items = v;
      const prev_items = _values;
      const prev_elements = _elements;
      const prev_children = _$children;
      const prev_original_items = _original_items;
      const prev_index_computed = _index_computed;

      const $parent = host.getParentNode(anchor);
      if (!$parent) return;

      // 1. Prepare target state
      const new_elements: (TimelessElement | null)[] = new Array(
        new_items.length,
      );
      const new_children: (any | null)[] = new Array(new_items.length);
      const new_original_items: T[] = new Array(new_items.length);
      const new_index_computed: Ref<number>[] = new Array(new_items.length);

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

      // 3. Diff Phase: Identify operations
      const added_nodes: {
        node: any;
        elm: any;
      }[] = [];
      const removed_nodes: {
        elm: any | null;
        component: any | null;
      }[] = [];

      // Iterate new items -> Determine Reused vs Added
      for (let i = 0; i < new_items.length; i++) {
        const item = new_items[i];
        const k = _key && item ? (item as any)[_key] : item;
        const prev_indices = old_map.get(k);

        if (prev_indices && prev_indices.length > 0) {
          // Reused - same key found in old list
          const oldIndex = prev_indices.shift()!;
          const oldItem = prev_items[oldIndex];

          // Reuse existing DOM element and computed index
          new_elements[i] = prev_elements[oldIndex];
          new_children[i] = prev_children[oldIndex];
          new_original_items[i] = prev_original_items[oldIndex];
          new_index_computed[i] = prev_index_computed[oldIndex];

          // No need to manually update index - computed auto-recomputes based on `each`

          // If item data changed, update the reactive proxy so computed values re-evaluate
          if (item !== oldItem && oldItem && typeof oldItem === "object") {
            const proxy = registryGet(oldItem);
            if (proxy && typeof (proxy as any).as === "function") {
              (proxy as any).as(item);
              // Update registry to map new item to the same proxy
              registrySet(item, proxy);
            }
          }
        } else {
          // Added (New) - create new computed index and render
          const idxComputed = createIndexComputed(item);
          new_original_items[i] = item;
          new_index_computed[i] = idxComputed;
          const res = methods._render_item(item, idxComputed);
          new_elements[i] = res.node;
          new_children[i] = res.trackElm || res.elm;
          if (res.node && res.elm && isElement(res.node as any)) {
            added_nodes.push({ node: res.node, elm: res.elm });
          }
        }
      }

      // Remaining items in old_map are Removed
      for (const indices of old_map.values()) {
        for (const index of indices) {
          removed_nodes.push({
            elm: prev_children[index],
            component: prev_elements[index],
          });
        }
      }

      console.log(
        "[For _refresh] removed:",
        removed_nodes.length,
        "added:",
        added_nodes.length,
      );

      // 4. Patch Phase: Apply to DOM

      // 4.1 Remove nodes
      for (const { elm, component } of removed_nodes) {
        if (elm && host.getParentNode(elm) === $parent) {
          host.removeChild($parent, elm);
        }
        if (component) {
          if (isElement(component)) {
            if (typeof component.onUnmounted === "function") {
              component.onUnmounted();
            }
          }
        }
      }

      // 4.2 Reorder / Insert nodes
      // Backward loop for correct insertion relative to anchor
      let next_sibling: any | null = anchor;
      for (let i = new_children.length - 1; i >= 0; i--) {
        const node = new_children[i];
        if (!node) continue;

        // If node is already in correct position (immediately before nextSibling), skip.
        if (host.getNextSibling(node) === next_sibling) {
          next_sibling = node;
          continue;
        }

        if ($parent) {
          // If node is already in DOM elsewhere, insertBefore moves it.
          host.insertBefore($parent, node, next_sibling);
        }

        next_sibling = node;
      }

      // 4.3 Trigger Lifecycle (Mounted)
      for (const { node, elm } of added_nodes) {
        if (node && typeof node.onMounted === "function") {
          node.onMounted({ target: elm });
        }
      }

      // 5. Update State
      // Use slice() to create a copy, preventing _values from referencing _local_value directly
      // This ensures prev_items reflects the state before reverse/sort operations
      _values = new_items.slice();
      _elements = new_elements;
      _$children = new_children;
      _original_items = new_original_items;
      _index_computed = new_index_computed;
    },
  };

  const ctx = {
    onPatch(change: any) {
      // console.log("[headless]For - ctx.onPatch - handle patch", change);
      if (change.type === "insert") {
        methods._insert(change.index, change.items);
      }
      if (change.type === "delete") {
        methods._remove(change.index, change.deleteCount);
      }
      if (change.type === "update") {
        methods._update(change.index, change.item);
      }
    },
    onChange(v: T[] = []) {
      // console.log('[headless]For - ctx.onChange', v);
      if (!_mounted) {
        return;
      }
      methods._refresh(v);
    },
  };

  if (isRef(each)) {
    // @ts-ignore
    each.subscribe(ctx);
  }

  const state: {
    children: TimelessElement[];
  } = {
    children: [],
  };

  const _c = (() => {
    if (isRef(each)) {
      return each.value;
    }
    return each;
  })();
  for (let i = 0; i < _c.length; i += 1) {
    const v = _c[i];
    const idx = _c.indexOf(v);
    const r = render(v, ref(idx));
    if (r) {
      state.children.push(r);
    }
  }

  return {
    t: "for",
    get $elm() {
      return $elm;
    },
    set $elm(v) {
      $elm = $elm;
    },
    // _props: { each, render, key },
    // _values,
    // _elements,
    // _$children,
    value: "",
    children: state.children,

    render() {
      const nodes = (isRef(each) ? each.value : each) || [];

      // Create anchor if not already created
      if (!anchor) {
        anchor = safeCreateTextNode("");
        $elm = anchor;
      }

      const $fragment = safeCreateDocumentFragment();
      for (let i = 0; i < nodes.length; i += 1) {
        const item = nodes[i];
        _values[i] = item;
        // Create computed index that depends on `each`
        _original_items[i] = item;
        const idxComputed = createIndexComputed(item);
        _index_computed[i] = idxComputed;
        const res = renderResult(() => render(item, idxComputed));
        _elements[i] = res.node;
        _$children[i] = res.trackElm || res.elm;
        if (res.elm) {
          host.appendChild($fragment, res.elm);
        }
      }
      host.appendChild($fragment, anchor);
      _mounted = true;

      if (onMounted) {
        onMounted(anchor);
      }
      return $fragment;
    },
    hydrate(startDom: any, parentDom?: any) {
      const nodes = (isRef(each) ? each.value : each) || [];

      // Create anchor if not already created
      if (!anchor) {
        anchor = safeCreateTextNode("");
        $elm = anchor;
      }

      let currentDom = startDom;

      for (let i = 0; i < nodes.length; i += 1) {
        const item = nodes[i];
        _values[i] = item;
        // Create computed index that depends on `each`
        _original_items[i] = item;
        const idxComputed = createIndexComputed(item);
        _index_computed[i] = idxComputed;

        let res = render(item, idxComputed);
        // if (typeof res === "function") {
        //   res = res();
        // }

        if (!res) {
          _elements[i] = null;
          continue;
        }

        if (isElement(res)) {
          _elements[i] = res;
          if (currentDom && typeof (res as any).hydrate === "function") {
            (res as any).hydrate(currentDom);
            _$children[i] = res.$elm;
            currentDom = host.getNextSibling(res.$elm || currentDom);
          } else if (currentDom) {
            res.$elm = currentDom;
            res.render();
            _$children[i] = res.$elm;
            currentDom = host.getNextSibling(currentDom);
          }
        }
      }

      const $parent =
        parentDom || (startDom ? host.getParentNode(startDom) : null);
      if ($parent) {
        if (currentDom) {
          host.insertBefore($parent, anchor, currentDom);
        } else {
          host.appendChild($parent, anchor);
        }
      }

      _mounted = true;

      if (onMounted) {
        onMounted({ target: anchor });
      }

      // Call onMounted for children
      for (let i = 0; i < _elements.length; i += 1) {
        const el = _elements[i];
        if (isElement(el) && el.onMounted) {
          el.onMounted({ target: el.$elm });
        }
      }

      return anchor;
    },
    onUnmounted() {
      if (onUnmounted) {
        onUnmounted();
      }
      for (let i = 0; i < _elements.length; i += 1) {
        const component = _elements[i];
        if (!component) continue;
        if (isElement(component)) {
          if (typeof component.onUnmounted === "function") {
            component.onUnmounted();
          }
        }
      }

      // Remove DOM nodes
      const $parent = host.getParentNode(anchor);
      if ($parent) {
        for (const elm of _$children) {
          if (elm && host.getParentNode(elm) === $parent) {
            try {
              host.removeChild($parent, elm);
            } catch (e) {
              // ignore
            }
          }
        }
      }

      _mounted = false;
      _values = [];
      _elements = [];
      _$children = [];
      _original_items = [];
      _index_computed = [];
    },
  };
}
