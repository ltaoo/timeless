import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRMatch = VNodeView<string> & {
  t: "match";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRMatch(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
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
    render() {
      if (!props.elm.children) return "";
      let result = "";
      for (const child of props.elm.children) {
        if (child) {
          const child$ = props.build(child);
          result += child$.render();
        }
      }
      return result;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
