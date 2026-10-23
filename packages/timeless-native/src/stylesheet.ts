import {
  computeWebStyle,
  onWebStylesChange,
  webStyleInvalidationTargets,
} from "./web-styles";

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
  _cssVariables?: Record<string, string>;
  listeners?: Record<string, (event: any) => void>;
  _nativeStyle?: {
    inline: Record<string, string>;
    defaults: Record<string, string>;
    states: Record<string, boolean>;
  };
  _onStyleChange?: ((style: Record<string, string>) => void) | null;
  _setStyleState?: (name: string, value: boolean) => void;
  _batchStyleUpdates?: (update: () => void) => void;
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
  timer: undefined as ReturnType<typeof setTimeout> | undefined,
});
registry.sheets.clear();
clearNativeLayout();
let batch_depth = 0;
const pending_styles = new Map<StyleNode, boolean>();

/** Resolve each affected subtree once after construction or an event. */
export function batchNativeStyles<T>(build: () => T): T {
  batch_depth += 1;
  try {
    return build();
  } finally {
    batch_depth -= 1;
    if (!batch_depth) {
      const depth = (node: StyleNode) => {
        let value = 0;
        while (node.parentNode) {
          value++;
          node = node.parentNode;
        }
        return value;
      };
      const roots = [...pending_styles]
        .filter(([node]) => {
          let parent = node.parentNode;
          while (parent) {
            if (pending_styles.get(parent)) return false;
            parent = parent.parentNode;
          }
          return true;
        })
        .sort(([left], [right]) => depth(left) - depth(right));
      pending_styles.clear();
      const pass = { visited: new Set<StyleNode>(), forced: new Map(roots) };
      for (const [root, cascade] of roots)
        refreshNativeStyles(root, cascade, pass);
    }
  }
}

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
  "white-space",
];

/** The explicit native pass already includes queued changes to the tree. */
export function clearNativeLayout() {
  if (registry.timer !== undefined) clearTimeout(registry.timer);
  registry.timer = undefined;
  registry.pending = false;
}

