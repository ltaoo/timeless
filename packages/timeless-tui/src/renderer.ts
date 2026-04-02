import type { TuiNode, TuiElement } from "./nodes";

const ESC = "\x1b[";
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
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

function collectRenderLines(node: TuiNode): string[] {
  if (node.kind === "text") {
    const t = node.textContent;
    return t ? t.split("\n") : [];
  }
  if (node.kind === "element") {
    const el = node as TuiElement;
    const prefix = getAttr(el, "prefix") ?? "";
    const suffix = getAttr(el, "suffix") ?? "";

    // Convert CSS style to ANSI escape sequences
    let stylePrefix = "";
    const cssText = (el.style as any)?.cssText;
    if (cssText) {
      stylePrefix = styleFromCss(cssText);
    }

    const childLines: string[] = [];
    for (const child of node.childNodes) {
      childLines.push(...collectRenderLines(child));
    }
    if (childLines.length === 0) return [prefix + stylePrefix + suffix + (stylePrefix ? RESET : "")];

    // Apply style prefix and RESET suffix to each line
    return childLines.map((line, i) => {
      const linePrefix = (i === 0 ? prefix : "") + stylePrefix;
      const lineSuffix = (stylePrefix ? RESET : "") + (i === childLines.length - 1 ? suffix : "");
      return linePrefix + line + lineSuffix;
    });
  }
  const lines: string[] = [];
  for (const child of node.childNodes) {
    lines.push(...collectRenderLines(child));
  }
  return lines;
}

export function renderTree(root: TuiNode): string[] {
  return collectRenderLines(root);
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
