import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRButton = VNodeView<string> & {
  t: "view";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRButton(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRButton {
  const t = "view";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "button";
    },
    render(elm: TimelessElement) {
      const attrs = box$.buildAttributes(elm.state);
      const children = box$.buildChildren(elm.children, props.build);
      return `<button${attrs}>${children}</button>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
