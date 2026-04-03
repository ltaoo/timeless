import { VNode, sn, getRendererScheduler } from "@timeless/timeless";

const { createElement, appendChild, mountChild, isDescriptor } = VNode;

// ─── DOM ComponentFns ────────────────────────────────────────────

export function DomGrid(props: any, children: any[]) {
  const cols = props.columns ?? 4;
  const gap = props.gap ?? 16;
  const merged = sn([
    {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: gap,
      width: "100%",
      height: "100vh",
      padding: 24,
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
    const vnode = mountChild(child, null);
    if (vnode) appendChild(root, vnode);
  }

  return root;
}
