import { isRef, Ref, registryGet, registrySet } from "@timeless/reactive";

import { getHost } from "@/host";
import { safeCreateTextNode, safeCreateDocumentFragment } from "@/util/env";

import { ViewProps, TimelessElement, isElement } from "./view";

export function For<T>(
  props: ViewProps & {
    each: T[] | Ref<T[]>;
    render: (
      item: T,
      idx: number,
    ) => TimelessElement | (() => TimelessElement) | null;
    key?: string;
  },
) {
  const host = getHost();
  const { each, key, render, onMounted, onUnmounted, ...restProps } = props;

  const _key = key;
  let _mounted = false;
  let _values: T[] = [];
  let _elements: (TimelessElement | null)[] = [];
  let _$children: (TimelessElement["$elm"] | null)[] = [];

  const anchor = safeCreateTextNode("");
  const $elm = anchor as any;

  const _existing_map = new Map();

  const methods = {
    _render_item(item: T, index: number) {
      const rr: {
        node: null | TimelessElement;
        elm: null | TimelessElement["$elm"];
        trackElm?: null | TimelessElement["$elm"];
        empty?: boolean;
        delete?: boolean;
      } = (() => {
        let view$ = render(item, index);
        // 处理 h() 返回的延迟执行函数
        if (typeof view$ === "function") {
          view$ = view$();
        }
        if (!view$) {
          return { node: null, elm: null, trackElm: null, empty: true };
        }
        const elm = view$.render();
        return { node: view$, elm, trackElm: view$.$elm };
      })();
      return rr;
    },
    _insert(index: number, items: T[]) {
      // const new_children: (TimelessElement | null)[] = new Array(items.length);
      // const new_elms: (HTMLElement | Text | null)[] = new Array(items.length);
      const $base = _$children[index] || anchor;
      const $parent = host.getParentNode(anchor);

      if (!$parent) return;

      const $fragment = safeCreateDocumentFragment();
      for (let i = 0; i < items.length; i++) {
        const item_prepare_insert = items[i];
        _values.splice(index + i, 0, item_prepare_insert);
        // @todo index + i 改为是 Ref 类型
        let res = render(item_prepare_insert, index + i);
        // 处理 h() 返回的延迟执行函数
        if (typeof res === "function") {
          res = res();
        }
        (() => {
          _elements.splice(index + i, 0, res);
          if (!res) {
            return;
          }
          if (isElement(res)) {
            const $elm_prepare_insert = res.render();
            _$children.splice(index + i, 0, res.$elm);
            if ($elm_prepare_insert) {
              host.appendChild($fragment, $elm_prepare_insert);
            }
          }
        })();
      }
      host.insertBefore($parent, $fragment, $base);
      // console.log("[headless]For - insert items", index, items, _$children);
    },
    _remove(index: number, count: number) {
      const $parent = host.getParentNode(anchor);
      if (!$parent) return;

      for (let i = 0; i < count; i += 1) {
        const elm = _$children[index + i];
        // console.log(i, index + i, elm, _$children);
        if (elm && host.getParentNode(elm) === $parent) {
          try {
            host.removeChild($parent, elm);
          } catch (e) {
            // ignore
          }
        }
        const item = _values[index + i];
        if (_existing_map.has(item)) {
          _existing_map.delete(item);
        }
        _values.splice(index + i, 1);
        _elements.splice(index + i, 1);
        _$children.splice(index + i, 1);
      }
    },
    _update(index: number, item: any) {
      const $parent = host.getParentNode(anchor);
      if (!$parent) return;

      const res = methods._render_item(item, index);
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
        // if (res.onMounted) {
        //   res.onMounted();
        // }
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

      const $parent = host.getParentNode(anchor);
      if (!$parent) return;

      // 1. Prepare target state
      const new_elements: (TimelessElement | null)[] = new Array(
        new_items.length,
      );
      const new_children: (TimelessElement["$elm"] | null)[] = new Array(
        new_items.length,
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

      // 3. Diff Phase: Identify operations
      const added_nodes: {
        node: TimelessElement;
        elm: TimelessElement["$elm"];
      }[] = [];
      const removed_nodes: {
        elm: TimelessElement["$elm"] | null;
        component: TimelessElement | null;
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

          // Always reuse existing DOM element when key matches
          new_elements[i] = prev_elements[oldIndex];
          new_children[i] = prev_children[oldIndex];

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
          // Added (New)
          const res = methods._render_item(item, i);
          new_elements[i] = res.node;
          new_children[i] = res.trackElm || res.elm; // Use trackElm
          if (res.node && res.elm && isElement(res.node)) {
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
      // console.log("1. removed_nodes", removed_nodes);
      // console.log("2. added_nodes", added_nodes);
      // console.log("3. updated_nodes", updated_nodes);
      // 4. Patch Phase: Apply to DOM

      // 4.1 Remove nodes
      for (const { elm, component } of removed_nodes) {
        if (elm && host.getParentNode(elm) === $parent) {
          host.removeChild($parent, elm);
        }
        if (component && isElement(component)) {
          if (typeof component.onUnmounted === "function") {
            component.onUnmounted();
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
        if (typeof node.onMounted === "function") {
          node.onMounted(elm);
        }
      }

      // 5. Update State
      _values = new_items;
      _elements = new_elements;
      _$children = new_children;
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
    each._subscribe(ctx);
  }
  return {
    t: "for",
    $elm,
    _props: { each, render, key },
    _values,
    _elements,
    _$children,
    render() {
      const nodes = (isRef(each) ? each.value : each) || [];
      // console.log("[For] render", nodes);

      const $fragment = safeCreateDocumentFragment();
      for (let i = 0; i < nodes.length; i += 1) {
        const item = nodes[i];
        // console.log("before mounted", i, item);
        _values[i] = item;
        let res = render(item, i);
        // 处理 h() 返回的延迟执行函数
        if (typeof res === "function") {
          res = res();
        }
        (() => {
          if (!res) {
            _elements[i] = null;
            return;
          }
          if (isElement(res)) {
            _elements[i] = res;
            const $sub = res.render();
            _$children[i] = res.$elm;
            if ($sub) {
              host.appendChild($fragment, $sub);
            }
          } else {
            _elements[i] = null;
          }
        })();
      }
      host.appendChild($fragment, anchor); // Add anchor to fragment
      _mounted = true;

      if (onMounted) {
        // onMounted($elm); // $elm is anchor.
        // We can pass anchor, but user might expect the container.
        // Since there is no container, we pass anchor.
        onMounted(anchor);
      }
      // onMounted will be called by parent with the result of render(), which is the fragment.
      // But props.onMounted expects an element?
      return $fragment; // Return fragment with items + anchor
    },
    hydrate(startDom: any, parentDom?: any) {
      const nodes = (isRef(each) ? each.value : each) || [];
      let currentDom = startDom;

      for (let i = 0; i < nodes.length; i += 1) {
        const item = nodes[i];
        _values[i] = item;

        let res = render(item, i);
        if (typeof res === "function") {
          res = res();
        }

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

      // The anchor is after the last list item (or a text node marker)
      // For SSR, we need to handle this specially - anchor might be a comment or text node
      // In most cases, anchor should be placed after the list items
      // For now, we'll create a new anchor if needed or use the currentDom
      const $parent = parentDom || (startDom ? host.getParentNode(startDom) : null);
      if ($parent) {
        // Insert anchor after the last child element
        if (currentDom) {
          host.insertBefore($parent, anchor, currentDom);
        } else {
          host.appendChild($parent, anchor);
        }
      }

      _mounted = true;

      if (onMounted) {
        onMounted(anchor);
      }

      // Call onMounted for children
      for (let i = 0; i < _elements.length; i += 1) {
        const el = _elements[i];
        if (isElement(el) && el.onMounted) {
          el.onMounted(el.$elm);
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
      // $elm.innerHTML = ""; // This was valid when $elm was a wrapper. Now $elm is anchor.
    },
  };
}
