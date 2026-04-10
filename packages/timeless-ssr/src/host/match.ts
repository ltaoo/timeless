import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRMatch = VNodeView<string> & {
  t: "match";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRMatch(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRMatch {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "match",
    getType() {
      return "reactive";
    },
    isDocumentFragment() {
      return true;
    },
    render(elm: TimelessElement) {
      if (!elm.children) return "";
      let result = "";
      for (const child of elm.children) {
        if (child) {
          const child$ = props.build(child);
          result += child$.render(child);
        }
      }
      return result;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
