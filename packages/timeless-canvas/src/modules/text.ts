import { VNode, styleNames, getRendererScheduler } from "@timeless/timeless";

const { createElement, createText, appendChild } = VNode;

export function CanvasTxt(props: any, children: any[]) {
  // const layout = props._layout ?? { left: 0, top: 0, width: 100, height: 24 };
  // const fontSize = props.style?.fontSize ?? 14;
  // const fontWeight = props.style?.fontWeight === "bold" ? "bold " : "";
  // const color = props.style?.color ?? "rgba(255,255,255,0.92)";

  // const merged = styleNames([
  //   {
  //     left: layout.left,
  //     top: layout.top,
  //     width: layout.width,
  //     height: layout.height,
  //     font: `${fontWeight}${fontSize}px sans-serif`,
  //     color: color,
  //     textAlign: "center",
  //   },
  //   props.style,
  // ]);
  // const root = createElement("div", { style: merged.value });

  // const scheduler = getRendererScheduler();
  // merged.subscribe({
  //   onChange(v: any) {
  //     root.style = v ?? {};
  //     scheduler.patch(root, { style: root.style });
  //   },
  // });

  // for (const child of children) {
  //   if (typeof child === "string" || typeof child === "number") {
  //     appendChild(root, createText(String(child)));
  //   }
  // }

  // return root;
}
