import { TimelessElement, VNodeView } from "@timeless/timeless";

import { SSRBox } from "./box";

export type SSRInput = VNodeView<string> & {
  t: "input";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRInput(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRInput {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "input",
    getType() {
      return "input";
    },
    render() {
      const attrs = box$.buildAttributes(props.elm.state);
      attrs.push(`type="text"`);
      if (props.elm.state.value) {
        attrs.push(`value="${props.elm.state.value}"`);
      }
      return `<input${box$.stringifyAttrs(attrs)}/>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
