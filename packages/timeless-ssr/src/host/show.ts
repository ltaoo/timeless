import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRShow = VNodeView<string> & {
  t: "show";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRShow(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRShow {
  const t = "show";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "reactive";
    },
    render(elm: TimelessElement) {
      if (!elm.children) {
        return "";
      }
      let result = "";
      for (let i = 0; i < elm.children.length; i++) {
        const child = elm.children[i];
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
