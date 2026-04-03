import { VNode, sn, getRendererScheduler } from "@timeless/timeless";

const { createElement, createText, appendChild, mountChild, isDescriptor } =
  VNode;

export function DomView(props: any, children: any[]) {
  const merged = sn([
    {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderRadius: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
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
