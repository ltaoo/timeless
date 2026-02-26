import { tp, merge } from "./theme.js";
import { View } from "./view.js";

function themed(type: string, part: string, props: any, children?: any) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ type, ...rest, ...merge(tp(t?.[part]), cn, st) }, children);
}

export function Table(p: any, c?: any) { return themed("table", "table", p, c); }
export function TableHeader(p: any, c?: any) { return themed("thead", "header", p, c); }
export function TableBody(p: any, c?: any) { return themed("tbody", "body", p, c); }
export function TableRow(p: any, c?: any) { return themed("tr", "row", p, c); }
export function TableHead(p: any, c?: any) { return themed("th", "head", p, c); }
export function TableCell(p: any, c?: any) { return themed("td", "cell", p, c); }
