export type NativeStyleRule = {
  classes: string[];
  states: string[];
  style: Record<string, string>;
};

type StyleNode = {
  type?: string;
  style: Record<string, string>;
  attrs?: Record<string, any>;
  children?: StyleNode[];
  parentNode?: StyleNode;
  checked?: boolean;
  listeners?: Record<string, (event: any) => void>;
  _nativeStyle?: {
    inline: Record<string, string>;
    defaults: Record<string, string>;
    states: Record<string, boolean>;
  };
  _onStyleChange?: ((style: Record<string, string>) => void) | null;
  _setStyleState?: (name: string, value: boolean) => void;
  _dispatchNativeEvent?: (
    name: string,
    payload: Record<string, unknown>,
  ) => boolean;
};

// Keep sheets and the mounted root available to callbacks from the previous HMR bundle.
const registry = ((globalThis as any).__timeless_native_styles ??= {
  sheets: new Map<string, NativeStyleRule[]>(),
  root: null as StyleNode | null,
  pending: false,
});
registry.sheets.clear();
registry.pending = false;

const inherited_keys = [
  "color",
  "font-size",
  "font-weight",
  "text-align",
  "font-style",
  "font-family",
  "text-decoration",
  "line-height",
  "letter-spacing",
];

export function requestNativeLayout() {
  if (
    registry.pending ||
    typeof (globalThis as any).__nativeBridge_relayout !== "function"
  )
    return;
  registry.pending = true;
  setTimeout(() => {
    registry.pending = false;
    (globalThis as any).__nativeBridge_relayout();
  }, 0);
}

/** Replacing the same id also replaces its rules during native HMR. */
export function registerNativeStyleSheet(id: string, rules: NativeStyleRule[]) {
  registry.sheets.set(id, rules);
  if (registry.root) refreshNativeStyles(registry.root);
}

function state(node: StyleNode) {
  if (!node._nativeStyle) {
    node._nativeStyle = { inline: { ...node.style }, defaults: {}, states: {} };
    node._setStyleState = (name, value) => {
      node._nativeStyle!.states[name] = value;
      refreshNativeStyles(node);
    };
    node._dispatchNativeEvent = (name, payload = {}) => {
      const event = {
        ...payload,
        type: name,
        target: node,
        currentTarget: node,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true;
        },
        stopPropagation() {},
      };
      node.listeners?.[name]?.(event);
      return event.defaultPrevented;
    };
  }
  return node._nativeStyle;
}

export function refreshNativeStyles(node: StyleNode) {
  const current = state(node);
  const classes = new Set(
    (node.attrs?.class || "").split(/\s+/).filter(Boolean),
  );
  const states = {
    ...current.states,
    disabled:
      node.attrs?.disabled !== undefined && node.attrs.disabled !== false,
  };
  const style: Record<string, string> = {};
  for (const key of inherited_keys) {
    const value = node.parentNode?.style[key];
    if (value !== undefined) style[key] = value;
  }
  Object.assign(style, current.defaults);
  const rules: NativeStyleRule[] = [];
  for (const sheet of registry.sheets.values()) {
    for (const rule of sheet) {
      if (
        rule.classes.every((name) => classes.has(name)) &&
        rule.states.every((name) => states[name as keyof typeof states])
      )
        rules.push(rule);
    }
  }
  // Stable sorting preserves stylesheet order for equal specificity, independent of class order.
  rules.sort(
    (a, b) =>
      a.classes.length + a.states.length - b.classes.length - b.states.length,
  );
  for (const rule of rules) Object.assign(style, rule.style);
  Object.assign(style, current.inline);
  if (node.parentNode?.type === "aspect-ratio") {
    delete style.width;
    delete style.height;
  }
  const changed =
    Object.keys(style).length !== Object.keys(node.style).length ||
    Object.keys(style).some((key) => style[key] !== node.style[key]);
  node.style = style;
  if (changed && node._onStyleChange) {
    node._onStyleChange(style);
    requestNativeLayout();
  }
  for (const child of node.children || []) {
    child.parentNode = node;
    refreshNativeStyles(child);
  }
}

export function setNativeInlineStyle(
  node: StyleNode,
  style: Record<string, string>,
) {
  state(node).inline = style;
  refreshNativeStyles(node);
}

export function setNativeStyleValue(
  node: StyleNode,
  key: string,
  value: string,
) {
  state(node).inline[key] = value;
  refreshNativeStyles(node);
}

export function setNativeDefaultStyle(
  node: StyleNode,
  style: Record<string, string>,
) {
  Object.assign(state(node).defaults, style);
  refreshNativeStyles(node);
}

export function bindNativeStyleRoot(node: StyleNode) {
  registry.root = node;
  refreshNativeStyles(node);
}
