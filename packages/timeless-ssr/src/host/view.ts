import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRView = VNodeView<string> & {
  t: "view";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRView(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRView {
  const t = "view";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    render() {
      const attrs = box$.buildAttributes(props.elm.state);
      const children = box$.buildChildren(props.elm.children, props.build);
      return `<div${box$.stringifyAttrs(attrs)}>${children}</div>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
