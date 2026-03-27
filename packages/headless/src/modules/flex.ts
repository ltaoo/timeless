import { sn, ClassNameRef, Ref } from "@timeless/reactive";

import { View, ViewChildren, ViewProps } from "../primitive/view";

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

  const style_parts: string[] = ["display: flex"];
  if (direction === "col") {
    style_parts.push("flex-direction: column");
  } else if (direction === "col-reverse") {
    style_parts.push("flex-direction: column-reverse");
  } else if (direction === "reverse") {
    style_parts.push("flex-direction: row-reverse");
  }
  if (justify) {
    style_parts.push(`justify-content: ${normalizeJustify(justify)}`);
  }
  if (items) {
    style_parts.push(`align-items: ${normalizeItems(items)}`);
  }
  if (gap) {
    style_parts.push(`gap: ${normalizeGap(gap)}`);
  }
  const st = style_parts.filter(Boolean).join("; ");
  const style_ = sn([st, stl as any]);

  return View({ ...rest, class: cls, style: style_ }, children);
}
