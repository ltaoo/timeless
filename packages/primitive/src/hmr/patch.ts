import { isElement, TimelessElement } from "@/content/type";

// ─── Action types ────────────────────────────────────────────────────────────

export type SetTextAction = {
  type: "set_text";
  elm: any; // VNodeView — null when not yet mounted
  value: string;
};

export type SetStyleAction = {
  type: "set_style";
  elm: any;
  style: Record<string, any>;
};

export type SetStyleSetAction = {
  type: "set_style_set";
  elm: any;
  styleSet: string[];
};

export type SetAttributeAction = {
  type: "set_attribute";
  elm: any;
  key: string;
  value: string;
};

export type RemoveAttributeAction = {
  type: "remove_attribute";
  elm: any;
  key: string;
};

export type ReplaceAction = {
  type: "replace";
  parent: TimelessElement | null;
  index: number;
  old_element: TimelessElement;
  new_element: TimelessElement;
};

export type InsertChildAction = {
  type: "insert_child";
  parent: TimelessElement;
  element: TimelessElement;
  index: number;
};

export type RemoveChildAction = {
  type: "remove_child";
  parent: TimelessElement;
  element: TimelessElement;
  index: number;
};

export type SwapEventsAction = {
  type: "swap_events";
  /** VNodeView that owns the DOM node */
  elm: any;
  old_events: any;
  new_events: any;
};

export type PatchAction =
  | SetTextAction
  | SetStyleAction
  | SetStyleSetAction
  | SetAttributeAction
  | RemoveAttributeAction
  | ReplaceAction
  | InsertChildAction
  | RemoveChildAction
  | SwapEventsAction;

// ─── PatchOptions ────────────────────────────────────────────────────────────

export type PatchOptions = {
  buildAndRender: (elm: TimelessElement) => { vnode: any; dom: any };
  platform?: {
    hasParent(dom: any): boolean;
    replaceChild(oldDom: any, newDom: any): void;
    removeChild(dom: any): void;
    insertChild(parentDom: any, childDom: any, index: number): void;
    insertBeforeAnchor(anchorDom: any, childDom: any): void;
  };
};

// ─── diff (transfer $elm from old → new) ─────────────────────────────────────

/**
 * Walk old and new element trees in parallel.
 * For matching types: transfer $elm from old to new, emit minimal DOM updates.
 * For type mismatches: emit replace (old destroyed, new built fresh).
 *
 * After this function, new_element owns all transferred $elm references and
 * old_element.$elm is null (making old subscriptions no-ops).
 */
function diff_element_internal(
  old_element: TimelessElement,
  new_element: TimelessElement,
  parent: TimelessElement | null,
  index: number,
): PatchAction[] {
  // Type mismatch → full replace (old destroyed, new built by caller)
  if (old_element.t !== new_element.t) {
    return [{ type: "replace", parent, index, old_element, new_element }];
  }

  // ── Transfer $elm from old to new, null out old ──
  new_element.$elm = old_element.$elm;
  old_element.$elm = null as any;

  // Dispose old reactive subscriptions (Show, For) so they don't fire with
  // stale closures. The new element already has fresh subscriptions that will
  // use the transferred $elm.
  if (typeof (old_element as any)._hmr_dispose === "function") {
    (old_element as any)._hmr_dispose();
  }

  const actions: PatchAction[] = [];

  // ── Text node ──
  if (new_element.t === "text") {
    if (old_element.state.value !== new_element.state.value) {
      actions.push({
        type: "set_text",
        elm: new_element.$elm,
        value: new_element.state.value,
      });
    }
    return actions;
  }

  // ── Style diff ──
  actions.push(...diff_style(old_element, new_element));

  // ── Class diff ──
  actions.push(...diff_style_set(old_element, new_element));

  // ── Attributes diff ──
  actions.push(...diff_attributes(old_element, new_element));

  // ── Events: teardown old, setup new via $elm methods ──
  // Always swap — even if the event map looks "equal", the function references
  // are different closures from the new module.
  if (old_element.events || new_element.events) {
    actions.push({
      type: "swap_events",
      elm: new_element.$elm,
      old_events: old_element.events,
      new_events: new_element.events,
    });
  }

  // ── Recurse children ──
  const old_children = old_element.children || [];
  const new_children = new_element.children || [];
  const len = Math.min(old_children.length, new_children.length);

  for (let i = 0; i < len; i++) {
    const old_child = old_children[i];
    const new_child = new_children[i];
    if (
      old_child &&
      new_child &&
      isElement(old_child) &&
      isElement(new_child)
    ) {
      actions.push(
        ...diff_element_internal(old_child, new_child, new_element, i),
      );
    }
  }

  // Remove old children that no longer exist (high-index first)
  for (let i = old_children.length - 1; i >= len; i--) {
    const child = old_children[i];
    if (child && isElement(child)) {
      actions.push({
        type: "remove_child",
        parent: new_element,
        element: child,
        index: i,
      });
    }
  }

  // Insert new children that didn't exist before
  for (let i = len; i < new_children.length; i++) {
    const child = new_children[i];
    if (child && isElement(child)) {
      actions.push({
        type: "insert_child",
        parent: new_element,
        element: child,
        index: i,
      });
    }
  }

  return actions;
}

