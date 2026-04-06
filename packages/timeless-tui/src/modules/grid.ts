import { VNode, isRef, getRendererScheduler } from "@timeless/timeless";

import { getTerminalSize } from "../host/draw";

const { createElement, createText, appendChild, isDescriptor } = VNode;

// ─── ANSI helpers ────────────────────────────────────────────────

const ESC = "\x1b[";
const RESET = `${ESC}0m`;
const BOLD = `${ESC}1m`;
const DGRAY = `${ESC}38;5;245m`;

const FG_COLORS: Record<string, string> = {
  gray: `${ESC}38;5;245m`,
  grey: `${ESC}38;5;245m`,
  white: `${ESC}38;5;255m`,
  red: `${ESC}38;5;196m`,
  blue: `${ESC}38;5;21m`,
  cyan: `${ESC}38;5;51m`,
  green: `${ESC}38;5;46m`,
  yellow: `${ESC}38;5;226m`,
  magenta: `${ESC}38;5;201m`,
};

function cssColorToAnsi(color: string) {
  if (!color) return DGRAY;
  return FG_COLORS[color.toLowerCase()] ?? DGRAY;
}

// ─── String width helper (emoji = 2 cols) ────────────────────────

function strWidth(s: string) {
  let w = 0;
  for (let i = 0; i < s.length; ) {
    const cp = s.codePointAt(i)!;
    i += cp > 0xffff ? 2 : 1;
    w += cp > 0x10000 ? 2 : 1;
  }
  return w;
}

function padCenter(text: string, width: number) {
  const tw = strWidth(text);
  const pad = Math.max(0, width - tw);
  const l = Math.floor(pad / 2);
  return " ".repeat(l) + text + " ".repeat(pad - l);
}

// ─── TUI ComponentFns ────────────────────────────────────────────

function buildGridText(children: any[], cols: number): string[] {
  const gap = 1;
  const cellW = 18;

  const { width: termW } = getTerminalSize();
  const gridW = cols * cellW + (cols - 1) * gap;
  const ox = Math.max(0, Math.floor((termW - gridW) / 2));
  const indent = " ".repeat(ox);

  const rows = Math.ceil(children.length / cols);
  const allLines: string[] = [];

  for (let r = 0; r < rows; r++) {
    const rowCells: string[][] = [];
    let maxH = 0;

    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= children.length || !isDescriptor(children[idx])) {
        rowCells.push([" ".repeat(cellW)]);
        continue;
      }

      const itemDesc = children[idx];
      const itemChildren = itemDesc.children ?? [];
      const innerW = cellW - 2; // borders
      const itemStyle = itemDesc.props?.style ?? {};

      // Resolve borderColor (may be a Ref)
      const rawBorderColor = itemStyle.borderColor;
      const borderColor = isRef(rawBorderColor)
        ? rawBorderColor.value
        : rawBorderColor;
      const borderAnsi = borderColor ? cssColorToAnsi(borderColor) : DGRAY;

      // Build item lines from View's children (Txt descriptors)
      const contentLines: string[] = [];
      for (const txtDesc of itemChildren) {
        if (!isDescriptor(txtDesc)) continue;
        const txtChildren = txtDesc.children ?? [];
        const text = txtChildren
          .filter((c: any) => typeof c === "string" || typeof c === "number")
          .join("");
        const style = txtDesc.props?.style ?? {};

        let ansi = "";
        if (style.fontWeight === "bold") ansi += BOLD;
        if (style.color) ansi += cssColorToAnsi(style.color);

        const padded = padCenter(text, innerW);
        contentLines.push(ansi ? ansi + padded + RESET : padded);
      }

      // Build bordered cell
      const cellLines: string[] = [];
      cellLines.push(borderAnsi + "+" + "-".repeat(innerW) + "+" + RESET);
      for (const line of contentLines) {
        cellLines.push(
          borderAnsi + "|" + RESET + line + borderAnsi + "|" + RESET,
        );
      }
      cellLines.push(borderAnsi + "+" + "-".repeat(innerW) + "+" + RESET);

      rowCells.push(cellLines);
      maxH = Math.max(maxH, cellLines.length);
    }

    // Merge row cells line by line
    for (let lh = 0; lh < maxH; lh++) {
      let rowStr = "";
      for (let c = 0; c < cols; c++) {
        const pad = c > 0 ? " ".repeat(gap) : "";
        rowStr += pad + (rowCells[c][lh] ?? " ".repeat(cellW));
      }
      allLines.push(indent + rowStr);
    }

    if (r < rows - 1) {
      allLines.push(""); // gap between rows
    }
  }

  return allLines;
}

export function TuiGrid(props: any, children: any[]) {
  const cols = props.columns ?? 4;

  const allLines = buildGridText(children, cols);

  const root = createElement("div", {});
  const textNode = createText(allLines.join("\n"));
  appendChild(root, textNode);

  // Subscribe to Ref values in children's style for reactive updates
  const scheduler = getRendererScheduler();
  for (const child of children) {
    if (!isDescriptor(child)) continue;
    const style = child.props?.style;
    if (!style || typeof style !== "object") continue;
    for (const k of Object.keys(style)) {
      const v = style[k];
      if (isRef(v)) {
        v.subscribe({
          onChange() {
            const newLines = buildGridText(children, cols);
            textNode.text = newLines.join("\n");
            scheduler.patch(textNode, { text: textNode.text });
          },
        });
      }
    }
  }

  return root;
}
