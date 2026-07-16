import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRLabel = VNodeView<string> & {
  t: "label";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRLabel(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRLabel {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "label",
    getType() {
      return "view";
    },
    render() {
      const attrs = box$.buildAttributes(props.elm.state);
      const children = box$.buildChildren(props.elm.children, props.build);
      if (props.elm.state.for) {
        attrs.push(`for="${props.elm.state.for}"`);
      }
      return `<label${box$.stringifyAttrs(attrs)}>${children}</label>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
