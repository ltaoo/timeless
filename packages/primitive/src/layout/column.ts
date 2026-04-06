import { Ref, isRef } from "@timeless/reactive";

import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { isStyleRef, ClassNameRef } from "@/style";

export function Column(
  props: {
    span?: number;
    start?: number;
    end?: number;
    offset?: number;
    rowSpan?: number;
    rowStart?: number;
    rowEnd?: number;
    class?: string | Ref<string> | ClassNameRef;
  } & ViewProps,
  children?: ViewChildren,
) {
  const {
    span,
    start,
    end,
    offset,
    rowSpan,
    rowStart,
    rowEnd,
    class: cls,
    style: stl,
    ...rest
  } = props;

  const baseStyle: Record<string, any> = { "min-width": 0 };

  const resolvedStart =
    start !== undefined ? start : offset !== undefined ? offset + 1 : undefined;

  if (resolvedStart !== undefined && span !== undefined) {
    baseStyle["grid-column"] = `${resolvedStart} / span ${span}`;
  } else if (resolvedStart !== undefined && end !== undefined) {
    baseStyle["grid-column"] = `${resolvedStart} / ${end}`;
  } else if (span !== undefined) {
    baseStyle["grid-column"] = `span ${span} / span ${span}`;
  } else {
    if (resolvedStart !== undefined) {
      baseStyle["grid-column-start"] = resolvedStart;
    }
    if (end !== undefined) baseStyle["grid-column-end"] = end;
  }

  if (rowStart !== undefined && rowSpan !== undefined) {
    baseStyle["grid-row"] = `${rowStart} / span ${rowSpan}`;
  } else if (rowStart !== undefined && rowEnd !== undefined) {
    baseStyle["grid-row"] = `${rowStart} / ${rowEnd}`;
  } else if (rowSpan !== undefined) {
    baseStyle["grid-row"] = `span ${rowSpan} / span ${rowSpan}`;
  } else {
    if (rowStart !== undefined) baseStyle["grid-row-start"] = rowStart;
    if (rowEnd !== undefined) baseStyle["grid-row-end"] = rowEnd;
  }

  const extraStyle =
    stl && typeof stl === "object" && !isRef(stl) && !isStyleRef(stl)
      ? stl
      : {};

  return View(
    {
      ...rest,
      class: cls,
      // style: styleNames([baseStyle, extraStyle])
    },
    children,
  );
}
