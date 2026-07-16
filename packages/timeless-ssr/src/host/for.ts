import { TimelessElement, VNodeView } from "@timeless/timeless";

import { SSRBox } from "./box";

export type SSRFor = VNodeView<string> & {
  t: "for";
  // insert(idx: number, element: (TimelessElement | null)[]): void;
  // remove(idx: number, count: number): void;
  // refresh(data: any): void;
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRFor(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRFor {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "for",
    getType() {
      return "reactive";
    },
    render() {
      // console.log("[ssr]for - render", props.elm.children);
      if (!props.elm.children) return "";
      let result = "";
      for (const child of props.elm.children) {
        if (child) {
          const child$ = props.build(child);
          result += child$.render();
        }
      }
      // console.log("[ssr]for - render result", result);
      return result;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
