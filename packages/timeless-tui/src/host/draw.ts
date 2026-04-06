import { KeyName, parseKey, createTuiInput } from "@/modules/input";
import {
  createTuiElement,
  createTuiText,
  createTuiFragment,
  isTuiNode,
  TUI_NODE,
  type TuiNode,
  type TuiElement,
  type TuiText,
  type TuiFragment,
  type TuiNodeKind,
  type TuiAttributes,
} from "./nodes";

export interface TuiGlobal {
  onKeydown(handler: (key: KeyName) => void): void;
  reload(): void;
  exit(): void;
  readonly cols: number;
  readonly rows: number;
}

const input = createTuiInput();
let appFn: (() => TuiNode) | null = null;
let target: NodeJS.WritableStream = process.stdout;
let running = false;
let rafId: ReturnType<typeof setTimeout> | null = null;
let dirty = false;
const keydownHandlers: ((key: KeyName) => void)[] = [];

function doRender() {
  if (!dirty || !appFn) return;
  dirty = false;
  const tree = appFn();
  renderToScreen(tree, target);
}

function scheduleRender() {
  if (dirty) return;
  dirty = true;
  if (!running) return;
  if (rafId !== null) return;
  rafId = setTimeout(() => {
    rafId = null;
    doRender();
  }, 0);
}

function handleRawKey(raw: string) {
  const key = parseKey(raw);
  for (const h of keydownHandlers) h(key);
}

function handleResize() {
  dirty = true;
  doRender();
}

function handleSIGINT() {
  TUI.exit();
  process.exit(0);
}

const ESC = "\x1b[";
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const UNDERLINE = `${ESC}4m`;
const REVERSE = `${ESC}7m`;
const CLEAR_SCREEN = `${ESC}2J`;
const CURSOR_HOME = `${ESC}H`;
const HIDE_CURSOR = `${ESC}?25l`;
const SHOW_CURSOR = `${ESC}?25h`;

function fgColor(code: number): string {
  return `${ESC}38;5;${code}m`;
}

function bgColor(code: number): string {
  return `${ESC}48;5;${code}m`;
}

function moveTo(row: number, col: number): string {
  return `${ESC}${row + 1};${col + 1}H`;
}

export interface Buffer {
  width: number;
  height: number;
  cells: string[][];
}

export function createBuffer(width: number, height: number): Buffer {
  const cells: string[][] = [];
  for (let r = 0; r < height; r++) {
    cells.push(new Array(width).fill(" "));
  }
  return { width, height, cells };
}

export function clearBuffer(buf: Buffer) {
  for (let r = 0; r < buf.height; r++) {
    for (let c = 0; c < buf.width; c++) {
      buf.cells[r][c] = " ";
    }
  }
}

export function writeToBuffer(
  buf: Buffer,
  row: number,
  col: number,
  text: string,
) {
  if (row < 0 || row >= buf.height) return;
  for (let i = 0; i < text.length; i++) {
    const c = col + i;
    if (c < 0 || c >= buf.width) continue;
    buf.cells[row][c] = text[i];
  }
}

function collectTextLines(node: TuiNode): string[] {
  if (node.kind === "text") {
    const text = node.textContent;
    if (!text) return [];
    return text.split("\n");
  }

  const lines: string[] = [];
  for (const child of node.childNodes) {
    const childLines = collectTextLines(child);
    lines.push(...childLines);
  }

  if (lines.length === 0 && node.kind === "element") {
    return [""];
  }

  return lines;
}

function getAttr(el: TuiElement, name: string): string | null {
  return el.attrs.get(name);
}

// ─── CSS → ANSI color parsing ───────────────────────────────────

function parseCssProps(cssText: string): Record<string, string> {
  const props: Record<string, string> = {};
  for (const part of cssText.split(";")) {
    const [k, ...v] = part.split(":");
    if (!k || !v.length) continue;
    const rawKey = k.trim();
    if (!rawKey) continue;
    const key = normalizeCssKey(rawKey);
    props[key] = v.join(":").trim();
  }
  return props;
}

function normalizeCssKey(key: string) {
  const trimmed = key.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("-")) return trimmed.toLowerCase();
  return trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
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

function ansiVisibleWidth(s: string): number {
  let cols = 0;
  let i = 0;
  while (i < s.length) {
    if (s.charCodeAt(i) === 0x1b && s[i + 1] === "[") {
      let j = i + 2;
      while (j < s.length && s.charCodeAt(j) < 0x40) j++;
      i = j + 1;
      continue;
    }
    const cp = s.codePointAt(i)!;
    i += cp > 0xffff ? 2 : 1;
    cols += cp > 0x10000 ? 2 : 1;
  }
  return cols;
}

function padRight(line: string, width: number) {
  const w = ansiVisibleWidth(line);
  if (w >= width) return line;
  return line + " ".repeat(width - w);
}

