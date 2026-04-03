import {
  VNode,
  sn,
  isStyleRef,
  isRef,
  getRendererScheduler,
} from "@timeless/timeless";

const { createElement, createText, appendChild, mountChild, isDescriptor } =
  VNode;

export function DomTxt(props: any, children: any[]) {
  const merged = sn([
    props.style,
    {
      color:
        isRef(props.style?.color) || isStyleRef(props.style?.color)
          ? undefined
          : (props.style?.color ?? "rgba(255,255,255,0.92)"),
      textAlign: "center",
      lineHeight: 1.4,
    },
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
    } else if (isDescriptor(child)) {
      const vnode = mountChild(child, null);
      if (vnode) appendChild(root, vnode);
    }
  }

  return root;
}
