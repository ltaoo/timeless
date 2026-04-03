import { VNode } from "@timeless/primitive";

const { createElement, createText, appendChild, isDescriptor } = VNode;

export function TuiView(_props: any, _children: any[]) {
  // Placeholder — Grid consumes descriptors directly
  return createElement("div", {});
}