/**
 * Public entry point for diffing two element trees.
 */
export function diff_element(
  old_element: TimelessElement,
  new_element: TimelessElement,
): PatchAction[] {
  return diff_element_internal(old_element, new_element, null, -1);
}

// ─── patch ───────────────────────────────────────────────────────────────────

export function patch(
  old_element: TimelessElement,
  new_element: TimelessElement,
  options: PatchOptions,
) {
  const actions = diff_element(old_element, new_element);

  for (const action of actions) {
    switch (action.type) {
      case "set_text":
        if (action.elm) action.elm.setText(action.value);
        break;
      case "set_style":
        if (action.elm) action.elm.setStyle(action.style);
        break;
      case "set_style_set":
        if (action.elm) action.elm.setStyleSet(action.styleSet);
        break;
      case "set_attribute":
        if (action.elm) action.elm.setAttribute(action.key, action.value);
        break;
      case "remove_attribute":
        if (action.elm) action.elm.removeAttribute(action.key);
        break;

      case "swap_events": {
        const $elm = action.elm;
        if (!$elm) break;
        // Teardown old handlers, setup new — delegated to $elm (platform layer)
        $elm.teardownEventListener?.(action.old_events);
        $elm.setupEventListener?.(action.new_events);
        break;
      }

      case "replace": {
        const old$elm = action.old_element.$elm;
        if (!old$elm) break;

        // Anchor-based elements (fragment, show, for): children are siblings
        // in the parent DOM. Must remove them before replacing the anchor.
        const oldIsAnchorBased =
          action.old_element.t === "fragment" ||
          action.old_element.t === "show" ||
          action.old_element.t === "for";
        if (oldIsAnchorBased) {
          old$elm.removeChildren?.();
        }

        const oldDom = old$elm.get$elm?.();
        const plat = options.platform;
        if (!oldDom || !(plat ? plat.hasParent(oldDom) : oldDom.parentNode)) break;

        let newVNode: any;
        // Portal self-manages DOM (document.body.appendChild).
        if (action.new_element.t === "portal") {
          const r = options.buildAndRender(action.new_element);
          newVNode = r.vnode;
          if (plat) {
            plat.removeChild(oldDom);
          } else {
            oldDom.parentNode.removeChild(oldDom);
          }
        } else {
          const r = options.buildAndRender(action.new_element);
          newVNode = r.vnode;
          if (!r.dom) break;
          if (plat) {
            plat.replaceChild(oldDom, r.dom);
          } else {
            oldDom.parentNode.replaceChild(r.dom, oldDom);
          }
        }

        // Sync parent's children array and internal tracking
        if (action.parent && action.index >= 0) {
          if (action.parent.children) {
            action.parent.children[action.index] = action.new_element;
          }
          const parent$elm = action.parent.$elm;
          if (parent$elm) {
            const newDom = action.new_element.$elm?.get$elm?.();
            if (newDom && newVNode) {
              // In-place replacement avoids index shifting from untrack+track
              if (parent$elm.replaceTrackedChild) {
                parent$elm.replaceTrackedChild(action.index, newDom, action.new_element, newVNode);
              } else {
                parent$elm.untrackChild?.(action.index);
                parent$elm.trackChild?.(newDom, action.new_element, newVNode, action.index);
              }
            }
          }
        }
        break;
      }

      case "insert_child": {
        // Portal self-manages DOM placement (document.body.appendChild).
        if (action.element.t === "portal") {
          const { vnode } = options.buildAndRender(action.element);
          // Track in parent so removeChildren() can clean up later
          const portalDom = action.element.$elm?.get$elm?.();
          if (portalDom) {
            action.parent.$elm?.trackChild?.(portalDom, action.element, vnode, action.index);
          }
          break;
        }

        const parent$elm = action.parent.$elm;
        if (!parent$elm) break;
        const parentDom = parent$elm.get$elm?.();
        if (!parentDom) break;

        const { vnode: childVNode, dom: childDom } = options.buildAndRender(action.element);
        if (!childDom) break;

        const plat = options.platform;

        // Anchor-based elements (fragment, show, for): insert before anchor
        if (
          action.parent.t === "fragment" ||
          action.parent.t === "show" ||
          action.parent.t === "for"
        ) {
          if (plat) {
            plat.insertBeforeAnchor(parentDom, childDom);
          } else if (parentDom.parentNode) {
            parentDom.parentNode.insertBefore(childDom, parentDom);
          }
        } else {
          if (plat) {
            plat.insertChild(parentDom, childDom, action.index);
          } else {
            const refNode = parentDom.childNodes[action.index] || null;
            parentDom.insertBefore(childDom, refNode);
          }
        }

        // For anchor-based children (fragment, show, for), the rendered DOM is
        // a DocumentFragment (empty after insertion). Track the anchor node
        // instead so the parent can locate/remove this child later.
        const childIsAnchorBased =
          action.element.t === "fragment" ||
          action.element.t === "show" ||
          action.element.t === "for";
        const trackDom = childIsAnchorBased
          ? action.element.$elm?.get$elm?.() || childDom
          : childDom;

        // Sync parent's internal tracking so removeChildren() works later
        parent$elm.trackChild?.(trackDom, action.element, childVNode, action.index);
        break;
      }

      case "remove_child": {
        const child$elm = action.element.$elm;
        if (!child$elm) break;

        // Anchor-based elements (fragment, show, for): children are siblings
        // in the parent DOM, not contained in a single node. Must remove all
        // tracked children first, then remove the anchor itself.
        const isAnchorBased =
          action.element.t === "fragment" ||
          action.element.t === "show" ||
          action.element.t === "for";
        if (isAnchorBased) {
          child$elm.removeChildren?.();
        }

        const childRaw = child$elm.get$elm?.();
        const plat = options.platform;
        if (plat) {
          if (childRaw) plat.removeChild(childRaw);
        } else if (childRaw?.parentNode) {
          childRaw.parentNode.removeChild(childRaw);
        }

        // Sync parent's internal tracking
        const parent$elm = action.parent.$elm;
        if (parent$elm) {
          parent$elm.untrackChild?.(action.index);
        }
        break;
      }
    }
  }

  return actions;
}

