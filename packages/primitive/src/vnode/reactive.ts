import { isRef, type Signal } from "@timeless/reactive";

import type { HostRenderer, VNodePatch } from "./host-renderer";
import type { VNode, VNodeElement, VNodeStyle, VNodeText } from "./types";
import { commitPatches } from "./commit";

export interface RendererScheduler {
  markDirty(vnode: VNode): void;
  scheduleFlush(): void;
  flush(): void;
  patch(vnode: VNode, patch: VNodePatch): void;
}

function mergePatch(target: VNodePatch, patch: VNodePatch) {
  if (patch.style) {
    target.style = { ...(target.style ?? {}), ...patch.style };
  }
  if (patch.stylePresets) {
    target.stylePresets = patch.stylePresets;
  }
  if (patch.attrs) {
    target.attrs = { ...(target.attrs ?? {}), ...patch.attrs };
  }
  if (patch.props) {
    target.props = { ...(target.props ?? {}), ...patch.props };
  }
  if (patch.text !== undefined) {
    target.text = patch.text;
  }
  if (patch.a11y) {
    target.a11y = { ...(target.a11y ?? {}), ...patch.a11y };
  }
}

export function createRendererScheduler(renderer: HostRenderer): RendererScheduler {
  const dirty = new Set<VNode>();
  const patches = new Map<VNode, VNodePatch>();
  let scheduled = false;

  const scheduleMicrotask = (fn: () => void) => {
    if (typeof queueMicrotask === "function") {
      queueMicrotask(fn);
      return;
    }
    Promise.resolve().then(fn);
  };

  const scheduler: RendererScheduler = {
    markDirty(vnode) {
      dirty.add(vnode);
    },
    scheduleFlush() {
      if (scheduled) return;
      scheduled = true;
      scheduleMicrotask(() => {
        scheduled = false;
        scheduler.flush();
      });
    },
    flush() {
      commitPatches(dirty, patches, renderer);
    },
    patch(vnode, patch) {
      dirty.add(vnode);
      const prev = patches.get(vnode);
      if (prev) {
        mergePatch(prev, patch);
      } else {
        patches.set(vnode, patch);
      }
      scheduler.scheduleFlush();
    },
  };

  return scheduler;
}

export function bindStyle(
  vnode: VNodeElement,
  key: keyof VNodeStyle,
  ref: Signal<any>,
  scheduler: RendererScheduler,
) {
  vnode.style[key] = ref.value;
  scheduler.patch(vnode, { style: { [key]: ref.value } });
  ref._subscribe({
    onChange(v) {
      vnode.style[key] = v as any;
      scheduler.patch(vnode, { style: { [key]: v as any } });
    },
  });
}

export function bindStylePresets(
  vnode: VNodeElement,
  ref: Signal<string[]>,
  scheduler: RendererScheduler,
) {
  vnode.stylePresets = ref.value ?? [];
  scheduler.patch(vnode, { stylePresets: vnode.stylePresets });
  ref._subscribe({
    onChange(v) {
      vnode.stylePresets = (v ?? []) as any;
      scheduler.patch(vnode, { stylePresets: vnode.stylePresets });
    },
  });
}

export function bindAttr(
  vnode: VNodeElement,
  name: string,
  ref: Signal<any>,
  scheduler: RendererScheduler,
) {
  const apply = (v: any) => {
    if (v === null || v === undefined || v === false) {
      delete vnode.attrs[name];
      scheduler.patch(vnode, { attrs: { [name]: null } });
      return;
    }
    vnode.attrs[name] = v;
    scheduler.patch(vnode, { attrs: { [name]: v } });
  };
  apply(ref.value);
  ref._subscribe({
    onChange(v) {
      apply(v);
    },
  });
}

export function bindProp(
  vnode: VNodeElement,
  name: string,
  ref: Signal<any>,
  scheduler: RendererScheduler,
) {
  const apply = (v: any) => {
    vnode.props[name] = v;
    scheduler.patch(vnode, { props: { [name]: v } });
  };
  apply(ref.value);
  ref._subscribe({
    onChange(v) {
      apply(v);
    },
  });
}

export function bindText(vnode: VNodeText, ref: Signal<string>, scheduler: RendererScheduler) {
  vnode.text = String((ref as any).value ?? "");
  scheduler.patch(vnode, { text: vnode.text });
  ref._subscribe({
    onChange(v) {
      vnode.text = String(v ?? "");
      scheduler.patch(vnode, { text: vnode.text });
    },
  });
}

export function setupReactiveBindings(
  vnode: VNodeElement,
  props: Record<string, any>,
  scheduler: RendererScheduler | null,
) {
  if (!scheduler) {
    if (props.style && isRef(props.style)) {
      vnode.style = ((props.style as Signal<VNodeStyle>).value ?? {}) as any;
    }
    if (props.stylePresets && isRef(props.stylePresets)) {
      vnode.stylePresets = ((props.stylePresets as Signal<string[]>).value ?? []) as any;
    }
    if (props.attrs && isRef(props.attrs)) {
      vnode.attrs = ((props.attrs as Signal<Record<string, any>>).value ?? {}) as any;
    }
    if (props.props && isRef(props.props)) {
      vnode.props = ((props.props as Signal<Record<string, any>>).value ?? {}) as any;
    }
    return;
  }

  if (props.style && isRef(props.style)) {
    const st = props.style as Signal<VNodeStyle>;
    const apply = (v: any) => {
      vnode.style = (v ?? {}) as any;
      scheduler.patch(vnode, { style: vnode.style });
    };
    apply(st.value);
    st._subscribe({
      onChange(v) {
        apply(v);
      },
    });
  } else if (props.style && typeof props.style === "object") {
    for (const k of Object.keys(props.style)) {
      const vv = props.style[k];
      if (isRef(vv)) bindStyle(vnode, k as keyof VNodeStyle, vv as any, scheduler);
      else vnode.style[k] = vv;
    }
  }

  if (props.stylePresets && isRef(props.stylePresets)) {
    bindStylePresets(vnode, props.stylePresets as any, scheduler);
  }

  if (props.attrs && isRef(props.attrs)) {
    const a = props.attrs as Signal<Record<string, any>>;
    const apply = (v: any) => {
      vnode.attrs = (v ?? {}) as any;
      scheduler.patch(vnode, { attrs: vnode.attrs as any });
    };
    apply(a.value);
    a._subscribe({
      onChange(v) {
        apply(v);
      },
    });
  } else if (props.attrs && typeof props.attrs === "object") {
    for (const k of Object.keys(props.attrs)) {
      const vv = props.attrs[k];
      if (isRef(vv)) bindAttr(vnode, k, vv as any, scheduler);
      else if (vv !== undefined) vnode.attrs[k] = vv;
    }
  }

  if (props.props && isRef(props.props)) {
    const p = props.props as Signal<Record<string, any>>;
    const apply = (v: any) => {
      vnode.props = (v ?? {}) as any;
      scheduler.patch(vnode, { props: vnode.props });
    };
    apply(p.value);
    p._subscribe({
      onChange(v) {
        apply(v);
      },
    });
  } else if (props.props && typeof props.props === "object") {
    for (const k of Object.keys(props.props)) {
      const vv = props.props[k];
      if (isRef(vv)) bindProp(vnode, k, vv as any, scheduler);
      else vnode.props[k] = vv;
    }
  }
}
