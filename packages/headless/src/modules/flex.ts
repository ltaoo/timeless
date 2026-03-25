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
    col?: boolean;
    justify?: FlexJustify;
    items?: FlexItems;
    gap?: string;
    class?: string | Ref<string> | ClassNameRef;
  } & ViewProps,
  children?: ViewChildren,
) {
  const { col, justify, items, gap, class: cls, style: userStyle, ...rest } =
    props;

  const styleParts: string[] = ["display: flex"];
  if (col) {
    styleParts.push("flex-direction: column");
  }
  if (justify) {
    styleParts.push(`justify-content: ${normalizeJustify(justify)}`);
  }
  if (items) {
    styleParts.push(`align-items: ${normalizeItems(items)}`);
  }
  if (gap) {
    styleParts.push(`gap: ${normalizeGap(gap)}`);
  }
  const baseStyle = styleParts.filter(Boolean).join("; ");
  const style$ = sn([baseStyle, userStyle as any]);

  const view$ = View({ ...rest, class: cls, style: style$ }, children);
  return view$;
}
