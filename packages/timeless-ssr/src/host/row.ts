import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRRow = VNodeView<string> & {
  t: "row";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRRow(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRRow {
  const t = "row";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    render(elm: TimelessElement) {
      elm.state.style.display = "flex";
      elm.state.style.flexDirection = "row";
      const attrs = box$.buildAttributes(elm.state);
      const children = box$.buildChildren(elm.children, props.build);
      return `<div${box$.stringifyAttrs(attrs)}>${children}</div>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
