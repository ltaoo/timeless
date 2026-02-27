import { classnames, Ref, isRef } from "@timeless/reactive";

let _theme: any = null;
export function setTheme(t: any) {
  _theme = t;
}
export function theme() {
  return _theme;
}

type ThemePart = ((ctx: any) => any) | any;

export function tp(part: ThemePart, ctx?: any) {
  if (!part) return {};
  return typeof part === "function" ? part(ctx) : part;
}

export function merge(tr: any = {}, userClass?: any, userStyle?: any) {
  const baseClass = tr.class;
  let classValue: any;
  if (userClass && userClass.__CN) {
    classValue = baseClass ? classnames([baseClass, userClass]) : userClass;
  } else if (userClass && isRef(userClass)) {
    classValue = baseClass
      ? classnames([baseClass, userClass])
      : classnames([userClass]);
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
