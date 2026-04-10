import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRLabel = VNodeView<string> & {
  t: "label";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRLabel(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRLabel {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "label",
    getType() {
      return "view";
    },
    render(elm: TimelessElement) {
      const attrs = box$.buildAttributes(elm.state);
      const children = box$.buildChildren(elm.children, props.build);
      return `<label${attrs}>${children}</label>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
