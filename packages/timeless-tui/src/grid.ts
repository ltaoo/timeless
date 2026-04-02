import { createTuiText, type TuiNode } from "./nodes";
import { getTerminalSize, RESET } from "./renderer";
import { WHITE, DGRAY, BOLD } from "./style";
import { getTuiHost } from "./host-accessor";
import { TUI } from "./tui";

export interface Ref<T> {
  value: T;
  as(valOrFn: T | ((prev: T) => T)): void;
  _subscribe(sub: { onChange: (v: T) => void }): void;
  _unsubscribe(sub: { onChange: (v: T) => void }): void;
}

function isRef(v: any): v is Ref<any> {
  return (
    !!v &&
    typeof v === "object" &&
    "value" in v &&
    typeof v._subscribe === "function"
  );
}

// ─── GridItem ───────────────────────────────────────────────────

export interface GridItemProps {
  /** Cell width in columns, default 16 */
  width?: number;
  /** Arbitrary payload, accessible via item data */
  data?: any;
}

export interface GridItemNode {
  kind: "grid-item";
  props: GridItemProps;
  children: any[];
}

export function GridItem(props: GridItemProps, children: any[]): GridItemNode {
  return { kind: "grid-item", props, children };
}

// ─── GridLayout ─────────────────────────────────────────────────

export interface GridLayoutProps {
  /** Number of columns */
  x?: number;
  /** (ignored — rows derived from item count) */
  y?: number;
  /** Gap between tiles in columns, default 1 */
  gap?: number;
  /** Focus index — number or Ref<number>. When Ref, auto arrow-key navigation is enabled. */
  focus?: number | Ref<number>;
  /** ANSI color for focused item border, default WHITE */
  focusColor?: string;
  /** ANSI color for unfocused item border, default DGRAY */
  borderColor?: string;
}

// ─── CSS → ANSI color parsing ───────────────────────────────────

function parseCssProps(cssText: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const part of cssText.split(";")) {
    const [k, ...v] = part.split(":");
    if (k && v.length) props[k.trim().toLowerCase()] = v.join(":").trim();
  }
  return props;
}

const FG_COLORS: Record<string, string> = {
  red: "\x1b[38;5;196m",
  green: "\x1b[38;5;46m",
  blue: "\x1b[38;5;21m",
  yellow: "\x1b[38;5;226m",
  cyan: "\x1b[38;5;51m",
  magenta: "\x1b[38;5;201m",
  white: "\x1b[38;5;255m",
  black: "\x1b[38;5;0m",
  gray: "\x1b[38;5;245m",
  grey: "\x1b[38;5;245m",
  orange: "\x1b[38;5;208m",
};

const BG_COLORS: Record<string, string> = {
  red: "\x1b[48;5;196m",
  green: "\x1b[48;5;46m",
  blue: "\x1b[48;5;21m",
  yellow: "\x1b[48;5;226m",
  cyan: "\x1b[48;5;51m",
  magenta: "\x1b[48;5;201m",
  white: "\x1b[48;5;255m",
  black: "\x1b[48;5;0m",
  gray: "\x1b[48;5;245m",
  grey: "\x1b[48;5;245m",
  orange: "\x1b[48;5;208m",
};

