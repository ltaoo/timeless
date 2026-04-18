import { TimelessElement, VNodeView } from "@timeless/timeless";

import { SSRBox } from "./box";

export type SSRFor = VNodeView<string> & {
  t: "for";
  // insert(idx: number, element: (TimelessElement | null)[]): void;
  // remove(idx: number, count: number): void;
  // refresh(data: any): void;
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRFor(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRFor {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "for",
    getType() {
      return "reactive";
    },
    render(elm: TimelessElement) {
      // console.log("[ssr]for - render", elm.children);
      if (!elm.children) return "";
      let result = "";
      for (const child of elm.children) {
        if (child) {
          const child$ = props.build(child);
          result += child$.render(child);
        }
      }
      // console.log("[ssr]for - render result", result);
      return result;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
