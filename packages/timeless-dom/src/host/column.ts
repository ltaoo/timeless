import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

const BP_MIN: Record<string, string> = {
  sm: "576px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

let _colSeq = 0;

function injectCSS(id: string, css: string) {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function normalizeJustify(v: string): string {
  const map: Record<string, string> = {
    start: "flex-start",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  };
  return map[v] ?? v;
}

function normalizeAlign(v: string): string {
  const map: Record<string, string> = {
    start: "flex-start",
    end: "flex-end",
  };
  return map[v] ?? v;
}

function normalizePadding(v: number | string): string {
  if (typeof v === "number") return `${v}px`;
  return v;
}

function normalizeWidth(v: number | string): string {
  if (typeof v === "number") return `${v}px`;
  return v;
}

// ─── DOMColumn ───────────────────────────────────────────────────────────────
// Flex column container (flex-direction: column).

export type DOMColumn = VNodeView<HTMLDivElement> & {
  t: "column";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMColumn(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMColumn {
  const box$ = HostElement({ $elm: null, t: "column", build: props.build });

  return {
    ...box$.methods,
    t: "column",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });
      const s = elm.state ?? {};
      $elm.style.display = "flex";
      $elm.style.flexDirection = "column";
      if (s.gap !== undefined) $elm.style.gap = `${s.gap}px`;
      if (s.align) $elm.style.alignItems = normalizeAlign(s.align);
      if (s.justify) $elm.style.justifyContent = normalizeJustify(s.justify);
      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMColumn(value: any): value is DOMColumn {
  return value.t === "column";
}

// ─── DOMCol ──────────────────────────────────────────────────────────────────
// Flex item / grid item.  Child of Row or Grid.

export type DOMCol = VNodeView<HTMLDivElement> & {
  t: "col";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

function buildColBpCSS(cls: string, flexBp: Record<string, any>): string {
  const xs = flexBp.xs;
  let css = `.${cls}{`;
  if (xs !== undefined) {
    css += typeof xs === "number" ? `flex:${xs};` : `flex:${xs};`;
  }
  css += "}";

  for (const bp of ["sm", "md", "lg", "xl"] as const) {
    const v = flexBp[bp];
    if (v === undefined) continue;
    const flex = typeof v === "number" ? String(v) : v;
    css += `@media(min-width:${BP_MIN[bp]}){.${cls}{flex:${flex};}}`;
  }
  return css;
}

export function DOMCol(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMCol {
  const box$ = HostElement({ $elm: null, t: "col", build: props.build });

  return {
    ...box$.methods,
    t: "col",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });

      const s = elm.state ?? {};
      const flex = s.flex;

      if (flex !== undefined && typeof flex === "object") {
        // Responsive flex
        const cls = `tl-col-${++_colSeq}`;
        injectCSS(`tl-col-style-${cls}`, buildColBpCSS(cls, flex));
        $elm.classList.add(cls);
      } else if (flex !== undefined) {
        $elm.style.flex = typeof flex === "number" ? String(flex) : flex;
      }

      if (s.width !== undefined) $elm.style.width = normalizeWidth(s.width);
      if (s.padding !== undefined)
        $elm.style.padding = normalizePadding(s.padding);

      // Grid positioning
      if (s.span !== undefined)
        $elm.style.gridColumn = `span ${s.span} / span ${s.span}`;
      if (s.start !== undefined) $elm.style.gridColumnStart = String(s.start);
      if (s.end !== undefined) $elm.style.gridColumnEnd = String(s.end);
      if (s.rowSpan !== undefined)
        $elm.style.gridRow = `span ${s.rowSpan} / span ${s.rowSpan}`;
      if (s.rowStart !== undefined) $elm.style.gridRowStart = String(s.rowStart);
      if (s.rowEnd !== undefined) $elm.style.gridRowEnd = String(s.rowEnd);

      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMCol(value: any): value is DOMCol {
  return value.t === "col";
}
