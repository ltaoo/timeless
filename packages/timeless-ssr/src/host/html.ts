import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRHtml = VNodeView<string> & {
  t: "html";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRHtml(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRHtml {
  const t = "html";
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
      const tag = props.elm.state.tag;
      if (["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(tag.toLowerCase())) return `<${tag}${box$.stringifyAttrs(attrs)}>`;
      return `<${tag}${box$.stringifyAttrs(attrs)}>${children}</${tag}>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
