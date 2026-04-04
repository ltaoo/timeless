import {
  isRef,
  ObjectSignal,
  Ref,
  StyleRef,
  ViewStyle,
  ViewStyleInput,
} from "@timeless/timeless";

export function viewStyleToCssText(
  style:
    | ViewStyle
    | StyleRef
    | ObjectSignal<ViewStyle>
    | Ref<ViewStyle>
    | undefined,
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
    parts.push(`${k}: ${String(v)}`);
  }
  return parts.join("; ");
}
