import type { ElementDescriptor } from "./descriptor";
import { mount } from "./mount";
import type { VNode, VNodeElement, VNodeStyle } from "./types";
import { resolveComputedStyle } from "./style-preset";

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const unitlessKeys = new Set(["opacity", "zIndex", "fontWeight", "lineHeight"]);

function toCssValue(key: string, v: any) {
  if (typeof v === "number" && !unitlessKeys.has(key)) return `${v}px`;
  return String(v);
}

function styleToCssText(style: VNodeStyle) {
  const parts: string[] = [];
  for (const k of Object.keys(style)) {
    const v = (style as any)[k];
    if (v === undefined || v === null || v === false) continue;
    if (k === "transforms" || k === "shadows") continue;
    parts.push(`${k}: ${toCssValue(k, v)}`);
  }
  return parts.join("; ");
}

function vnodeToHtml(node: VNode): string {
  if (node.kind === "text") {
    return escapeHtml(node.text ?? "");
  }

  if (node.kind === "fragment") {
    return node.children.map(vnodeToHtml).join("");
  }

  const el = node as VNodeElement;
  let html = `<${el.tag}`;

  const className = (el.stylePresets ?? []).filter(Boolean).join(" ");
  if (className) {
    html += ` class="${escapeHtml(className)}"`;
  }

  const computed = resolveComputedStyle(el);
  const cssText = styleToCssText(computed);
  if (cssText) {
    html += ` style="${escapeHtml(cssText)}"`;
  }

  for (const k of Object.keys(el.attrs ?? {})) {
    const v = (el.attrs as any)[k];
    if (v === undefined || v === null || v === false) continue;
    if (v === true) {
      html += ` ${k}`;
      continue;
    }
    html += ` ${k}="${escapeHtml(String(v))}"`;
  }

  if (VOID_ELEMENTS.has(el.tag)) {
    html += " />";
    return html;
  }

  html += ">";
  html += el.children.map(vnodeToHtml).join("");
  html += `</${el.tag}>`;
  return html;
}

export function renderToString(descriptor: ElementDescriptor): string {
  const vnode = mount(descriptor, null);
  return vnodeToHtml(vnode);
}

export function vnodeToJSON(vnode: VNode): object {
  if (vnode.kind === "text") {
    return { kind: "text", text: vnode.text, key: vnode.key };
  }
  if (vnode.kind === "fragment") {
    return { kind: "fragment", key: vnode.key, children: vnode.children.map(vnodeToJSON) };
  }
  return {
    kind: "element",
    key: vnode.key,
    tag: vnode.tag,
    style: vnode.style,
    stylePresets: vnode.stylePresets,
    attrs: vnode.attrs,
    props: vnode.props,
    children: vnode.children.map(vnodeToJSON),
  };
}

