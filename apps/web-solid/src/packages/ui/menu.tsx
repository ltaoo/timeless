/**
 * @file 菜单 组件
 */
import { createSignal, onCleanup, onMount, JSX } from "solid-js";
// import { Portal as PortalPrimitive } from "solid-js/web";

import {  MenuCore  } from "@timeless/kit";
type GraceIntent = { area: Polygon; side: Side };

// Determine if a point is inside of a polygon.
// Based on https://github.com/substack/point-in-polygon
function isPointInPolygon(point: Point, polygon: Polygon) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    // prettier-ignore
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

export { Root, Anchor, Portal, Content, Group, Label, Item, Separator, Arrow, Sub, SubTrigger, SubContent };
