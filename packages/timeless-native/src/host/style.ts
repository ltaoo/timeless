import { isRef, ViewStyle } from "@timeless/timeless";

export function viewStyleToCssText(
  style: ViewStyle | undefined,
): Record<string, string> {
  if (!style) {
    return {};
  }
  if (typeof style === "string") {
    return {};
  }
  const result: Record<string, string> = {};
  const keys = Object.keys(style);
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const vv = (style as any)[k];
    const v = isRef(vv) ? vv.value : vv;
    if (v === undefined || v === null || v === false) {
      continue;
    }
    const key = k.replace(/([A-Z])/g, "-$1").toLowerCase();
    result[key] = String(v);
  }
  return result;
}
