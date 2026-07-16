import { TimelessElement, VNodeView } from "@timeless/timeless";

import { SSRBox } from "./box";

export type SSRCheckbox = VNodeView<string> & {
  t: "checkbox";
  render(): string;
  hydrate(elm: TimelessElement, $dom: any): void;
};

export function SSRCheckbox(props: {
  build: (elm: TimelessElement) => VNodeView<string>;
  elm: TimelessElement;
}): SSRCheckbox {
  const box$ = SSRBox();
  return {
    ...box$.methods,
    t: "checkbox",
    getType() {
      return "input";
    },
    render() {
      const attrs = box$.buildAttributes(props.elm.state);
      attrs.push(`type="checkbox"`);
      if (props.elm.state.checked) {
        attrs.push(`checked="checked"`);
      }
      return `<input${box$.stringifyAttrs(attrs)}/>`;
    },
    hydrate(elm: TimelessElement, $dom: any) {},
  };
}
