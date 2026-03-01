import { tp, merge } from "./theme";
import { View, ViewChildren, ViewProps } from "./view";

function themed(part: string, props: any, children?: ViewChildren) {
  const { theme: t, class: cn, style: st, ...rest } = props || {};
  return View({ ...rest, ...merge(tp(t?.[part]), cn, st) }, children);
}

export function Card(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("root", p, c);
}
export function CardHeader(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("header", p, c);
}
export function CardTitle(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("title", p, c);
}
export function CardDescription(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("description", p, c);
}
export function CardContent(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("content", p, c);
}
export function CardFooter(p: ViewProps & { theme?: any }, c?: ViewChildren) {
  return themed("footer", p, c);
}
