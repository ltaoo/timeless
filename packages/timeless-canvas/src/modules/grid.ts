import {
  VNode,
  styleNames,
  isRef,
  getRendererScheduler,
} from "@timeless/timeless";

import type { CanvasHost } from "../index";

const { createElement, createText, appendChild, mountChild, isDescriptor } =
  VNode;

// ─── Canvas ComponentFns ─────────────────────────────────────────

export function CanvasGrid(props: any, children: any[], host?: CanvasHost) {
  const cols = props.columns ?? 4;
  const gap = props.gap ?? 16;
  const padding = 24;

  const dpr = globalThis.window?.devicePixelRatio || 1;
  const rect = host?.canvas ? host.canvas.getBoundingClientRect() : null;
  const vw = host?.canvas
    ? rect?.width || host.canvas.clientWidth || host.canvas.width / dpr
    : 800;
  const vh = host?.canvas
    ? rect?.height || host.canvas.clientHeight || host.canvas.height / dpr
    : 600;

  const cellW = (vw - padding * 2 - gap * (cols - 1)) / cols;
  const rows = Math.ceil(children.length / cols);
  const cellH = (vh - padding * 2 - gap * (rows - 1)) / rows;

  const merged = styleNames([
    {
      left: 0,
      top: 0,
      width: vw,
      height: vh,
      backgroundColor: "#0b1020",
    },
    props.style,
  ]);
  const root = createElement("div", { style: merged.value });

  const scheduler = getRendererScheduler();
  merged.subscribe({
    onChange(v: any) {
      root.style = v ?? {};
      scheduler.patch(root, { style: root.style });
    },
  });

  children.forEach((child, i) => {
    if (!isDescriptor(child)) return;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * (cellW + gap);
    const y = padding + row * (cellH + gap);

    child.props._layout = { left: x, top: y, width: cellW, height: cellH };

    const vnode = mountChild(child, null);
    if (vnode) appendChild(root, vnode);
  });

  return root;
}
