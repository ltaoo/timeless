import { classnames } from "../ui/core.js";

let _theme = null;
export function setTheme(t) { _theme = t; }
export function theme() { return _theme; }
export function tp(part, ctx) {
  if (!part) return {};
  return typeof part === "function" ? part(ctx) : part;
}
export function merge(tr, userClass, userStyle) {
  const baseClass = tr.class;
  let classValue;
  if (userClass && userClass.__CN) {
    classValue = baseClass ? classnames([baseClass, userClass]) : userClass;
  } else if (userClass && typeof userClass === "object" && userClass.__isRef) {
    classValue = baseClass ? classnames([baseClass, userClass]) : classnames([userClass]);
  } else {
    const c = [baseClass, userClass].filter(Boolean).join(" ") || undefined;
    if (c !== undefined) {
      classValue = c;
    }
  }
  const s = [tr.style, userStyle].filter(Boolean).join("") || undefined;
  return {
    ...(classValue !== undefined && { class: classValue }),
    ...(s !== undefined && { style: s }),
  };
}
