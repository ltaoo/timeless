import { VNode, sn, isRef, getRendererScheduler } from "@timeless/timeless";
import type { CanvasHost } from "../index";

const { createElement, createText, appendChild, mountChild, isDescriptor } =
  VNode;

// ─── Canvas ComponentFns ─────────────────────────────────────────

export function CanvasGrid(
  props: any,
  children: any[],
  host?: CanvasHost,
) {
  const cols = props.columns ?? 4;
  const gap = props.gap ?? 16;
  const padding = 24;

  const vw = host?.canvas
    ? host.canvas.width / (globalThis.window?.devicePixelRatio || 1)
    : 800;
  const vh = host?.canvas
    ? host.canvas.height / (globalThis.window?.devicePixelRatio || 1)
    : 600;

  const cellW = (vw - padding * 2 - gap * (cols - 1)) / cols;
  const rows = Math.ceil(children.length / cols);
  const cellH = (vh - padding * 2 - gap * (rows - 1)) / rows;

  const merged = sn([
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
  merged._subscribe({
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

export function CanvasView(props: any, children: any[]) {
  const layout = props._layout ?? { left: 0, top: 0, width: 100, height: 80 };
  const merged = sn([
    {
      left: layout.left,
      top: layout.top,
      width: layout.width,
      height: layout.height,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderColor: "rgba(255,255,255,0.18)",
      borderWidth: 2,
    },
    props.style,
  ]);
  const root = createElement("div", { style: merged.value });

  const scheduler = getRendererScheduler();
  merged._subscribe({
    onChange(v: any) {
      root.style = v ?? {};
      scheduler.patch(root, { style: root.style });
    },
  });

  const innerPadTop = 12;
  const lineH = 24;
  let offsetY = innerPadTop;

  for (const child of children) {
    if (!isDescriptor(child)) continue;
    child.props._layout = {
      left: 0,
      top: offsetY,
      width: layout.width,
      height: lineH,
    };
    const vnode = mountChild(child, null);
    if (vnode) appendChild(root, vnode);
    offsetY += lineH;
  }

  return root;
}

export function CanvasTxt(props: any, children: any[]) {
  const layout = props._layout ?? { left: 0, top: 0, width: 100, height: 24 };
  const fontSize = props.style?.fontSize ?? 14;
  const fontWeight = props.style?.fontWeight === "bold" ? "bold " : "";
  const color = props.style?.color ?? "rgba(255,255,255,0.92)";

  const merged = sn([
    {
      left: layout.left,
      top: layout.top,
      width: layout.width,
      height: layout.height,
      font: `${fontWeight}${fontSize}px sans-serif`,
      color: color,
      textAlign: "center",
    },
    props.style,
  ]);
  const root = createElement("div", { style: merged.value });

  const scheduler = getRendererScheduler();
  merged._subscribe({
    onChange(v: any) {
      root.style = v ?? {};
      scheduler.patch(root, { style: root.style });
    },
  });

  for (const child of children) {
    if (typeof child === "string" || typeof child === "number") {
      appendChild(root, createText(String(child)));
    }
  }

  return root;
}
