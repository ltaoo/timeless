import {
  cssVariables,
  cssMath,
  cssColor,
  cssShadow,
  splitCSS,
  type CSSContext,
} from "./css-values";

type Token = {
  type: string;
  value: string;
  attribute?: string;
  operator?: string;
  insensitive?: boolean;
  nodes?: Token[][];
};
type Rule = {
  selector: Token[];
  specificity: number;
  declarations: [string, string, boolean][];
  media: string[];
};
export type WebStyleSheet = {
  rules: Rule[];
  properties: Record<string, { value?: string; inherits: boolean }>;
};
type Node = {
  type?: string;
  attrs?: Record<string, any>;
  children?: Node[];
  parentNode?: Node;
  style: Record<string, string>;
  _cssVariables?: Record<string, string>;
  _nativeStyle?: { states: Record<string, boolean> };
};
type StyleChange = "classes" | "attributes" | "states";
const registry = ((globalThis as any).__timeless_web_styles ??= {
  sheets: new Map<string, WebStyleSheet>(),
  indexed: new Map<string, { rule: Rule; order: number }[]>(),
  properties: {} as WebStyleSheet["properties"],
});
const sheets = registry.sheets as Map<string, WebStyleSheet>;
sheets.clear();
let onChange: (() => void) | undefined;
export function onWebStylesChange(callback: () => void) {
  onChange = callback;
}
export function registerWebStyleSheet(id: string, sheet: WebStyleSheet) {
  sheets.set(id, sheet);
  registry.indexed = new Map();
  registry.properties = {};
  registry.external = {
    classes: new Set<string>(),
    attributes: new Set<string>(),
    states: new Set<string>(),
  };
  function dependencies(tokens: Token[], outside = false) {
    const siblings =
      outside ||
      tokens.some(
        (token) =>
          token.type === "combinator" &&
          ["+", "~"].includes(token.value.trim()),
      );
    for (const token of tokens) {
      if (siblings && token.type === "class")
        registry.external.classes.add(token.value);
      if (siblings && token.type === "class")
        registry.external.attributes.add("class");
      if (siblings && token.type === "id")
        registry.external.attributes.add("id");
      if (siblings && token.type === "attribute")
        registry.external.attributes.add(token.attribute);
      if (token.type !== "pseudo") continue;
      if (token.value === ":focus-within")
        registry.external.states.add("focus");
      if (siblings) {
        registry.external.states.add(token.value.slice(1));
        if ([":disabled", ":enabled"].includes(token.value))
          registry.external.attributes.add("disabled");
      }
      for (const nested of token.nodes ?? [])
        dependencies(nested, siblings || token.value === ":has");
    }
  }
  let order = 0;
  for (const current of sheets.values()) {
    Object.assign(registry.properties, current.properties);
    for (const rule of current.rules) {
      dependencies(rule.selector);
      let key = "";
      for (
        let i = rule.selector.length - 1;
        i >= 0 && rule.selector[i].type !== "combinator";
        i--
      ) {
        if (rule.selector[i].type === "class") {
          key = rule.selector[i].value;
          break;
        }
      }
      const list = registry.indexed.get(key) ?? [];
      list.push({ rule, order: ++order });
      registry.indexed.set(key, list);
    }
  }
  onChange?.();
}

export function webStyleChangeNeedsRoot(type: StyleChange, names: string[]) {
  return names.some((name) => registry.external?.[type].has(name));
}

