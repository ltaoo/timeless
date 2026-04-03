import { VNode, sn, getRendererScheduler } from "@timeless/timeless";

const { createElement, appendChild, mountChild, isDescriptor } = VNode;

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
