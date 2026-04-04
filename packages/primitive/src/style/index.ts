import { isRef } from "@timeless/reactive";

import { MaybeSignal } from "@/content/view";

export type ViewStyle = Record<string, MaybeSignal>;

export type ViewStyleInput = ViewStyle | string;

export function viewStyleToCssText(style: ViewStyleInput) {
  if (typeof style === "string") {
    return style;
  }
  const parts: string[] = [];
  const keys = Object.keys(style);
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const vv = (style as any)[k] as any;
    const v = isRef(vv) ? vv.value : vv;
    if (v === undefined || v === null || v === false) {
      continue;
    }
    parts.push(`${k}: ${String(v)}`);
  }
  return parts.join("; ");
}
