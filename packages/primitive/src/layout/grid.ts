import { Ref, isRef } from "@timeless/reactive";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { ClassNameRef, isStyleRef } from "@/style";

export type GridAlign = "start" | "end" | "center" | "stretch" | "baseline";
export type GridJustify = GridAlign | "between" | "around" | "evenly";

export type GridAutoFlow = "row" | "col" | "dense" | "row-dense" | "col-dense";

function normalize_gap(gap: string) {
  const v = String(gap).trim();
  if (!v) return v;
  if (/^-?\d+(\.\d+)?$/.test(v)) {
    return `${Number(v) * 0.25}rem`;
  }
  return v;
}

function normalize_content(v: string) {
  const map: Record<string, string> = {
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  };
  return map[v] || v;
}

function normalize_columns(columns: number | string) {
  if (typeof columns === "number") {
    return `repeat(${columns}, minmax(0, 1fr))`;
  }
  const v = String(columns).trim();
  if (!v) return v;
  if (/^\d+$/.test(v)) {
    return `repeat(${Number(v)}, minmax(0, 1fr))`;
  }
  return v;
}

function normalize_rows(rows: number | string) {
  if (typeof rows === "number") {
    return `repeat(${rows}, minmax(0, 1fr))`;
  }
  const v = String(rows).trim();
  if (!v) return v;
  if (/^\d+$/.test(v)) {
    return `repeat(${Number(v)}, minmax(0, 1fr))`;
  }
  return v;
}

function normalize_flow(flow: GridAutoFlow) {
  if (flow === "row") return "row";
  if (flow === "col") return "column";
  if (flow === "dense") return "dense";
  if (flow === "row-dense") return "row dense";
  if (flow === "col-dense") return "column dense";
  return flow;
}

type GridProps = {
  columns?: number | string;
  rows?: number | string;
  autoRows?: string;
  autoCols?: string;
  flow?: GridAutoFlow;
  gap?: string;
  gapX?: string;
  gapY?: string;
  alignItems?: GridAlign;
  justifyItems?: GridAlign;
  alignContent?: GridJustify;
  justifyContent?: GridJustify;
  placeItems?: string;
  placeContent?: string;
  class?: string | Ref<string> | ClassNameRef;
} & ViewProps;
type GridState = {
  columns: number;
  rows: number;
  gap: string;
  alignItems: GridAlign;
  justifyItems: GridAlign;
  alignContent: GridJustify;
  justifyContent: GridJustify;
};

export function Grid(props: GridProps, children?: ViewChildren) {
  const {
    columns = 24,
    rows,
    autoRows,
    autoCols,
    flow,
    gap,
    gapX,
    gapY,
    alignItems,
    justifyItems,
    alignContent,
    justifyContent,
    placeItems,
    placeContent,
    class: cls,
    style: stl,
    ...rest
  } = props;

  const state: GridState = {
    columns: 0,
    rows: 0,
    gap: "",
    alignItems: "start",
    justifyItems: "start",
    alignContent: "start",
    justifyContent: "start",
  };
  const baseStyle: Record<string, any> = { display: "grid" };

  if (columns !== undefined) {
    const c = normalize_columns(columns);
    if (c) baseStyle["grid-template-columns"] = c;
  }
  if (rows !== undefined) {
    const r = normalize_rows(rows);
    if (r) baseStyle["grid-template-rows"] = r;
  }
  if (autoRows) baseStyle["grid-auto-rows"] = autoRows;
  if (autoCols) baseStyle["grid-auto-columns"] = autoCols;
  if (flow) baseStyle["grid-auto-flow"] = normalize_flow(flow);

  if (gapX || gapY) {
    if (gapY) baseStyle["row-gap"] = normalize_gap(gapY);
    if (gapX) baseStyle["column-gap"] = normalize_gap(gapX);
  } else if (gap) {
    baseStyle.gap = normalize_gap(gap);
  }

  if (placeItems) {
    baseStyle["place-items"] = placeItems;
  } else {
    if (alignItems) baseStyle["align-items"] = alignItems;
    if (justifyItems) baseStyle["justify-items"] = justifyItems;
  }

  if (placeContent) {
    baseStyle["place-content"] = normalize_content(placeContent);
  } else {
    if (alignContent) {
      baseStyle["align-content"] = normalize_content(alignContent);
    }
    if (justifyContent) {
      baseStyle["justify-content"] = normalize_content(justifyContent);
    }
  }

  if (typeof stl === "string") {
    return View(
      {
        ...rest,
        class: cls,
        // style: `${viewStyleToCssText(baseStyle)}; ${stl}`,
      },
      children,
    );
  }

  const extraStyle =
    stl && typeof stl === "object" && !isRef(stl) && !isStyleRef(stl)
      ? stl
      : {};

  const grid$ = View(
    { ...rest, class: cls, style: { ...baseStyle, ...extraStyle } },
    children,
  );
  grid$.t = "grid";
  return grid$;
}
