import { tp, merge } from "./theme.js";
import { View } from "./view.js";

function themed(part: string, props: any, children?: any) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.[part]), cn, st) }, children);
}

export function Card(p: any, c?: any) { return themed("root", p, c); }
export function CardHeader(p: any, c?: any) { return themed("header", p, c); }
export function CardTitle(p: any, c?: any) { return themed("title", p, c); }
export function CardDescription(p: any, c?: any) { return themed("description", p, c); }
export function CardContent(p: any, c?: any) { return themed("content", p, c); }
export function CardFooter(p: any, c?: any) { return themed("footer", p, c); }