function alignLine(line: string, width: number, align: string) {
  if (!width || width <= 0) return line;
  if (align !== "center" && align !== "right") return line;
  const w = ansiVisibleWidth(line);
  if (w >= width) return line;
  const pad = width - w;
  if (align === "right") return " ".repeat(pad) + line;
  const l = Math.floor(pad / 2);
  const r = pad - l;
  return " ".repeat(l) + line + " ".repeat(r);
}

type RenderContext = {
  width: number;
};

function collectRenderLines(node: TuiNode, ctx: RenderContext): string[] {
  if (node.kind === "text") {
    const t = node.textContent;
    return t ? t.split("\n") : [];
  }
  if (node.kind === "element") {
    const el = node as TuiElement;
    const prefix = getAttr(el, "prefix") ?? "";
    const suffix = getAttr(el, "suffix") ?? "";
    const focused = getAttr(el, "data-focused") === "true";

    // Convert CSS style to ANSI escape sequences
    let stylePrefix = "";
    const cssText = (el.style as any)?.cssText;
    let cssProps: Record<string, string> | null = null;
    if (cssText) {
      stylePrefix = styleFromCss(cssText);
      cssProps = parseCssProps(cssText);
      const opacity = cssProps.opacity;
      if (opacity !== undefined) {
        const n = Number.parseFloat(opacity);
        if (Number.isFinite(n) && n <= 0) return [];
      }
      if (cssProps.display === "grid") {
        return renderGridElement(el, ctx);
      }
      if (
        cssProps["grid-template-columns"] ||
        cssProps["grid-columns"] ||
        cssProps.columns
      ) {
        return renderGridElement(el, ctx);
      }
    }

    const childLines: string[] = [];
    for (const child of node.childNodes) {
      childLines.push(...collectRenderLines(child, ctx));
    }
    if (childLines.length === 0)
      return [prefix + stylePrefix + suffix + (stylePrefix ? RESET : "")];

    // Apply style prefix and RESET suffix to each line
    const aligned = childLines.map((line, i) => {
      const focusPrefix = focused ? UNDERLINE : "";
      const focusMark = focused && i === 0 ? "> " : "";
      const linePrefix =
        (i === 0 ? prefix : "") + focusMark + focusPrefix + stylePrefix;
      const lineSuffix =
        (focused || stylePrefix ? RESET : "") +
        (i === childLines.length - 1 ? suffix : "");
      const combined = linePrefix + line + lineSuffix;
      const align = cssProps?.["text-align"] ?? cssProps?.textAlign;
      if (align) {
        return alignLine(combined, ctx.width, String(align).trim());
      }
      return combined;
    });
    return aligned;
  }
  const lines: string[] = [];
  for (const child of node.childNodes) {
    lines.push(...collectRenderLines(child, ctx));
  }
  return lines;
}

export function renderTree(root: TuiNode): string[] {
  const size = getTerminalSize();
  return collectRenderLines(root, { width: size.width });
}

