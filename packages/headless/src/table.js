import { tp, merge } from "./theme.js";
import { View } from "./view.js";

function themed(type, part, props, children) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ type, ...rest, ...merge(tp(t?.[part]), cn, st) }, children);
}

export function Table(p, c) { return themed("table", "table", p, c); }
export function TableHeader(p, c) { return themed("thead", "header", p, c); }
export function TableBody(p, c) { return themed("tbody", "body", p, c); }
export function TableRow(p, c) { return themed("tr", "row", p, c); }
export function TableHead(p, c) { return themed("th", "head", p, c); }
export function TableCell(p, c) { return themed("td", "cell", p, c); }
