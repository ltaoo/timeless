import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

const BP_MIN: Record<string, string> = {
  sm: "576px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};

let _rowSeq = 0;

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

function buildRowBpCSS(cls: string, state: any): string {
  const bps: Record<string, any> = state.breakpoints ?? {};
  // xs – default (no media query)
  const xs = bps.xs ?? {};
  const direction = xs.direction ?? state.direction ?? "row";
  const gap = xs.gap ?? state.gap;
  const wrap = xs.wrap ?? state.wrap;
  const align = xs.align ?? state.align;
  const justify = xs.justify ?? state.justify;

  let css = `.${cls}{display:flex;flex-direction:${direction};`;
  if (gap !== undefined) css += `gap:${gap}px;`;
  if (wrap) css += `flex-wrap:wrap;`;
  if (align) css += `align-items:${normalizeAlign(align)};`;
  if (justify) css += `justify-content:${normalizeJustify(justify)};`;
  css += "}";

  for (const bp of ["sm", "md", "lg", "xl"] as const) {
    const cfg = bps[bp];
    if (!cfg) continue;
    let inner = "";
    if (cfg.direction) inner += `flex-direction:${cfg.direction};`;
    if (cfg.gap !== undefined) inner += `gap:${cfg.gap}px;`;
    if (cfg.wrap !== undefined)
      inner += `flex-wrap:${cfg.wrap ? "wrap" : "nowrap"};`;
    if (cfg.align) inner += `align-items:${normalizeAlign(cfg.align)};`;
    if (cfg.justify)
      inner += `justify-content:${normalizeJustify(cfg.justify)};`;
    if (inner)
      css += `@media(min-width:${BP_MIN[bp]}){.${cls}{${inner}}}`;
  }
  return css;
}

export type DOMRow = VNodeView<HTMLDivElement> & {
  t: "row";
  render(): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMRow(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
  elm: TimelessElement;
}): DOMRow {
  const box$ = HostElement({ $elm: null, t: "row", build: props.build });

  return {
    ...box$.methods,
    t: "row",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render() {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(props.elm.state, { initial: true });

      const s = props.elm.state ?? {};
      const hasBreakpoints = s.breakpoints && Object.keys(s.breakpoints).length > 0;

      if (hasBreakpoints) {
        // Responsive: inject CSS class with media queries
        const cls = `tl-row-${++_rowSeq}`;
        injectCSS(`tl-row-style-${cls}`, buildRowBpCSS(cls, s));
        $elm.classList.add(cls);
      } else {
        // Static: inline styles
        $elm.style.display = "flex";
        $elm.style.flexDirection = s.direction ?? "row";
        if (s.gap !== undefined) $elm.style.gap = `${s.gap}px`;
        if (s.wrap) $elm.style.flexWrap = "wrap";
        if (s.align) $elm.style.alignItems = normalizeAlign(s.align);
        if (s.justify) $elm.style.justifyContent = normalizeJustify(s.justify);
      }

      const $fragment = box$.methods.render(props.elm.children);
      box$.methods.setupEventListener(props.elm.events);
      $elm.appendChild($fragment);
      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMRow(value: any): value is DOMRow {
  return value.t === "row";
}
