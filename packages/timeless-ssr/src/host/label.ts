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
      if (elm.state.for) {
        attrs.push(`for="${elm.state.for}"`);
      }
      return `<label${box$.stringifyAttrs(attrs)}>${children}</label>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
