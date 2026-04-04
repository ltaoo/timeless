import { isRef, Ref, RefObject, Signal } from "@timeless/reactive";

type ViewStylePropValue =
  | Signal<string | number | boolean | null | undefined>
  | string
  | number
  | boolean
  | undefined
  | null;

export type ViewStyleProperties = {
  [k: string]: ViewStylePropValue;
};

export type ViewStyle =
  | Ref<ViewStyleProperties>
  | RefObject<ViewStyleProperties>
  | ViewStyleProperties;

export type ViewStyleInput = ViewStyle;

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
