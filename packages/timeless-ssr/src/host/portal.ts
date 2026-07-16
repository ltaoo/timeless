import { TimelessElement, VNodeView } from "@timeless/timeless";
import { SSRBox } from "./box";
import { _collectPortal } from "../index";

export type SSRPortal = VNodeView<string> & {
  t: "portal";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRPortal(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRPortal {
  const t = "portal";
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t,
    getType() {
      return "portal";
    },
    render() {
      if (!props.elm.children) return "";
      let html = "";
      for (const child of props.elm.children) {
        if (child) {
          const child$ = props.build(child);
          html += child$.render();
        }
      }
      if (html) {
        _collectPortal(html);
      }
      // Portal produces 0 inline nodes
      return "";
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
