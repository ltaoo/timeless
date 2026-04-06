import {
  type TimelessElement,
  isElement,
  isRef,
  viewStyleToCssText,
} from "@timeless/timeless";

import {
  createTuiElement,
  createTuiFragment,
  createTuiText,
  type TuiNode,
  type TuiElement,
} from "../nodes";

function applyContainerProps(node: TuiElement, elm: TimelessElement) {
  const props = elm.props;
  if (!props) return;

  if (props.style) {
    const cssText = viewStyleToCssText(props.style as any);
    (node as any).style = { cssText } as any;
  }

  const styleSets = (props as any).styleSets;
  if (styleSets) {
    const v = isRef(styleSets) ? (styleSets as any).value : styleSets;
    if (Array.isArray(v)) node.className = v.join(" ");
    else if (typeof v === "string") node.className = v;
  }

  const events = (elm as any).events;
  if (events) {
    if (events.onClick) {
      node.addEventListener("click", events.onClick);
    }
    if (events.onDoubleClick) {
      node.addEventListener("dblclick", events.onDoubleClick);
    }
    if (events.onPointerDown) {
      node.addEventListener("pointerdown", events.onPointerDown);
    }
    if (events.onFocus) {
      node.addEventListener("focus", events.onFocus);
    }
    if (events.onBlur) {
      node.addEventListener("blur", events.onBlur);
    }
    if (events.onKeyDown) {
      node.addEventListener("keydown", events.onKeyDown);
    }
    if (events.onContextMenu) {
      node.addEventListener("contextmenu", events.onContextMenu);
    }
    if (events.onMouseEnter) {
      node.addEventListener("mouseenter", events.onMouseEnter);
    }
    if (events.onMouseLeave) {
      node.addEventListener("mouseleave", events.onMouseLeave);
    }
  }
}

export function buildTuiTreeFromTimelessElement(
  elm: TimelessElement,
): TuiNode | null {
  if (!elm || !isElement(elm)) return null;

  const normalizeChildren = (c: any) => {
    if (c === null || c === undefined) return [];
    return Array.isArray(c) ? c : [c];
  };

  if (elm.t === "show") {
    const $elm = createTuiFragment();
    elm.$elm = $elm;

    const props = (elm as any).props ?? (elm as any)._props ?? {};
    const when = props.when;
    const okFn = (elm as any)._ok ?? props.ok;
    const elseFn = (elm as any)._else ?? props.else;

    const condition = isRef(when) ? !!when.value : !!when;
    const chosen = condition ? (okFn ? okFn() : []) : elseFn ? elseFn() : [];
    const children = normalizeChildren(chosen);

    for (let node of children) {
      if (node === null || node === undefined) continue;
      if (typeof node === "function") node = node();

      if (isElement(node)) {
        const sub = buildTuiTreeFromTimelessElement(node);
        if (sub) $elm.appendChild(sub);
        continue;
      }
      if (typeof node === "string" || typeof node === "number") {
        $elm.appendChild(createTuiText(String(node)));
      }
    }
    return $elm;
  }

  if (elm.t === "view") {
    const $elm = createTuiElement("div");
    elm.$elm = $elm;

    applyContainerProps($elm, elm);

    const children = elm.children ?? [];
    for (const child of children) {
      if (!isElement(child)) continue;
      const sub = buildTuiTreeFromTimelessElement(child);
      if (sub) $elm.appendChild(sub);
    }
    return $elm;
  }

  if (elm.t === "grid") {
    const $elm = createTuiElement("div");
    elm.$elm = $elm;

    applyContainerProps($elm, elm);

    const children = elm.children ?? [];
    for (const child of children) {
      if (!isElement(child)) continue;
      const sub = buildTuiTreeFromTimelessElement(child);
      if (sub) $elm.appendChild(sub);
    }
    return $elm;
  }

  if (elm.t === "text") {
    const $elm = createTuiText(String(elm.value ?? ""));
    elm.$elm = $elm;
    return $elm;
  }

  if (elm.t === "for" || elm.t === "fragment") {
    const $elm = createTuiFragment();
    elm.$elm = $elm;
    const children = elm.children ?? [];
    for (const child of children) {
      if (!isElement(child)) continue;
      const sub = buildTuiTreeFromTimelessElement(child);
      if (sub) $elm.appendChild(sub);
    }
    return $elm;
  }

  return null;
}