// ─── diff helpers ────────────────────────────────────────────────────────────
// These compare old vs new state and emit actions targeting new_element.$elm.
// They do NOT mutate either element — new_element already has the correct state.

function diff_style(
  oldElm: TimelessElement,
  newElm: TimelessElement,
): PatchAction[] {
  const oldStyle = oldElm.state?.style;
  const newStyle = newElm.state?.style;
  if (!newStyle && !oldStyle) return [];

  const oldKeys = oldStyle ? Object.keys(oldStyle) : [];
  const newKeys = newStyle ? Object.keys(newStyle) : [];

  let changed = false;
  for (const k of newKeys) {
    if (!oldStyle || oldStyle[k] !== newStyle![k]) {
      changed = true;
      break;
    }
  }
  if (!changed) {
    for (const k of oldKeys) {
      if (!newStyle || !(k in newStyle)) {
        changed = true;
        break;
      }
    }
  }
  if (changed) {
    return [{ type: "set_style", elm: newElm.$elm, style: newStyle || {} }];
  }
  return [];
}

function diff_style_set(
  oldElm: TimelessElement,
  newElm: TimelessElement,
): PatchAction[] {
  const oldSet: string[] = oldElm.state?.styleSet || [];
  const newSet: string[] = newElm.state?.styleSet || [];

  if (
    oldSet.length !== newSet.length ||
    oldSet.some((v, i) => v !== newSet[i])
  ) {
    return [{ type: "set_style_set", elm: newElm.$elm, styleSet: newSet }];
  }
  return [];
}

function diff_attributes(
  oldElm: TimelessElement,
  newElm: TimelessElement,
): PatchAction[] {
  const oldAttrs: Record<string, any> = oldElm.state?.attributes || {};
  const newAttrs: Record<string, any> = newElm.state?.attributes || {};

  const actions: PatchAction[] = [];
  const $elm = newElm.$elm;

  for (const k of Object.keys(newAttrs)) {
    if (oldAttrs[k] !== newAttrs[k]) {
      actions.push({
        type: "set_attribute",
        elm: $elm,
        key: k,
        value: String(newAttrs[k]),
      });
    }
  }
  for (const k of Object.keys(oldAttrs)) {
    if (!(k in newAttrs)) {
      actions.push({ type: "remove_attribute", elm: $elm, key: k });
    }
  }
  return actions;
}
