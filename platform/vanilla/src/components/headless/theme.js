let _theme = null;
export function setTheme(t) { _theme = t; }
export function theme() { return _theme; }
export function tp(part, ctx) {
  if (!part) return {};
  return typeof part === "function" ? part(ctx) : part;
}
export function merge(tr, userClass, userStyle) {
  const c = [tr.class, userClass].filter(Boolean).join(" ") || undefined;
  const s = [tr.style, userStyle].filter(Boolean).join("") || undefined;
  return { ...(c !== undefined && { class: c }), ...(s !== undefined && { style: s }) };
}
