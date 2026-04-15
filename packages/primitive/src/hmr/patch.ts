import { isElement, TimelessElement } from "@/content/type";

// ─── Action types ────────────────────────────────────────────────────────────

export type SetTextAction = {
  type: "set_text";
  elm: any; // null when not yet mounted
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
  old_element: TimelessElement;
  new_element: TimelessElement;
};

export type InsertChildAction = {
  type: "insert_child";
  /** The parent element whose children array gains a new slot. */
  parent: TimelessElement;
  element: TimelessElement;
  index: number;
};

export type RemoveChildAction = {
  type: "remove_child";
  /** The parent element whose children array loses a slot. */
  parent: TimelessElement;
  element: TimelessElement;
  index: number;
};

export type PatchAction =
  | SetTextAction
  | SetStyleAction
  | SetStyleSetAction
  | SetAttributeAction
  | RemoveAttributeAction
  | ReplaceAction
  | InsertChildAction
  | RemoveChildAction;

// ─── patch ───────────────────────────────────────────────────────────────────

/**
 * Diff two TimelessElement trees and return the list of patch actions needed.
 * Actions are always emitted regardless of whether $elm is mounted — the caller
 * is responsible for skipping actions whose elm is null.
 */
export function diff_element(
  old_element: TimelessElement,
  new_element: TimelessElement,
): PatchAction[] {
  if (old_element.t !== new_element.t) {
    return [{ type: "replace", old_element, new_element }];
  }

  const actions: PatchAction[] = [];

  // text node
  if (old_element.t === "text") {
    if (old_element.state.value !== new_element.state.value) {
      actions.push({
        type: "set_text",
        elm: old_element.$elm,
        value: new_element.state.value,
      });
      old_element.state.value = new_element.state.value;
    }
    return actions;
  }

  // style diff
  actions.push(...patch_style(old_element, new_element));

  // class diff
  actions.push(...patch_style_set(old_element, new_element));

  // attributes diff
  actions.push(...patch_attributes(old_element, new_element));

  // recurse children
  const old_child_elements = old_element.children || [];
  const new_child_elements = new_element.children || [];
  const len = Math.min(old_child_elements.length, new_child_elements.length);

  for (let i = 0; i < len; i++) {
    const old_child_element = old_child_elements[i];
    const new_child_element = new_child_elements[i];
    if (
      old_child_element &&
      new_child_element &&
      isElement(old_child_element) &&
      isElement(new_child_element)
    ) {
      actions.push(...diff_element(old_child_element, new_child_element));
    }
  }

  // remove old children that no longer exist (emit high-index first to preserve order)
  for (let i = old_child_elements.length - 1; i >= len; i--) {
    const child = old_child_elements[i];
    if (child && isElement(child)) {
      actions.push({ type: "remove_child", parent: old_element, element: child, index: i });
    }
  }

  // insert new children that didn't exist before
  for (let i = len; i < new_child_elements.length; i++) {
    const child = new_child_elements[i];
    if (child && isElement(child)) {
      actions.push({ type: "insert_child", parent: old_element, element: child, index: i });
    }
  }

  // sync children state: keep patched overlap, replace the tail
  if (old_child_elements.length !== new_child_elements.length) {
    old_element.children = [
      ...old_child_elements.slice(0, len),
      ...new_child_elements.slice(len),
    ];
  }

  return actions;
}

export function patch(old_element: TimelessElement, new_element: TimelessElement) {
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
      case "replace": {
        const $elm = action.old_element.$elm;
        if (!$elm) break;
        const parent = $elm.getParent?.();
        if (!parent) break;
        parent.render(action.new_element);
        break;
      }
      case "insert_child": {
        const $elm = action.parent.$elm;
        if (!$elm) break;
        $elm.insertChildren([action.element]);
        break;
      }
      case "remove_child": {
        const child$elm = action.element.$elm;
        if (!child$elm) break;
        const childRaw = child$elm.get$elm?.();
        const parentRaw = child$elm.getParent?.()?.get$elm?.();
        if (parentRaw && childRaw) parentRaw.removeChild(childRaw);
        break;
      }
    }
  }
  return actions;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function patch_style(oldElm: TimelessElement, newElm: TimelessElement): PatchAction[] {
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
    const nextStyle = newStyle || {};
    if (oldElm.state) {
      oldElm.state.style = newStyle;
    }
    return [{ type: "set_style", elm: oldElm.$elm, style: nextStyle }];
  }
  return [];
}

function patch_style_set(
  oldElm: TimelessElement,
  newElm: TimelessElement,
): PatchAction[] {
  const oldSet: string[] = oldElm.state?.styleSet || [];
  const newSet: string[] = newElm.state?.styleSet || [];

  if (
    oldSet.length !== newSet.length ||
    oldSet.some((v, i) => v !== newSet[i])
  ) {
    if (oldElm.state) {
      oldElm.state.styleSet = newSet;
    }
    return [{ type: "set_style_set", elm: oldElm.$elm, styleSet: newSet }];
  }
  return [];
}

function patch_attributes(
  oldElm: TimelessElement,
  newElm: TimelessElement,
): PatchAction[] {
  const oldAttrs: Record<string, any> = oldElm.state?.attributes || {};
  const newAttrs: Record<string, any> = newElm.state?.attributes || {};

  const actions: PatchAction[] = [];
  const $elm = oldElm.$elm; // may be null when not yet mounted

  // set new / changed
  for (const k of Object.keys(newAttrs)) {
    if (oldAttrs[k] !== newAttrs[k]) {
      actions.push({ type: "set_attribute", elm: $elm, key: k, value: String(newAttrs[k]) });
    }
  }
  // remove deleted
  for (const k of Object.keys(oldAttrs)) {
    if (!(k in newAttrs)) {
      actions.push({ type: "remove_attribute", elm: $elm, key: k });
    }
  }
  if (oldElm.state) {
    oldElm.state.attributes = newAttrs;
  }
  return actions;
}
