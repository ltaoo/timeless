import type { TuiNode, TuiElement } from "./nodes";

const ESC = "\x1b[";
const RESET = `${ESC}0m`;
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

function collectRenderLines(node: TuiNode): string[] {
  if (node.kind === "text") {
    const t = node.textContent;
    return t ? t.split("\n") : [];
  }
  if (node.kind === "element") {
    const el = node as TuiElement;
    const prefix = getAttr(el, "prefix") ?? "";
    const suffix = getAttr(el, "suffix") ?? "";
    const childLines: string[] = [];
    for (const child of node.childNodes) {
      childLines.push(...collectRenderLines(child));
    }
    if (childLines.length === 0) return [prefix + suffix];
    return childLines.map(
      (line, i) =>
        (i === 0 ? prefix : "") +
        line +
        (i === childLines.length - 1 ? suffix : ""),
    );
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
