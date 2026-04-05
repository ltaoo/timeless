import {
  VNode,
  styleNames,
  getRendererScheduler,
  getRenderer,
  isElement,
  isRef,
  View,
} from "@timeless/timeless";

const { createElement, appendChild, mountChild, isDescriptor } = VNode;

export function CanvasView(props: any, children: any[]) {
  const lineH = 24;

  const normalizedChildren: any[] = (children ?? []).filter(
    (c) => c !== null && c !== undefined,
  );

  const renderer = getRenderer();
  const viewport = renderer?.getViewportSize?.() ?? { width: 100, height: 80 };

  const estimateForLines = (node: any): number => {
    if (!node) return 0;
    if (isElement(node) && (node as any).t === "for") {
      const each = (node as any)?._props?.each;
      const arr = isRef(each) ? each.value : each;
      if (Array.isArray(arr)) return Math.max(1, arr.length);
      return 1;
    }
    return 1;
  };

  const estimateLines = (nodes: any[]): number => {
    let lines = 0;
    for (const n of nodes ?? []) {
      if (n === null || n === undefined) continue;
      if (typeof n === "string" || typeof n === "number") {
        lines += 1;
        continue;
      }
      if (isDescriptor(n)) {
        lines += 1;
        continue;
      }
      if (isElement(n)) {
        lines += estimateForLines(n);
        continue;
      }
      lines += 1;
    }
    return Math.max(1, lines);
  };

  const computedHeight = estimateLines(normalizedChildren) * lineH;

  const layout = props._layout ?? {
    left: 0,
    top: 0,
    width: viewport.width,
    height: viewport.height,
  };
  const width = layout.width ?? viewport.width;
  const height = layout.height ?? computedHeight;
  const merged = styleNames([
    {
      left: layout.left ?? 0,
      top: layout.top ?? 0,
      width,
      height,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderColor: "rgba(255,255,255,0.18)",
      borderWidth: 2,
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

  let offsetY = 0;

  for (const child of normalizedChildren) {
    let childHeight = lineH;
    if (isDescriptor(child)) {
      const childStyle = child.props?.style ?? {};
      const childWidth = childStyle.width ?? width;

      const explicitHeight = isRef(childStyle.height)
        ? childStyle.height.value
        : childStyle.height;

      if (explicitHeight !== undefined) {
        childHeight = explicitHeight;
      } else if ((child as any).type === (View as any)) {
        childHeight = estimateLines(child.children) * lineH;
      }

      child.props._layout = {
        left: 0,
        top: offsetY,
        width: childWidth,
        height: childHeight,
      };

      const vnode = mountChild(child, null);
      if (vnode) appendChild(root, vnode);
      offsetY += childHeight;
      continue;
    }

    if (typeof child === "string" || typeof child === "number") {
      const wrapper = createElement("text", {
        style: {
          left: 0,
          top: offsetY,
          width,
          height: lineH,
          color: "rgba(255,255,255,0.92)",
          textAlign: "left",
        },
      });
      const text = mountChild(child, null);
      if (text) appendChild(wrapper, text);
      appendChild(root, wrapper);
      offsetY += lineH;
      continue;
    }

    if (isElement(child)) {
      childHeight = estimateForLines(child) * lineH;
      const wrapper = createElement("div", {
        style: {
          left: 0,
          top: offsetY,
          width,
          height: childHeight,
        },
      });
      const vnode = mountChild(child as any, null);
      if (vnode) appendChild(wrapper, vnode);
      appendChild(root, wrapper);
      offsetY += childHeight;
      continue;
    }

    offsetY += childHeight;
  }

  return root;
}