export function requestNativeLayout() {
  if (
    registry.pending ||
    typeof (globalThis as any).__nativeBridge_relayout !== "function"
  )
    return;
  registry.pending = true;
  registry.timer = setTimeout(() => {
    registry.timer = undefined;
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
    node._batchStyleUpdates = (update) => {
      batchNativeStyles(update);
      if (!batch_depth && registry.pending) {
        clearNativeLayout();
        (globalThis as any).__nativeBridge_relayout();
      }
    };
    node._setStyleState = (name, value) => {
      if (!!node._nativeStyle!.states[name] === value) return;
      node._nativeStyle!.states[name] = value;
      invalidateNativeStyles(node, "states", [name]);
    };
    node._dispatchNativeEvent = (name, payload = {}) =>
      batchNativeStyles(() => {
        let stopped = false;
        const event = {
          ...payload,
          type: name,
          target: node,
          currentTarget: node,
          defaultPrevented: false,
          preventDefault() {
            this.defaultPrevented = true;
          },
          stopPropagation() {
            stopped = true;
          },
        };
        let target: StyleNode | undefined = node;
        do {
          event.currentTarget = target;
          target.listeners?.[name]?.(event);
          target = target.parentNode;
        } while (
          target &&
          !stopped &&
          !["focus", "blur", "mouseenter", "mouseleave"].includes(name)
        );
        return event.defaultPrevented;
      });
  }
  return node._nativeStyle;
}

export function invalidateNativeStyles(
  node: StyleNode,
  type: "classes" | "attributes" | "states" | "structure",
  names: string[],
  previous: StyleNode = node,
) {
  if (type === "structure") {
    while (
      ["fragment", "show", "for", "lazy-view"].includes(node.type ?? "") &&
      node.parentNode
    )
      node = node.parentNode;
    for (const child of node.children ?? []) child.parentNode = node;
  }
  const targets = new Set(
    webStyleInvalidationTargets(node, type, names, previous),
  );
  const class_change =
    type === "classes" || (type === "attributes" && names.includes("class"));
  const classes = [
    ...(node.attrs?.class ?? "").split(/\s+/),
    ...(previous.attrs?.class ?? "").split(/\s+/),
  ];
  const native_rule = [...registry.sheets.values()].some(
    (rules: NativeStyleRule[]) =>
      rules.some((rule) =>
        class_change
          ? rule.classes.some((name) => classes.includes(name))
          : rule.states.some((name) => names.includes(name)) &&
            rule.classes.every((name) =>
              (node.attrs?.class ?? "").split(/\s+/).includes(name),
            ),
      ),
  );
  if (native_rule || type === "structure") targets.add(node);
  batchNativeStyles(() => {
    for (const target of targets)
      refreshNativeStyles(target, type === "structure" && target === node);
  });
}

const paint_properties = new Set([
  "-timeless-animation",
  "animation-name",
  "animation-duration",
  "animation-delay",
  "animation-timing-function",
  "animation-fill-mode",
  "animation-direction",
  "animation-iteration-count",
  "color",
  "background",
  "background-color",
  "opacity",
  "border-radius",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "box-shadow",
  "outline",
  "outline-width",
  "outline-offset",
  "outline-style",
  "outline-color",
]);

export function refreshNativeStyles(
  node: StyleNode,
  cascade = true,
  pass = {
    visited: new Set<StyleNode>(),
    forced: new Map<StyleNode, boolean>(),
  },
) {
  cascade ||= !!pass.forced.get(node);
  if (pass.visited.has(node)) return;
  if (batch_depth) {
    pending_styles.set(node, !!pending_styles.get(node) || cascade);
    return;
  }
  pass.visited.add(node);
  const current = state(node);
  const previous_variables = node._cssVariables;
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
  const resolved_style =
    computeWebStyle(
      node,
      Object.fromEntries(
        inherited_keys.flatMap((key) =>
          node.parentNode?.style[key] !== undefined
            ? [[key, node.parentNode.style[key]]]
            : [],
        ),
      ),
      style,
      current.inline,
    ) ?? style;
  const changed =
    Object.keys(resolved_style).length !== Object.keys(node.style).length ||
    Object.keys(resolved_style).some(
      (key) => resolved_style[key] !== node.style[key],
    );
  const layout_changed =
    changed &&
    [
      ...new Set([...Object.keys(node.style), ...Object.keys(resolved_style)]),
    ].some(
      (key) =>
        !paint_properties.has(key) && node.style[key] !== resolved_style[key],
    );
  const inherited_changed =
    previous_variables !== node._cssVariables ||
    inherited_keys.some((key) => resolved_style[key] !== node.style[key]);
  cascade ||=
    node.style.display === "none" && resolved_style.display !== "none";
  node.style = resolved_style;
  if (changed && node._onStyleChange) {
    node._onStyleChange(node.style);
    if (layout_changed) requestNativeLayout();
  }
  for (const child of node.children || []) {
    child.parentNode = node;
    // Hidden pages receive current inherited styles when they become visible.
    if (resolved_style.display !== "none" && (cascade || inherited_changed))
      refreshNativeStyles(child, cascade, pass);
  }
}

export function setNativeInlineStyle(
  node: StyleNode,
  style: Record<string, string>,
) {
  state(node).inline = style;
  refreshNativeStyles(node, false);
}

export function setNativeStyleValue(
  node: StyleNode,
  key: string,
  value: string,
) {
  state(node).inline[key] = value;
  refreshNativeStyles(node, false);
}

export function setNativeDefaultStyle(
  node: StyleNode,
  style: Record<string, string>,
) {
  Object.assign(state(node).defaults, style);
  refreshNativeStyles(node, false);
}

export function bindNativeStyleRoot(node: StyleNode) {
  registry.root = node;
  refreshNativeStyles(node);
}

onWebStylesChange(() => {
  if (registry.root) refreshNativeStyles(registry.root);
});
