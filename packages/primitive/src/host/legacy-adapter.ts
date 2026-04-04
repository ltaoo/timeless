import type { TimelessHost } from "./index";

import type { AnimationConfig } from "@/vnode/animation";
import type { HostRenderer, VNodePatch, BoundingRect } from "@/vnode/host-renderer";
import type { VNode, VNodeElement, VNodeStyle } from "@/vnode/types";

function eventTypeFromKey(key: string) {
  if (!key.startsWith("on")) return null;
  const name = key.slice(2);
  if (!name) return null;
  if (name === "DoubleClick") return "dblclick";
  const lower = name[0].toLowerCase() + name.slice(1);
  return lower.toLowerCase();
}

const unitlessKeys = new Set(["opacity", "zIndex", "fontWeight", "lineHeight"]);

function toCssValue(key: string, v: any) {
  if (typeof v === "number" && !unitlessKeys.has(key)) return `${v}px`;
  return String(v);
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

function styleToCssText(style: VNodeStyle) {
  const parts: string[] = [];
  for (const k of Object.keys(style)) {
    const v = (style as any)[k];
    if (v === undefined || v === null || v === false) continue;
    if (k === "transforms" || k === "shadows") continue;
    parts.push(`${camelToKebab(k)}: ${toCssValue(k, v)}`);
  }
  return parts.join("; ");
}

function ensureNode(vnode: VNode) {
  if (!vnode._hostNode) {
    throw new Error("VNode is not committed: missing _hostNode");
  }
  return vnode._hostNode;
}

export function createLegacyHostAdapter(host: TimelessHost): HostRenderer {
  const adapter: HostRenderer = {
    kind: `legacy:${host.kind}`,
    platform: host.kind === "dom" ? "web" : "tui",

    createNode(vnode) {
      if (vnode.kind === "text") {
        vnode._hostNode = host.createTextNode(vnode.text ?? "");
        return;
      }

      if (vnode.kind === "fragment") {
        if (!vnode._hostNode) {
          vnode._hostNode = host.createDocumentFragment();
        }
        return;
      }

      vnode._hostNode = host.createElement(vnode.tag);
      adapter.patchNode(vnode, {
        style: vnode.style,
        stylePresets: vnode.stylePresets,
        attrs: vnode.attrs,
        props: vnode.props,
        a11y: vnode.a11y,
      });

      const $el = vnode._hostNode;
      const cleanups: (() => void)[] = [];
      for (const k of Object.keys(vnode.events ?? {})) {
        const type = eventTypeFromKey(k);
        const handler = (vnode.events as any)[k];
        if (!type || typeof handler !== "function") continue;
        host.addEventListener($el, type, handler);
        cleanups.push(() => host.removeEventListener($el, type, handler));
      }
      (vnode as any).__legacyEventCleanups = cleanups;
    },

    removeNode(vnode) {
      const cleanups: (() => void)[] | undefined = (vnode as any).__legacyEventCleanups;
      if (cleanups) {
        for (const fn of cleanups) fn();
      }
      const parent = vnode.parent;
      if (parent && parent._hostNode && vnode._hostNode) {
        host.removeChild(parent._hostNode, vnode._hostNode);
      }
      vnode._hostNode = undefined;
    },

    patchNode(vnode, changes) {
      if (vnode.kind === "text") {
        if (changes.text !== undefined) {
          vnode.text = changes.text;
          host.setTextContent(ensureNode(vnode), vnode.text);
        }
        return;
      }
      if (vnode.kind === "fragment") return;

      const el = vnode as VNodeElement;
      const $el = ensureNode(el);

      if (changes.stylePresets) {
        el.stylePresets = changes.stylePresets;
        host.setClassName($el, el.stylePresets.join(" "));
      }

      if (changes.style) {
        el.style = { ...el.style, ...changes.style };
        host.setStyleText($el, styleToCssText(el.style));
      }

      if (changes.attrs) {
        for (const name of Object.keys(changes.attrs)) {
          const v = changes.attrs[name];
          if (v === null || v === undefined || v === false) {
            delete el.attrs[name];
            host.removeAttribute($el, name);
          } else if (v === true) {
            el.attrs[name] = true;
            host.setAttribute($el, name, "");
          } else {
            el.attrs[name] = v;
            host.setAttribute($el, name, String(v));
          }
        }
      }

      if (changes.props) {
        for (const name of Object.keys(changes.props)) {
          const v = changes.props[name];
          el.props[name] = v;
          if (host.setProperty) host.setProperty($el, name, v);
          else host.setAttribute($el, name, String(v));
        }
      }

      if (changes.a11y) {
        el.a11y = { ...(el.a11y ?? {}), ...changes.a11y };
        if (el.a11y.label) host.setAttribute($el, "aria-label", el.a11y.label);
        if (el.a11y.hidden !== undefined) {
          if (el.a11y.hidden) host.setAttribute($el, "aria-hidden", "true");
          else host.removeAttribute($el, "aria-hidden");
        }
        if (el.a11y.role) host.setAttribute($el, "role", el.a11y.role);
      }
    },

    insertChild(parent, child, before) {
      const $parent = ensureNode(parent);
      const $child = ensureNode(child);
      const $before = before ? ensureNode(before) : null;
      host.insertBefore($parent, $child, $before);
    },

    removeChild(parent, child) {
      host.removeChild(ensureNode(parent), ensureNode(child));
    },

    getBoundingRect(vnode): BoundingRect {
      if (host.getBoundingClientRect) return host.getBoundingClientRect(ensureNode(vnode));
      return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
    },

    getViewportSize() {
      if (host.getViewportSize) return host.getViewportSize();
      return { width: 0, height: 0 };
    },

    focus(vnode) {
      host.focus?.(ensureNode(vnode));
    },

    blur(vnode) {
      host.blur?.(ensureNode(vnode));
    },

    getBody() {
      return host.getBody?.() ?? null;
    },

    animate(_vnode: VNode, _animations: AnimationConfig[]) {
      return Promise.resolve();
    },

    cancelAnimation(_vnode: VNode) {},

    setTimeout(handler: () => void, ms: number) {
      return host.setTimeout(handler, ms);
    },

    clearTimeout(id: any) {
      host.clearTimeout(id);
    },

    addGlobalEventListener(type: string, handler: (e: any) => void, options?: any) {
      if (host.addDocumentEventListener) {
        host.addDocumentEventListener(type, handler, options);
        return;
      }
      const body = host.getBody?.();
      if (body) host.addEventListener(body, type, handler, options);
    },

    removeGlobalEventListener(type: string, handler: (e: any) => void, options?: any) {
      if (host.removeDocumentEventListener) {
        host.removeDocumentEventListener(type, handler, options);
        return;
      }
      const body = host.getBody?.();
      if (body) host.removeEventListener(body, type, handler, options);
    },
  };

  return adapter;
}

export function buildInitialPatch(vnode: VNode): VNodePatch {
  if (vnode.kind !== "element") return {};
  return {
    style: vnode.style,
    stylePresets: vnode.stylePresets,
    attrs: vnode.attrs,
    props: vnode.props,
    a11y: vnode.a11y,
  };
}
