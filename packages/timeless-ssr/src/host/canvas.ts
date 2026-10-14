import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";
export type SSRCanvas = VNodeView<string> & { t: "canvas" };
export function SSRCanvas(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRCanvas {
  const box = SSRBox();
  return {
    ...box.methods,
    t: "canvas",
    getType() {
      return "view" as const;
    },
    render() {
      const attrs = box.buildAttributes(props.elm.state);

      return `<canvas${box.stringifyAttrs(attrs)}>${box.buildChildren(props.elm.children, props.build)}</canvas>`;
    },
    hydrate() {},
  };
}
