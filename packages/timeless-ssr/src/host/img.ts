import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRImg = VNodeView<string> & {
  t: "img";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
  setSrc(v: string): void;
};

export function SSRImg(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRImg {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "img",
    getType() {
      return "view";
    },
    render(elm: TimelessElement) {
      const attrs = box$.buildAttributes(elm.state);
      if (elm.state.src) {
        attrs.push(`src="${elm.state.src}"`);
      }
      if (elm.state.alt) {
        attrs.push(`alt="${elm.state.alt}"`);
      }
      return `<img${box$.stringifyAttrs(attrs)} />`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
    setSrc() {},
  };
}