function resolveGridColumnsFromCss(cssText: string): number {
  const p = parseCssProps(cssText);
  const raw =
    p["grid-columns"] ?? p.columns ?? p["grid-template-columns"] ?? undefined;
  if (!raw) return 4;
  const m1 = /repeat\(\s*(\d+)/i.exec(raw);
  if (m1) {
    const n = Number.parseInt(m1[1], 10);
    if (Number.isFinite(n)) return n;
  }
  const m2 = /(\d+)/.exec(raw);
  if (m2) {
    const n = Number.parseInt(m2[1], 10);
    if (Number.isFinite(n)) return n;
  }
  return 4;
}

function borderColorFromCss(cssText: string): string {
  const p = parseCssProps(cssText);
  return p["border-color"] ?? p.borderColor ?? "";
}

function renderGridElement(el: TuiElement, ctx: RenderContext): string[] {
  const gap = 1;
  const cssText = (el.style as any)?.cssText ?? "";
  const cols = Math.max(1, resolveGridColumnsFromCss(cssText));
  const cellW = Math.max(6, Math.floor((ctx.width - (cols - 1) * gap) / cols));
  const innerW = Math.max(1, cellW - 2);
  const gridW = cols * cellW + (cols - 1) * gap;
  const ox = Math.max(0, Math.floor((ctx.width - gridW) / 2));
  const indent = " ".repeat(ox);

  const cells: string[][] = [];
  for (const child of el.childNodes) {
    if (child.kind !== "element") {
      cells.push([" ".repeat(cellW)]);
      continue;
    }

    const cellEl = child as TuiElement;
    const cellCssText = (cellEl.style as any)?.cssText ?? "";
    const focused = cellEl.getAttribute("data-focused") === "true";
    const borderColor = focused ? "#007bff" : borderColorFromCss(cellCssText);
    const borderAnsi = borderColor
      ? cssColorToAnsi(borderColor, false)
      : "\x1b[38;5;245m";

    const contentLines: string[] = [];
    for (const sub of cellEl.childNodes) {
      contentLines.push(...collectRenderLines(sub, { width: innerW }));
    }

    const normalized =
      contentLines.length > 0
        ? contentLines
        : [alignLine("", innerW, "center")];

    const box: string[] = [];
    box.push(borderAnsi + "+" + "-".repeat(innerW) + "+" + RESET);
    for (const line of normalized) {
      const sliced = ansiSlice(line, innerW);
      const fixed = padRight(sliced, innerW);
      box.push(borderAnsi + "|" + RESET + fixed + borderAnsi + "|" + RESET);
    }
    box.push(borderAnsi + "+" + "-".repeat(innerW) + "+" + RESET);

    cells.push(box);
  }

  const rows = Math.ceil(cells.length / cols);
  const out: string[] = [];

  for (let r = 0; r < rows; r++) {
    const start = r * cols;
    const rowCells = cells.slice(start, start + cols);
    while (rowCells.length < cols) {
      rowCells.push([" ".repeat(cellW)]);
    }
    let maxH = 0;
    for (const cell of rowCells) maxH = Math.max(maxH, cell.length);

    for (let lh = 0; lh < maxH; lh++) {
      let rowStr = "";
      for (let c = 0; c < cols; c++) {
        if (c > 0) rowStr += " ".repeat(gap);
        rowStr += rowCells[c][lh] ?? " ".repeat(cellW);
      }
      out.push(indent + rowStr);
    }

    if (r < rows - 1) out.push("");
  }

  return out;
}

function ansiSlice(s: string, maxCols: number): string {
  let cols = 0;
  let i = 0;
  let lastSafe = 0;

  while (i < s.length && cols < maxCols) {
    if (s.charCodeAt(i) === 0x1b && s[i + 1] === "[") {
      // ANSI escape sequence — skip entirely, doesn't consume columns
      let j = i + 2;
      while (j < s.length && s.charCodeAt(j) < 0x40) j++;
      i = j + 1;
      lastSafe = i;
    } else {
      const cp = s.codePointAt(i)!;
      i += cp > 0xffff ? 2 : 1;
      // CJK / emoji = 2 cols, ASCII = 1, others heuristic = 1
      cols += cp > 0x10000 ? 2 : cp > 0x7f ? 1 : 1;
      lastSafe = i;
    }
  }
  return s.slice(0, lastSafe) + RESET;
}

export function renderToScreen(root: TuiNode, out: NodeJS.WritableStream) {
  const size = getTerminalSize();
  const lines = renderTree(root);

  let output = "";
  output += HIDE_CURSOR;
  output += CLEAR_SCREEN;
  output += CURSOR_HOME;

  for (let i = 0; i < Math.min(lines.length, size.height); i++) {
    output += moveTo(i, 0);
    output += ansiSlice(lines[i], size.width);
  }

  out.write(output);
}

export function renderToString(root: TuiNode): string {
  const lines = renderTree(root);
  return lines.join("\n");
}

export function clearScreen(out: NodeJS.WritableStream) {
  out.write(CLEAR_SCREEN + CURSOR_HOME);
}

export function showCursor(out: NodeJS.WritableStream) {
  out.write(SHOW_CURSOR);
}

export function hideCursor(out: NodeJS.WritableStream) {
  out.write(HIDE_CURSOR);
}

export function getTerminalSize(): { width: number; height: number } {
  return {
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
  };
}

export {
  ESC,
  RESET,
  CLEAR_SCREEN,
  CURSOR_HOME,
  HIDE_CURSOR,
  SHOW_CURSOR,
  fgColor,
  bgColor,
  moveTo,
};

export const TUI: TuiGlobal = {
  onKeydown(handler: (key: KeyName) => void) {
    keydownHandlers.push(handler);
  },

  reload() {
    if (running) scheduleRender();
  },

  exit() {
    if (!running) return;
    running = false;
    if (rafId !== null) {
      clearTimeout(rafId);
      rafId = null;
    }
    input.offKey(handleRawKey);
    input.stop();
    process.stdout.off("resize", handleResize);
    process.off("SIGINT", handleSIGINT);
    showCursor(target);
    clearScreen(target);
    process.exit(0);
  },

  get cols() {
    return getTerminalSize().width;
  },

  get rows() {
    return getTerminalSize().height;
  },
};

export function _setAppFn(fn: () => TuiNode) {
  appFn = () => {
    keydownHandlers.length = 0;
    return fn();
  };
}

export function _startTui(out?: NodeJS.WritableStream) {
  if (running) return;
  running = true;
  target = out ?? process.stdout;
  hideCursor(target);
  dirty = true;
  doRender();
  input.onKey(handleRawKey);
  input.start();
  process.stdout.on("resize", handleResize);
  process.on("SIGINT", handleSIGINT);
}
