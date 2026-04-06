import { Ref, isRef } from "@timeless/reactive";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { isStyleRef, styleNames, ClassNameRef } from "@/style";

export type FlexJustify =
  | "start"
  | "end"
  | "center"
  | "between"
  | "around"
  | "evenly";

export type FlexItems = "start" | "end" | "center" | "baseline" | "stretch";

export type FlexDirection = "col" | "col-reverse" | "reverse";

function normalizeJustify(justify: string) {
  const map: Record<string, string> = {
    start: "flex-start",
    end: "flex-end",
    center: "center",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  };
  return map[justify] || justify;
}

function normalizeItems(items: string) {
  const map: Record<string, string> = {
    start: "flex-start",
    end: "flex-end",
    center: "center",
    baseline: "baseline",
    stretch: "stretch",
  };
  return map[items] || items;
}

function normalizeGap(gap: string) {
  const v = String(gap).trim();
  if (!v) return v;
  if (/^-?\d+(\.\d+)?$/.test(v)) {
    return `${Number(v) * 0.25}rem`;
  }
  return v;
}

export function Flex(
  props: {
    direction?: FlexDirection;
    justify?: FlexJustify;
    items?: FlexItems;
    gap?: string;
    class?: string | Ref<string> | ClassNameRef;
  } & ViewProps,
  children?: ViewChildren,
) {
  const {
    direction,
    justify,
    items,
    gap,
    class: cls,
    style: stl,
    ...rest
  } = props;

  const baseStyle: Record<string, any> = { display: "flex" };
  if (direction === "col") {
    baseStyle["flex-direction"] = "column";
  } else if (direction === "col-reverse") {
    baseStyle["flex-direction"] = "column-reverse";
  } else if (direction === "reverse") {
    baseStyle["flex-direction"] = "row-reverse";
  }
  if (justify) {
    baseStyle["justify-content"] = normalizeJustify(justify);
  }
  if (items) {
    baseStyle["align-items"] = normalizeItems(items);
  }
  if (gap) {
    baseStyle.gap = normalizeGap(gap);
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

  return View(
    { ...rest, class: cls, style: { ...baseStyle, ...extraStyle } },
    children,
  );
}
