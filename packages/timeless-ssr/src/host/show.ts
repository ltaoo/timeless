import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRShow = VNodeView<string> & {
  t: "show";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRShow(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRShow {
  const t = "show";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "reactive";
    },
    render() {
      if (!props.elm.children) {
        return "";
      }
      let result = "";
      for (let i = 0; i < props.elm.children.length; i++) {
        const child = props.elm.children[i];
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
