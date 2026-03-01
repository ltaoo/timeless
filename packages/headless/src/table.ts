import { tp, merge } from "./theme";
import { View, ViewChildren, ViewProps } from "./view";

function themed(
  type: string,
  part: string,
  props: any,
  children?: ViewChildren,
) {
  const { theme: t, class: cls, style: st, ...rest } = props || {};
  return View({ type, ...rest, ...merge(tp(t?.[part]), cls, st) }, children);
}

export function Table(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("table", "table", p, c);
}
export function TableHeader(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("thead", "header", p, c);
}
export function TableBody(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("tbody", "body", p, c);
}
export function TableRow(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("tr", "row", p, c);
}
export function TableHead(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("th", "head", p, c);
}
export function TableCell(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("td", "cell", p, c);
}
