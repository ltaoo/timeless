import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";

export type SSRButton = VNodeView<string> & {
  t: "view";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRButton(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRButton {
  const t = "view";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "button";
    },
    render() {
      const attrs = box$.buildAttributes(props.elm.state);
      const children = box$.buildChildren(props.elm.children, props.build);
      return `<button${box$.stringifyAttrs(attrs)}>${children}</button>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {
      return "";
    },
  };
}
