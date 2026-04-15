import { isElement, TimelessElement } from "@/content/type";

/**
 * Diff two TimelessElement trees and patch the real DOM in place.
 * Returns true if patched successfully, false if the caller must do a full replace.
 */
export function patch(
  oldElm: TimelessElement,
  newElm: TimelessElement,
): boolean {
  if (oldElm.t !== newElm.t) {
    return false;
  }

  // text node
  if (oldElm.t === "text") {
    if (oldElm.state.value !== newElm.state.value) {
      if (oldElm.$elm && typeof (oldElm.$elm as any).setText === "function") {
        (oldElm.$elm as any).setText(newElm.state.value);
      }
      oldElm.state.value = newElm.state.value;
    }
    return true;
  }

  // style diff
  patchStyle(oldElm, newElm);

  // class diff
  patchStyleSet(oldElm, newElm);

  // attributes diff
  patchAttributes(oldElm, newElm);

  // recurse children
  const oldChildren = oldElm.children || [];
  const newChildren = newElm.children || [];
  const len = Math.min(oldChildren.length, newChildren.length);

  for (let i = 0; i < len; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];
    if (oldChild && newChild && isElement(oldChild) && isElement(newChild)) {
      if (!patch(oldChild, newChild)) {
        // type changed at this position — need node replacement
        // TODO: remove old, build+insert new
      }
    }
  }

  // TODO: handle children length changes (add / remove)

  return true;
}

function patchStyle(oldElm: TimelessElement, newElm: TimelessElement): void {
  const oldStyle = oldElm.state?.style;
  const newStyle = newElm.state?.style;
  if (!newStyle && !oldStyle) return;
  if (!oldElm.$elm || typeof (oldElm.$elm as any).setStyle !== "function")
    return;

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
    (oldElm.$elm as any).setStyle(newStyle || {});
    if (oldElm.state) {
      oldElm.state.style = newStyle;
    }
  }
}

function patchStyleSet(
  oldElm: TimelessElement,
  newElm: TimelessElement,
): void {
  const oldSet: string[] = oldElm.state?.styleSet || [];
  const newSet: string[] = newElm.state?.styleSet || [];
  if (!oldElm.$elm || typeof (oldElm.$elm as any).setStyleSet !== "function")
    return;

  if (oldSet.length !== newSet.length || oldSet.some((v, i) => v !== newSet[i])) {
    (oldElm.$elm as any).setStyleSet(newSet);
    if (oldElm.state) {
      oldElm.state.styleSet = newSet;
    }
  }
}

function patchAttributes(
  oldElm: TimelessElement,
  newElm: TimelessElement,
): void {
  const oldAttrs: Record<string, any> = oldElm.state?.attributes || {};
  const newAttrs: Record<string, any> = newElm.state?.attributes || {};
  if (!oldElm.$elm) return;

  const $elm = oldElm.$elm as any;
  const hasSetAttr = typeof $elm.setAttribute === "function";
  const hasRemoveAttr = typeof $elm.removeAttribute === "function";
  if (!hasSetAttr) return;

  // set new / changed
  for (const k of Object.keys(newAttrs)) {
    if (oldAttrs[k] !== newAttrs[k]) {
      $elm.setAttribute(k, String(newAttrs[k]));
    }
  }
  // remove deleted
  if (hasRemoveAttr) {
    for (const k of Object.keys(oldAttrs)) {
      if (!(k in newAttrs)) {
        $elm.removeAttribute(k);
      }
    }
  }
  if (oldElm.state) {
    oldElm.state.attributes = newAttrs;
  }
}
