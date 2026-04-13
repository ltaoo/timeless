import { TimelessElement, VNodeView } from "@timeless/timeless";

import { SSRBox } from "./box";

export type SSRInput = VNodeView<string> & {
  t: "input";
  render(elm: TimelessElement): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRInput(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
}): SSRInput {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "input",
    getType() {
      return "input";
    },
    render(elm: TimelessElement) {
      const attrs = box$.buildAttributes(elm.state);
      attrs.push(`type="text"`);
      if (elm.state.value) {
        attrs.push(`value="${elm.state.value}"`);
      }
      return `<input${box$.stringifyAttrs(attrs)} />`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