function parent(node: Node): Node | undefined {
  let result = node.parentNode;
  while (
    result &&
    ["fragment", "show", "for", "lazy-view"].includes(result.type ?? "")
  )
    result = result.parentNode;
  return result;
}
function siblings(node: Node): Node[] {
  const flatten = (items: Node[]): Node[] =>
    items.flatMap((item) =>
      ["fragment", "show", "for", "lazy-view"].includes(item.type ?? "")
        ? flatten(item.children ?? [])
        : item.type === "text"
          ? []
          : [item],
    );
  return flatten(parent(node)?.children ?? [node]);
}
function descendants(node: Node): Node[] {
  return (node.children ?? []).flatMap((child) => [
    child,
    ...descendants(child),
  ]);
}
function attribute(node: Node, key: string) {
  return node.attrs?.[key] ?? node.attrs?.[key.replace(/^data-data-/, "data-")];
}
function tokenMatches(node: Node, token: Token, scope?: Node): boolean {
  const attrs = node.attrs ?? {};
  const classes = (attrs.class ?? "").split(/\s+/);
  if (token.type === "universal") return true;
  if (token.type === "class") return classes.includes(token.value);
  if (token.type === "id") return attrs.id === token.value;
  if (token.type === "tag")
    return (
      token.value === (node.type === "view" ? "div" : node.type) ||
      (token.value === "html" && !parent(node))
    );
  if (token.type === "attribute") {
    let value = attribute(node, token.attribute!);
    if (value === undefined || value === null || value === false) return false;
    value = String(value);
    let expected = token.value ?? "";
    if (token.insensitive) {
      value = value.toLowerCase();
      expected = expected.toLowerCase();
    }
    if (!token.operator) return true;
    return token.operator === "="
      ? value === expected
      : token.operator === "~="
        ? value.split(/\s+/).includes(expected)
        : token.operator === "^="
          ? value.startsWith(expected)
          : token.operator === "$="
            ? value.endsWith(expected)
            : token.operator === "*="
              ? value.includes(expected)
              : token.operator === "|="
                ? value === expected || value.startsWith(expected + "-")
                : false;
  }
  if (token.type !== "pseudo") return false;
  const name = token.value;
  if ([":is", ":where", ":not"].includes(name)) {
    const matches =
      token.nodes?.some((tokens) => matchesSelector(node, tokens, scope)) ??
      false;
    return name === ":not" ? !matches : matches;
  }
  if (name === ":has")
    return descendants(node).some((child) =>
      token.nodes?.some((tokens) =>
        matchesSelector(
          child,
          tokens[0]?.type === "combinator"
            ? [{ type: "pseudo", value: ":scope" }, ...tokens]
            : tokens,
          node,
        ),
      ),
    );
  if (name === ":scope") return node === scope;
  if (name === ":root") return !parent(node);
  if (name === ":disabled")
    return attrs.disabled !== undefined && attrs.disabled !== false;
  if (name === ":enabled")
    return attrs.disabled === undefined || attrs.disabled === false;
  if (name === ":checked") return !!(node as any).checked;
  if (name === ":empty")
    return !(node.children ?? []).some(
      (child) => child.type !== "text" || !!(child as any).value,
    );
  if (name === ":first-child") return siblings(node)[0] === node;
  if (name === ":last-child") return siblings(node).at(-1) === node;
  if (name === ":only-child") return siblings(node).length === 1;
  if (name === ":focus-within")
    return [node, ...descendants(node)].some(
      (child) => child._nativeStyle?.states.focus,
    );
  return !!node._nativeStyle?.states[name.slice(1)];
}

function matchesSelector(
  node: Node | undefined,
  tokens: Token[],
  scope?: Node,
): boolean {
  if (!node || node.type === "text") return false;
  let index = tokens.length - 1;
  for (; index >= 0 && tokens[index].type !== "combinator"; index--)
    if (!tokenMatches(node, tokens[index], scope)) return false;
  if (index < 0) return true;
  const relation = tokens[index].value.trim();
  const remaining = tokens.slice(0, index);
  if (relation === ">") return matchesSelector(parent(node), remaining, scope);
  if (relation === "+" || relation === "~") {
    const peers = siblings(node),
      current = peers.indexOf(node);
    return relation === "+"
      ? matchesSelector(peers[current - 1], remaining, scope)
      : peers
          .slice(0, current)
          .some((peer) => matchesSelector(peer, remaining, scope));
  }
  let ancestor = parent(node);
  while (ancestor) {
    if (matchesSelector(ancestor, remaining, scope)) return true;
    ancestor = parent(ancestor);
  }
  return false;
}

function expand(property: string, value: string): Record<string, string> {
  const parts = splitCSS(value, " ");
  const edges = ["top", "right", "bottom", "left"];
  if (
    ["padding", "margin", "border-width", "border-color"].includes(property) &&
    parts.length <= 4
  ) {
    const [top, right = top, bottom = top, left = right] = parts;
    const values = [top, right, bottom, left];
    if (property.startsWith("border-"))
      return {
        [property]: value,
        ...Object.fromEntries(
          edges.map((edge, i) => [
            `border-${edge}-${property.slice(7)}`,
            values[i],
          ]),
        ),
      };
    return Object.fromEntries(
      edges.map((edge, i) => [`${property}-${edge}`, values[i]]),
    );
  }
  if (/^(padding|margin)-(inline|block)$/.test(property)) {
    const [base, axis] = property.split("-");
    return {
      [`${base}-${axis === "inline" ? "left" : "top"}`]: parts[0],
      [`${base}-${axis === "inline" ? "right" : "bottom"}`]:
        parts[1] ?? parts[0],
    };
  }
  if (property === "inset")
    return Object.fromEntries(
      edges.map((edge, i) => [edge, parts[i] ?? parts[i % 2] ?? parts[0]]),
    );
  if (property === "border") {
    const width = parts.find((part) => /^\d/.test(part)),
      color = parts.find((part) => cssColor(part) || part === "currentcolor");
    return {
      ...(width && expand("border-width", width)),
      ...(color && expand("border-color", color)),
    };
  }
  if (property === "background" && cssColor(value))
    return { "background-color": value };
  if (property === "flex" && /^\d+$/.test(value))
    return { "flex-grow": value, "flex-shrink": "1", "flex-basis": "0px" };
  if (property === "flex" && value === "none")
    return { "flex-grow": "0", "flex-shrink": "0", "flex-basis": "auto" };
  return { [property]: value };
}

