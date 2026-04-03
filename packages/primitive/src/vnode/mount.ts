import { getRendererScheduler, resolveComponent } from "@/host";

import type { ChildDescriptor, ComponentFn, ElementDescriptor } from "./descriptor";
import { isDescriptor } from "./descriptor";
import { appendChild, createElement, createText } from "./create";
import type { RendererScheduler } from "./reactive";
import { setupReactiveBindings } from "./reactive";
import type { VNode, VNodeEvents } from "./types";

function extractEvents(props: Record<string, any>): VNodeEvents {
  const events: VNodeEvents = {};
  for (const k of Object.keys(props)) {
    if (!k.startsWith("on")) continue;
    const v = props[k];
    if (typeof v !== "function") continue;
    events[k] = v;
  }
  return events;
}

export function mountChild(child: ChildDescriptor, scheduler: RendererScheduler | null): VNode | null {
  if (child === null) return null;
  if (typeof child === "string" || typeof child === "number") {
    return createText(String(child));
  }
  if (isDescriptor(child)) {
    return mount(child, scheduler);
  }
  return null;
}

export function mount(descriptor: ElementDescriptor, scheduler?: RendererScheduler | null): VNode {
  const s = scheduler === undefined ? getRendererScheduler() : scheduler;
  const { type, props, children } = descriptor;

  if (typeof type === "string") {
    const vnode = createElement(type, {
      key: descriptor.key,
      style: props.style,
      stylePresets: props.stylePresets,
      attrs: props.attrs,
      props: props.props,
      events: props.events ?? extractEvents(props),
      draggable: props.draggable,
      focusable: props.focusable,
    });

    setupReactiveBindings(vnode, props, s);

    for (const child of children) {
      const mounted = mountChild(child, s);
      if (mounted) appendChild(vnode, mounted);
    }

    return vnode;
  }

  const componentFn = resolveComponent(type as Function) as ComponentFn;
  const result = componentFn(props, children);
  if (isDescriptor(result)) {
    return mount(result as ElementDescriptor, s);
  }
  return result;
}
