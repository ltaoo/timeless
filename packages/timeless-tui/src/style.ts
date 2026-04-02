import { ESC, RESET, fgColor, bgColor } from "./renderer";

// ─── Text attributes ────────────────────────────────────────────
export const BOLD = `${ESC}1m`;
export const DIM = `${ESC}2m`;
export const UNDERLINE = `${ESC}4m`;
export const BLINK = `${ESC}5m`;
export const REVERSE = `${ESC}7m`;

// ─── Named foreground colors ────────────────────────────────────
export const WHITE = fgColor(255);
export const BLACK = fgColor(0);
export const RED = fgColor(196);
export const GREEN = fgColor(46);
export const BLUE = fgColor(69);
export const YELLOW = fgColor(226);
export const CYAN = fgColor(51);
export const MAGENTA = fgColor(201);
export const ORANGE = fgColor(208);
export const GRAY = fgColor(245);
export const DGRAY = fgColor(240);

// ─── Named background colors ────────────────────────────────────
export const BG_DARK = bgColor(235);
export const BG_TILE = bgColor(238);
export const BG_FOCUS = bgColor(51);
export const BG_HEADER = bgColor(236);
export const BG_FOOTER = bgColor(236);
export const BG_POPUP = bgColor(240);

// ─── Visible-length helpers ─────────────────────────────────────

/** Strip ANSI escape codes from a string. */
export function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

/** Visible column width of a string (ignores ANSI codes). */
export function vlen(s: string): number {
  return stripAnsi(s).length;
}

/** Left-pad a styled string to a visible width. */
export function vpad(s: string, n: number): string {
  const need = n - vlen(s);
  return need > 0 ? s + " ".repeat(need) : s;
}

/** Center a styled string within a visible width. */
export function vcenter(s: string, n: number): string {
  const vl = vlen(s);
  const l = Math.max(0, Math.floor((n - vl) / 2));
  const r = Math.max(0, n - vl - l);
  return " ".repeat(l) + s + " ".repeat(r);
}

/** Right-align a styled string within a visible width. */
export function vright(s: string, n: number): string {
  const need = n - vlen(s);
  return need > 0 ? " ".repeat(need) + s : s;
}
