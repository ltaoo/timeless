import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRLink = VNodeView<string> & {
  t: "link";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRLink(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRLink {
  const t = "link";
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
      return `<a${box$.stringifyAttrs(attrs)}>${children}</a>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
