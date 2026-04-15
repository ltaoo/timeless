import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRLink = VNodeView<string> & {
  t: "link";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRLink(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRLink {
  const t = "link";
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
      return `<a${box$.stringifyAttrs(attrs)}>${children}</a>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