function hexToAnsi(hex: string, isBg: boolean): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[${isBg ? 48 : 38};2;${r};${g};${b}m`;
}

function cssColorToAnsi(color: string, isBg: boolean): string {
  if (!color) return "";
  if (color.startsWith("#") && color.length === 7) {
    return hexToAnsi(color, isBg);
  }
  const table = isBg ? BG_COLORS : FG_COLORS;
  return table[color.toLowerCase()] ?? "";
}

function styleFromCss(cssText: string): string {
  const p = parseCssProps(cssText);
  let s = "";
  if (p.color) s += cssColorToAnsi(p.color, false);
  if (p["background-color"]) s += cssColorToAnsi(p["background-color"], true);
  if (p["font-weight"] === "bold") s += BOLD;
  return s;
}

// ─── Host node tree → ANSI text lines ──────────────────────────

function collectHostNodeLines(node: any): string[] {
  if (!node) return [];
  if (node.kind === "text") {
    const t = node.textContent;
    return t ? t.split("\n") : [];
  }
  if (node.kind === "element") {
    let prefix = "";
    if (node.style?.cssText) prefix = styleFromCss(node.style.cssText);

    const childLines: string[] = [];
    for (const child of node.childNodes) {
      childLines.push(...collectHostNodeLines(child));
    }
    if (childLines.length === 0) childLines.push("");

    if (prefix) return childLines.map((l) => prefix + l + RESET);
    return childLines;
  }
  // fragment
  const lines: string[] = [];
  for (const child of node.childNodes) {
    lines.push(...collectHostNodeLines(child));
  }
  return lines.length ? lines : [""];
}

function isTimelessElement(v: any): boolean {
  return !!v && typeof v === "object" && typeof v.t === "string" && "$elm" in v;
}

function renderElementToLines(elm: any): string[] {
  const host = getTuiHost();
  if (!host) return [];
  const body = host.getBody();
  const rendered = elm.render();
  if (!rendered) return [];
  host.appendChild(body, rendered);
  const lines = collectHostNodeLines(body);
  host.clearChildren(body);
  return lines;
}

// ─── Child → text lines ─────────────────────────────────────────

function renderChildToLines(child: any, width: number): string[] {
  if (typeof child === "string") {
    const pad = Math.max(0, width - child.length);
    const l = Math.floor(pad / 2);
    return [" ".repeat(l) + child + " ".repeat(pad - l)];
  }
  if (typeof child === "number") {
    return renderChildToLines(String(child), width);
  }
  if (isTimelessElement(child)) {
    return renderElementToLines(child);
  }
  if (typeof child === "function") {
    return child();
  }
  return [];
}

// ─── Grid tile rendering ────────────────────────────────────────

function renderGridItem(
  item: GridItemNode,
  tw: number,
  foc: boolean,
  focusColor: string,
  borderColor: string,
): string[] {
  const bdr = foc ? focusColor : borderColor;
  const inner = tw - 2;

  const lines: string[] = [];
  lines.push(bdr + "+" + "-".repeat(inner) + "+" + RESET);

  for (const child of item.children) {
    const childLines = renderChildToLines(child, inner);
    for (const cl of childLines) {
      lines.push(bdr + "|" + RESET + cl + bdr + "|" + RESET);
    }
  }

  lines.push(bdr + "+" + "-".repeat(inner) + "+" + RESET);
  return lines;
}

export function GridLayout(
  props: GridLayoutProps,
  items: GridItemNode[],
): TuiNode[] {
  const cols = props.x ?? 4;
  const gap = props.gap ?? 1;
  const focusColor = props.focusColor ?? WHITE;
  const borderColor = props.borderColor ?? DGRAY;
  const tw = items[0]?.props.width ?? 16;

  // Resolve focus value
  let focusIdx: number;
  if (isRef(props.focus)) {
    focusIdx = (props.focus as Ref<number>).value;
  } else {
    focusIdx = (props.focus as number) ?? -1;
  }

  // Auto navigation: if focus is a Ref, subscribe + register arrow keys
  if (isRef(props.focus)) {
    const focusRef = props.focus as Ref<number>;
    const total = items.length;
    const maxR = Math.max(0, Math.ceil(total / cols) - 1);

    // Subscribe to focus changes → reload terminal
    focusRef._subscribe({ onChange: () => TUI.reload() });

    // Register arrow key handler
    TUI.onKeydown((key) => {
      focusRef.as((cur: number) => {
        const r = Math.floor(cur / cols);
        const c = cur % cols;
        switch (key) {
          case "left":
            return c > 0 ? cur - 1 : cur;
          case "right":
            return c < cols - 1 && cur + 1 < total ? cur + 1 : cur;
          case "up":
            return r > 0 ? cur - cols : cur;
          case "down":
            return r < maxR && cur + cols < total ? cur + cols : cur;
          default:
            return cur;
        }
      });
    });
  }

  const { width } = getTerminalSize();
  const rows = Math.ceil(items.length / cols);
  const gridW = cols * tw + (cols - 1) * gap;
  const ox = Math.max(0, Math.floor((width - gridW) / 2));

  const nodes: TuiNode[] = [];

  for (let r = 0; r < rows; r++) {
    const rowItems: string[][] = [];
    let maxH = 0;

    for (let c = 0; c < cols; c++) {
      const ai = r * cols + c;
      if (ai >= items.length) {
        rowItems.push(new Array(3).fill(" ".repeat(tw)));
      } else {
        const rendered = renderGridItem(
          items[ai],
          tw,
          ai === focusIdx,
          focusColor,
          borderColor,
        );
        rowItems.push(rendered);
        maxH = Math.max(maxH, rendered.length);
      }
    }

    for (let lh = 0; lh < maxH; lh++) {
      let rowStr = "";
      for (let c = 0; c < cols; c++) {
        const pad = c > 0 ? " ".repeat(gap) : "";
        rowStr += pad + (rowItems[c][lh] ?? " ".repeat(tw));
      }
      nodes.push(createTuiText(" ".repeat(ox) + rowStr));
    }

    if (r < rows - 1) {
      nodes.push(createTuiText(""));
    }
  }

  return nodes;
}