export function computeWebStyle(
  node: Node,
  inherited: Record<string, string>,
  defaults: Record<string, string>,
  inline: Record<string, string>,
): Record<string, string> | undefined {
  if (![...sheets.values()].some((sheet) => sheet.rules.length)) return;
  const properties = registry.properties as WebStyleSheet["properties"];
  const variables: Record<string, string> = {};
  for (const [key, value] of Object.entries(
    node.parentNode?._cssVariables ?? {},
  ))
    if (properties[key]?.inherits !== false) variables[key] = value;
  for (const [key, property] of Object.entries(properties))
    if (variables[key] === undefined && property.value !== undefined)
      variables[key] = property.value;
  const root = (() => {
    let result = node;
    while (result.parentNode) result = result.parentNode;
    return result;
  })();
  const viewport = (globalThis as any).__nativeBridge_viewport?.() ?? {
    width: 1000,
    height: 720,
  };
  const context: CSSContext = {
    ...viewport,
    fontSize: parseFloat(inherited["font-size"] ?? "16"),
    rootFontSize: 16,
  };
  const matching: { rule: Rule; order: number }[] = [];
  if (
    !["text", "fragment", "show", "for", "lazy-view"].includes(node.type ?? "")
  ) {
    const keys = new Set(["", ...(node.attrs?.class ?? "").split(/\s+/)]);
    for (const key of keys)
      for (const { rule, order } of (registry.indexed.get(key) ?? []) as {
        rule: Rule;
        order: number;
      }[]) {
        if (
          !rule.media.every((media) => {
            if (media.includes("prefers-color-scheme"))
              return (
                media.includes("dark") ===
                (root.attrs?.class ?? "").split(/\s+/).includes("dark")
              );
            const min = media.match(/min-width:\s*([\d.]+)(px|rem)/),
              max = media.match(/max-width:\s*([\d.]+)(px|rem)/);
            return (
              (!min ||
                context.width >=
                  Number(min[1]) * (min[2] === "rem" ? 16 : 1)) &&
              (!max ||
                context.width <= Number(max[1]) * (max[2] === "rem" ? 16 : 1))
            );
          })
        )
          continue;
        if (matchesSelector(node, rule.selector))
          matching.push({ rule, order });
      }
  }
  const cascade: Record<string, { value: string; weight: number }> = {};
  function assign(property: string, value: string, weight: number) {
    if (!cascade[property] || cascade[property].weight <= weight)
      cascade[property] = { value, weight };
  }
  for (const { rule, order } of matching)
    for (const [property, value, important] of rule.declarations) {
      const weight = (important ? 1e12 : 0) + rule.specificity * 1e5 + order;
      assign(property, value, weight);
    }
  for (const [property, value] of Object.entries(inline))
    assign(property, value, 1e11);
  for (const [property, { value }] of Object.entries(cascade))
    if (property.startsWith("--")) {
      const resolved =
        value === "initial"
          ? properties[property]?.value
          : value === "inherit"
            ? node.parentNode?._cssVariables?.[property]
            : value;
      if (resolved === undefined) delete variables[property];
      else variables[property] = resolved;
    }
  node._cssVariables = variables;
  const declarations: Record<string, { value: string; weight: number }> = {};
  for (const [property, { value, weight }] of Object.entries(cascade)) {
    if (property.startsWith("--")) continue;
    const resolved = cssVariables(value, variables);
    if (resolved === undefined) continue;
    const calculated = cssMath(resolved, context);
    if (calculated === undefined) continue;
    for (const [key, expanded] of Object.entries(expand(property, calculated)))
      if (!declarations[key] || declarations[key].weight <= weight)
        declarations[key] = { value: expanded, weight };
  }
  const result = { ...inherited, ...defaults };
  for (const [key, { value }] of Object.entries(declarations)) {
    if (value === "inherit" || value === "unset") {
      if (inherited[key] !== undefined) result[key] = inherited[key];
      continue;
    }
    if (value === "initial" || value === "revert-layer") {
      delete result[key];
      continue;
    }
    result[key] = value;
  }
  for (const [key, value] of Object.entries(result)) {
    if (key === "color" || key.includes("color") || key === "background")
      result[key] =
        cssColor(
          value === "currentcolor"
            ? (result.color ?? inherited.color ?? "black")
            : value,
        ) ?? value;
  }
  if (result["box-shadow"])
    result["box-shadow"] =
      cssShadow(
        result["box-shadow"].replace(
          /\bcurrentcolor\b/g,
          result.color ?? "#000",
        ),
      ) ?? "none";
  if (result.display === "inline-flex") {
    result.display = "flex";
    result["flex-direction"] ??= "row";
  }
  if (["fragment", "show", "for", "lazy-view"].includes(node.type ?? ""))
    result.display = "contents";
  for (const key of Object.keys(result))
    if (key.startsWith("--")) delete result[key];
  return result;
}
