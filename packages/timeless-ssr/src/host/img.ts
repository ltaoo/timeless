import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRImg = VNodeView<string> & {
  t: "img";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
  setSrc(v: string): void;
};

export function SSRImg(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRImg {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "img",
    getType() {
      return "view";
    },
    render() {
      const attrs = box$.buildAttributes(props.elm.state);
      if (props.elm.state.src) {
        attrs.push(`src="${props.elm.state.src}"`);
      }
      if (props.elm.state.alt) {
        attrs.push(`alt="${props.elm.state.alt}"`);
      }
      return `<img${box$.stringifyAttrs(attrs)}/>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
    setSrc() {},
  };
}
