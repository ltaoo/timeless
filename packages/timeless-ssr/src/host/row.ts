import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRRow = VNodeView<string> & {
  t: "row";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRRow(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRRow {
  const t = "row";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    render() {
      props.elm.state.style.display = "flex";
      props.elm.state.style.flexDirection = "row";
      const attrs = box$.buildAttributes(props.elm.state);
      const children = box$.buildChildren(props.elm.children, props.build);
      return `<div${box$.stringifyAttrs(attrs)}>${children}</div>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
