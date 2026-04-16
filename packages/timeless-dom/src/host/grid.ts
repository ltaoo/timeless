import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

const BP_MIN: Record<string, string> = {
  sm: "576px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

let _gridSeq = 0;

function injectCSS(id: string, css: string) {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

function normalizeContent(v: string): string {
  const map: Record<string, string> = {
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
    start: "start",
    end: "end",
  };
  return map[v] ?? v;
}

function normalizeFlow(v: string): string {
  const map: Record<string, string> = {
    col: "column",
    "row-dense": "row dense",
    "col-dense": "column dense",
  };
  return map[v] ?? v;
}

function colsToTemplate(n: number): string {
  return `repeat(${n},minmax(0,1fr))`;
}

function normalizeRows(v: number | string): string {
  if (typeof v === "number") return `repeat(${v},minmax(0,1fr))`;
  if (/^\d+$/.test(String(v))) return `repeat(${v},minmax(0,1fr))`;
  return String(v);
}

function buildGridBpCSS(cls: string, colsBp: Record<string, number>): string {
  const xs = colsBp.xs;
  let css = `.${cls}{display:grid;`;
  if (xs !== undefined) css += `grid-template-columns:${colsToTemplate(xs)};`;
  css += "}";

  for (const bp of ["sm", "md", "lg", "xl"] as const) {
    const n = colsBp[bp];
    if (n === undefined) continue;
    css += `@media(min-width:${BP_MIN[bp]}){.${cls}{grid-template-columns:${colsToTemplate(n)};}}`;
  }
  return css;
}

export type DOMGrid = VNodeView<HTMLDivElement> & {
  t: "grid";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMGrid(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMGrid {
  const box$ = HostElement({ $elm: null, t: "grid", build: props.build });

  return {
    ...box$.methods,
    t: "grid",
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

      // ── Columns (responsive or static) ──────────────────────────────────
      const cols = s.cols;
      if (cols !== undefined && typeof cols === "object") {
        const cls = `tl-grid-${++_gridSeq}`;
        injectCSS(
          `tl-grid-style-${cls}`,
          buildGridBpCSS(cls, cols as Record<string, number>),
        );
        $elm.classList.add(cls);
        // display:grid set inside the injected CSS
      } else {
        $elm.style.display = "grid";
        if (cols !== undefined) {
          $elm.style.gridTemplateColumns = colsToTemplate(cols as number);
        }
      }

      // ── Rows ─────────────────────────────────────────────────────────────
      if (s.rows !== undefined) {
        $elm.style.gridTemplateRows = normalizeRows(s.rows);
      }
      if (s.autoRows) $elm.style.gridAutoRows = s.autoRows;
      if (s.autoCols) $elm.style.gridAutoColumns = s.autoCols;
      if (s.flow) $elm.style.gridAutoFlow = normalizeFlow(s.flow);

      // ── Gap ──────────────────────────────────────────────────────────────
      if (s.gapX !== undefined || s.gapY !== undefined) {
        if (s.gapY !== undefined) $elm.style.rowGap = `${s.gapY}px`;
        if (s.gapX !== undefined) $elm.style.columnGap = `${s.gapX}px`;
      } else if (s.gap !== undefined) {
        $elm.style.gap = `${s.gap}px`;
      }

      // ── Alignment ────────────────────────────────────────────────────────
      if (s.placeItems) {
        $elm.style.placeItems = s.placeItems;
      } else {
        if (s.alignItems) $elm.style.alignItems = s.alignItems;
        if (s.justifyItems) $elm.style.justifyItems = s.justifyItems;
      }
      if (s.placeContent) {
        $elm.style.placeContent = normalizeContent(s.placeContent);
      } else {
        if (s.alignContent)
          $elm.style.alignContent = normalizeContent(s.alignContent);
        if (s.justifyContent)
          $elm.style.justifyContent = normalizeContent(s.justifyContent);
      }

      // ── Spacing ──────────────────────────────────────────────────────────
      if (s.marginBottom !== undefined)
        $elm.style.marginBottom = `${s.marginBottom}px`;
      if (s.marginTop !== undefined) $elm.style.marginTop = `${s.marginTop}px`;
      if (s.marginLeft !== undefined)
        $elm.style.marginLeft = `${s.marginLeft}px`;
      if (s.marginRight !== undefined)
        $elm.style.marginRight = `${s.marginRight}px`;
      if (s.padding !== undefined) $elm.style.padding = `${s.padding}px`;

      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $dom: HTMLDivElement) {
      box$.methods.set$elm($dom);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMGrid(value: any): value is DOMGrid {
  return value.t === "grid";
}
