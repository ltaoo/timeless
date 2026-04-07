import { isRef, ObjectSignal, Ref, ViewStyle } from "@timeless/timeless";

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function viewStyleToCssText(
  style: ViewStyle | ObjectSignal<ViewStyle> | Ref<ViewStyle> | undefined,
) {
  if (!style) {
    return "";
  }
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
    const cssKey = camelToKebab(k);
    parts.push(`${cssKey}: ${String(v)}`);
  }
  return parts.join("; ");
}
