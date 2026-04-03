import { VNode } from "@timeless/timeless";

const { createElement, createText, appendChild, isDescriptor } = VNode;

export function TuiTxt(_props: any, _children: any[]) {
  // Placeholder — Grid consumes descriptors directly
  return createElement("div", {});
}
