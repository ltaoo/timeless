import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRFragment = VNodeView<string> & {
  t: "fragment";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRFragment(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRFragment {
  const t = "fragment";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "fragment";
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
