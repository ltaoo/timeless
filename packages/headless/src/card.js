import { tp, merge } from "./theme.js";
import { View } from "./view.js";

function themed(part, props, children) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.[part]), cn, st) }, children);
}

export function Card(p, c) { return themed("root", p, c); }
export function CardHeader(p, c) { return themed("header", p, c); }
export function CardTitle(p, c) { return themed("title", p, c); }
export function CardDescription(p, c) { return themed("description", p, c); }
export function CardContent(p, c) { return themed("content", p, c); }
export function CardFooter(p, c) { return themed("footer", p, c); }
