import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRView = VNodeView<string> & {
  t: "view";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRView(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRView {
  const t = "view";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "view";
    },
    render(elm: TimelessElement) {
      const attrs = box$.buildAttributes(elm.state);
      const children = box$.buildChildren(elm.children, props.build);
      return `<div${attrs}>${children}</div>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
